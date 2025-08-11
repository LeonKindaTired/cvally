import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fetch from "node-fetch";
import generationRoutes from "./routes/generation.routes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Log environment status on startup
console.log("🟢 Starting server...");
console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🚀 Mode: ${process.env.MODE || "sandbox"}`);

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure CORS
const MODE = process.env.MODE || "sandbox";
const allowedOrigin =
  MODE === "production"
    ? process.env.FRONTEND_URL_PRODUCTION
    : process.env.FRONTEND_URL_SANDBOX;

console.log(`🌐 Allowing CORS for origin: ${allowedOrigin}`);

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(
    `📥 [${new Date().toISOString()}] ${req.method} ${req.path} ${
      req.body ? "with body" : ""
    }`
  );
  next();
});

// Parse JSON bodies
app.use(express.json());

function verifyPaddleWebhook(
  signature: string,
  body: string,
  secretKey: string
): boolean {
  // 1. Check if we have required parameters
  if (!signature || !secretKey) return false;

  // 2. Extract timestamp and signatures
  const signatureParts = signature.split(";");
  const signatureItems: Record<string, string> = {};

  signatureParts.forEach((item) => {
    const [key, value] = item.split("=");
    if (key && value) signatureItems[key] = value;
  });

  // 3. Validate timestamp (prevent replay attacks)
  const timestamp = parseInt(signatureItems["t"], 10);
  const now = Date.now();
  const timeDiff = now - timestamp;

  if (isNaN(timestamp)) {
    console.error("Invalid timestamp format");
    return false;
  }

  if (timeDiff > 300000) {
    // 5 minutes
    console.error("Webhook timestamp expired");
    return false;
  }

  // 4. Compute expected signature
  const signedPayload = `${timestamp}:${body}`;
  const computedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(signedPayload)
    .digest("hex");

  // 5. Compare signatures
  return signatureItems["h1"] === computedSignature;
}

// Create transaction endpoint
app.post("/api/create-transaction", async (req, res) => {
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

// Get transaction status endpoint
app.get("/api/transaction/:id", async (req, res) => {
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

// Update transaction endpoint
app.post("/api/update-transaction", async (req, res) => {
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

// Paddle webhook endpoint
app.post(
  "/api/paddle-webhook",
  express.text({ type: "*/*" }),
  async (req, res) => {
    console.log("🔔 Received Paddle webhook");

    try {
      const signature = req.headers["paddle-signature"] as string;
      const rawBody = req.body;

      // Validate signature and secret
      if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) {
        console.error("❌ Missing signature or webhook secret");
        return res
          .status(401)
          .json({ error: "Missing signature or webhook secret" });
      }

      // Verify webhook signature
      const isValid = verifyPaddleWebhook(
        signature,
        rawBody,
        process.env.PADDLE_WEBHOOK_SECRET
      );

      if (!isValid) {
        console.error("❌ Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Parse webhook event
      const event = JSON.parse(rawBody);
      console.log(`🔔 Webhook event: ${event.event_type}`);

      // Handle subscription creation
      if (event.event_type === "subscription.created") {
        const { passthrough, user_id } = event.data;

        // Parse passthrough data
        let userId: string;
        try {
          userId = JSON.parse(passthrough).userId;
          console.log(`🆔 Parsed user ID from passthrough: ${userId}`);
        } catch (error) {
          console.error("❌ Error parsing passthrough data:", error);
          return res.status(400).json({ error: "Invalid passthrough data" });
        }

        console.log(`⚡ Upgrading user ${userId} to premium`);

        // Update user role
        const { error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            app_metadata: { role: "premium-user" },
          });

        if (updateError) {
          console.error("❌ User update error:", updateError);
          return res.status(500).json({ error: "User update failed" });
        }

        // Store purchase record
        const { error: dbError } = await supabaseAdmin
          .from("purchases")
          .insert({
            user_id: userId,
            paddle_user_id: user_id,
            subscription_id: event.data.subscription_id,
            plan_id: event.data.plan_id,
            created_at: new Date().toISOString(),
          });

        if (dbError) {
          console.error("❌ Database error:", dbError);
        }

        console.log(`✅ User ${userId} upgraded successfully`);
      }

      // Handle transaction completion
      if (event.event_type === "transaction.completed") {
        const userId = event.data.custom_data?.user_id;
        const transactionId = event.data.custom_data?.transaction_id;

        if (!userId || !transactionId) {
          console.error("Missing required fields in webhook payload");
          return res.status(400).json({ error: "Missing required fields" });
        }

        // Update transaction status
        const { error: transactionError } = await supabaseAdmin
          .from("transactions")
          .update({
            status: "completed",
            paddle_data: event.data,
          })
          .eq("id", transactionId);

        if (transactionError) throw transactionError;

        // Upgrade user
        const { error: userError } = await supabaseAdmin
          .from("profiles")
          .update({ role: "premium" })
          .eq("id", userId);

        if (userError) throw userError;

        console.log(
          `✅ User ${userId} upgraded via transaction ${transactionId}`
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Purchase verification endpoint
app.post("/api/verify-purchase", async (req, res) => {
  console.log("🔍 Verifying purchase...");

  try {
    console.log("📦 Request body:", req.body);
    const { sessionId, userId } = req.body;

    // Validate input
    if (!sessionId || !userId) {
      console.error("❌ Missing sessionId or userId");
      return res.status(400).json({ error: "Missing sessionId or userId" });
    }

    // Call Paddle API to verify session
    const response = await fetch(
      `https://api.paddle.com/checkout-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_SECRET_KEY}`,
        },
      }
    );

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Paddle API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({
        error: `Paddle API error: ${response.statusText}`,
      });
    }

    // Parse response
    const sessionData: any = await response.json();
    console.log(
      "📋 Paddle session data:",
      JSON.stringify(sessionData, null, 2)
    );

    // Check payment status
    if (sessionData.data.status === "completed") {
      // CORRECTED: Use proper metadata structure
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

      // Additional check: Fetch updated user data
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

// Add to your Express server
app.post("/api/webhook-debug", express.text({ type: "*/*" }), (req, res) => {
  console.log("🔔 Received webhook debug:");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  res.json({ received: true });
});

// Existing routes
app.use("/api/generate", generationRoutes);

app.post("/api/upgrade-user", async (req, res) => {
  console.log("⚡ Received upgrade-user request");
  try {
    const { userId } = req.body;

    // Update user role optimistically
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: "premium-user" })
      .eq("id", userId);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("User upgrade error:", error);
    res.status(500).json({ error: "Failed to upgrade user" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log("🩺 Health check passed");
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mode: MODE,
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.use((req, res) => {
  console.error(`🚫 Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔑 Environment variables status:");
  console.log(`   MODE: ${MODE}`);
  console.log(
    `   SUPABASE_URL: ${process.env.SUPABASE_URL ? "✅" : "❌ Missing"}`
  );
  console.log(
    `   SUPABASE_SERVICE_ROLE_KEY: ${
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌ Missing"
    }`
  );
  console.log(
    `   PADDLE_SECRET_KEY: ${
      process.env.PADDLE_SECRET_KEY ? "✅" : "❌ Missing"
    }`
  );
  console.log(
    `   PADDLE_WEBHOOK_SECRET: ${
      process.env.PADDLE_WEBHOOK_SECRET ? "✅" : "❌ Missing"
    }`
  );
  console.log(
    `   FRONTEND_URL_SANDBOX: ${
      process.env.FRONTEND_URL_SANDBOX || "❌ Not set"
    }`
  );
  console.log(
    `   FRONTEND_URL_PRODUCTION: ${
      process.env.FRONTEND_URL_PRODUCTION || "❌ Not set"
    }`
  );
});
