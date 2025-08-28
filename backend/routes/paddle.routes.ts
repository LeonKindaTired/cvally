import express from "express";
import dotenv from "dotenv";
import { supabaseAdmin } from "../supabase/supabase";

dotenv.config();

const router = express.Router();

const environment = process.env.MODE === "production";

router.post(
  "/paddle-webhook",
  express.raw({ type: "*/*" }),
  async (req, res) => {
    try {
      const signature = req.headers["paddle-signature"] as string;
      const rawBody = req.body.toString("utf8");

      const payload = JSON.parse(rawBody);
      const eventType = payload.event_type;
      const transactionId = payload.data?.custom_data?.transaction_id;
      const userId = payload.data?.custom_data?.user_id;
      const subscriptionId = payload.data?.subscription_id;

      console.log("📩 Incoming webhook:", eventType, payload);

      if (eventType.startsWith("transaction.") && transactionId && userId) {
        let newStatus: "completed" | "failed" | "pending" = "pending";

        if (
          eventType === "transaction.completed" ||
          eventType === "transaction.payment_succeeded" ||
          eventType === "transaction.updated"
        ) {
          if (
            payload.data?.status === "paid" ||
            payload.data?.status === "completed"
          ) {
            newStatus = "completed";
          }
        } else if (
          eventType === "transaction.payment_failed" ||
          eventType === "transaction.failed" ||
          payload.data?.status === "failed"
        ) {
          newStatus = "failed";
        }

        await supabaseAdmin
          .from("transactions")
          .update({
            status: newStatus,
            paddle_data: payload,
            subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", transactionId);

        if (newStatus === "completed") {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({ role: "premium-user", subscription_id: subscriptionId })
            .eq("id", userId);

          if (error) throw error;
          console.log(`✅ User ${userId} upgraded to premium`);
        } else {
          console.log(
            `⚠️ Payment not completed for transaction ${transactionId}, event: ${eventType}`
          );
        }
      }

      if (
        eventType === "subscription.canceled" ||
        eventType === "subscription.expired" ||
        eventType === "subscription.past_due"
      ) {
        const userId = payload.data?.custom_data?.user_id;
        const subscriptionId = payload.data?.id;

        if (userId && subscriptionId) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({ role: "user", subscription_id: null })
            .eq("id", userId);

          if (error) throw error;
          console.log(`⬇️ User ${userId} downgraded to free plan`);
        } else {
          console.warn(
            `⚠️ Missing userId (${userId}) or subscriptionId (${subscriptionId}) for downgrade`
          );
        }
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.use(express.json());

router.post("/cancel-subscription", async (req, res) => {
  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ error: "subscriptionId is required" });
  }

  try {
    const params = new URLSearchParams();
    params.append("vendor_id", process.env.PADDLE_VENDOR_ID_SANDBOX!);
    params.append("vendor_auth_code", process.env.PADDLE_API_KEY_SANDBOX!);
    params.append("subscription_id", subscriptionId);

    const paddleUrl = environment
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";

    const response = await fetch(
      `${paddleUrl}/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY_SANDBOX}`,
        },
      }
    );

    const data: any = await response.json();

    if (data) {
      console.log("Paddle request_id:", data.meta.request_id);
    }

    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create-transaction", async (req, res) => {
  try {
    const { transaction_id, user_id, status } = req.body;

    const { error } = await supabaseAdmin.from("transactions").insert({
      id: transaction_id,
      user_id: user_id,
      status: status || "pending",
    });

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

router.get("/transaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Transaction not found" });

    res.status(200).json(data);
  } catch (error) {
    console.error("Transaction fetch error:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

router.get("/subscription/:id", async (req, res) => {
  const subscriptionId = req.params.id;

  try {
    const paddleUrl = environment
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";

    const response = await fetch(
      `${paddleUrl}/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY_SANDBOX}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching subscription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update-transaction", async (req, res) => {
  try {
    const { transaction_id, status, paddle_data } = req.body;

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({
        status: status,
        paddle_data: paddle_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction_id);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Transaction update error:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

router.post("/verify-purchase", async (req, res) => {
  console.log("🔍 Verifying purchase...");

  try {
    console.log("📦 Request body:", req.body);
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      console.error("❌ Missing sessionId or userId");
      return res.status(400).json({ error: "Missing sessionId or userId" });
    }

    const paddleUrl = environment
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";

    const response = await fetch(
      `${paddleUrl}/checkout-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_SECRET_KEY_SANDBOX}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Paddle API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({
        error: `Paddle API error: ${response.statusText}`,
      });
    }

    const sessionData: any = await response.json();
    console.log(
      "📋 Paddle session data:",
      JSON.stringify(sessionData, null, 2)
    );

    if (sessionData.data.status === "completed") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: {
          role: "premium-user",
          updated_at: new Date().toISOString(),
        },
      });

      if (error) {
        console.error("❌ User update error:", error);
        return res.status(500).json({ error: "User update failed" });
      }

      const { data: updatedUser } = await supabaseAdmin.auth.admin.getUserById(
        userId
      );
      console.log("Updated user role:", updatedUser.user?.app_metadata?.role);

      return res.json({ success: true });
    }

    console.log(
      "⚠️ Payment not completed yet. Status:",
      sessionData.data.status
    );
    res.status(400).json({ error: "Payment not completed" });
  } catch (error: any) {
    console.error("❌ Verification error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.post("/webhook-debug", express.text({ type: "*/*" }), (req, res) => {
  console.log("🔔 Received webhook debug:");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  res.json({ received: true });
});

router.post("/upgrade-user", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: "premium-user" })
    .eq("id", userId);

  if (error) return res.status(500).json({ error: error.message });

  console.log(`User ${userId} upgraded to premium-user via manual API`);
  res.status(200).json({ upgraded: true });
});

export default router;
