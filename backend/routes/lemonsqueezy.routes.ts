import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import {
  createCheckoutUrl,
  createCustomerPortal,
  getProductVariant,
} from "../lib/lemon-squeezy";
import { supabaseAdmin } from "../supabase/supabase";
import {
  getCustomerId,
  updateCustomerId,
  upsertProduct,
} from "../supabase/users";
import { getSubscriptionId } from "../supabase/subscriptions";
import {
  insertTransaction,
  updateTransactionStatus,
  getTransactionByOrderId,
} from "../supabase/transactions";

const router = express.Router();

const subscriptionEvents = [
  "subscription_created",
  "subscription_updated",
  "subscription_resumed",
  "subscription_paused",
  "subscription_cancelled",
  "subscription_unpaused",
  "subscription_expired",
];

const transactionEvents = ["order_created", "order_refunded"];

interface Subscription {
  id: string;
  attributes: {
    product_id: number;
    variant_id: number;
    product_name: string;
    customer_id: number;
    status: string;
    cancelled: boolean;
    renews_at: string;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    first_subscription_item: {
      subscription_id: number;
    };
  };
}

interface Order {
  id: string;
  attributes: {
    order_number: string;
    customer_id: number;
    total: number;
    status: string;
    refunded: boolean;
    currency: string;
    created_at: string;
    first_order_item: {
      product_id: number;
      variant_id: number;
    };
  };
}

interface LemonSqueezyWebhookData {
  meta: {
    event_name: string;
    custom_data?: {
      user_id: string;
    };
  };
  data: Subscription | Order;
}

interface SubscriptionData {
  customerId: string;
  subscriptionId: string;
  productId: string;
  variantId: string;
  status: string;
  cancelled: boolean;
  renewsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function isSubscription(data: any): data is Subscription {
  return (
    data.attributes && data.attributes.first_subscription_item !== undefined
  );
}

function isOrder(data: any): data is Order {
  return data.attributes && data.attributes.first_order_item !== undefined;
}

const verifyWebhookSignature = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log("🔐 Verifying webhook signature...");

  if (!process.env.LEMON_WEBHOOK_SECRET) {
    console.error("❌ LEMON_WEBHOOK_SECRET is not set");
    return res.status(500).send("Lemon Squeezy Webhook Secret not set in .env");
  }

  const rawBody = (req as any).rawBody;

  if (!rawBody) {
    console.error("❌ Raw body is missing");
    return res.status(400).send("Missing raw body");
  }

  const secret = process.env.LEMON_WEBHOOK_SECRET;
  const signatureHeader = req.get("X-Signature") || "";

  console.log("📊 Debug info:", {
    rawBodyType: typeof rawBody,
    isBuffer: Buffer.isBuffer(rawBody),
    rawBodyLength: rawBody.length,
    signatureHeader: signatureHeader
      ? `${signatureHeader.substring(0, 20)}...`
      : "MISSING",
    secretSet: !!secret,
  });

  if (!signatureHeader) {
    console.error("❌ X-Signature header is missing");
    return res.status(400).send("Missing X-Signature header");
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest("hex");

    console.log("🔍 Signature comparison:", {
      calculated: calculatedSignature.substring(0, 20) + "...",
      received: signatureHeader.substring(0, 20) + "...",
      match: calculatedSignature === signatureHeader,
    });

    if (calculatedSignature !== signatureHeader) {
      console.error("❌ Signature verification failed");
      return res.status(400).send("Invalid signature.");
    }

    console.log("✅ Signature verified successfully");
    next();
  } catch (error) {
    console.error("❌ Error during signature verification:", error);
    return res.status(500).send("Error during signature verification");
  }
};

router.post(
  "/lemon-webhook",
  verifyWebhookSignature,
  async (req: express.Request, res: express.Response) => {
    try {
      console.log("🔄 Processing webhook...");

      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        console.error("❌ Raw body is missing");
        return res.status(400).send("Missing raw body");
      }

      const data = JSON.parse(rawBody.toString()) as LemonSqueezyWebhookData;
      console.log("📨 Webhook event:", data.meta.event_name);

      const userId = data.meta.custom_data?.user_id;
      if (!userId) {
        console.error("❌ User ID not found in custom_data");
        return res.status(400).send("User ID not found");
      }

      if (subscriptionEvents.includes(data.meta.event_name)) {
        if (!isSubscription(data.data)) {
          console.error("❌ Invalid subscription data structure");
          return res.status(400).send("Invalid subscription data");
        }

        const subscription = data.data;
        const productId = subscription.attributes.product_id;
        const variantId = subscription.attributes.variant_id;
        const productName = subscription.attributes.product_name;

        console.log("📋 Subscription data:", {
          userId,
          productId,
          variantId,
          productName,
        });

        const variant = await getProductVariant(variantId);
        const price = variant?.attributes?.price;

        const customerId = subscription.attributes.customer_id;
        if (!customerId) {
          console.error("❌ Customer ID not found");
          return res.status(400).send("Customer ID not found");
        }

        const productUpsert = upsertProduct(supabaseAdmin, {
          variant_id: variantId.toString(),
          product_id: productId.toString(),
          name: productName,
          price: price!,
        });

        const customerUpsert = updateCustomerId(supabaseAdmin, {
          userId,
          customerId: customerId.toString(),
        });

        await Promise.all([productUpsert, customerUpsert]);

        const subscriptionStatus = subscription.attributes.status;
        if (["active", "trialing"].includes(subscriptionStatus)) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              role: "premium-user",
              is_premium: true,
              premium_expires_at: null,
              subscription_id:
                subscription.attributes.first_subscription_item.subscription_id.toString(),
            })
            .eq("id", userId);

          if (error) console.error("❌ Error upgrading user:", error);
          else console.log(`✅ User ${userId} upgraded via subscription`);
        } else if (subscriptionStatus === "cancelled") {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              role: "premium-user",
              is_premium: true,
              premium_expires_at: subscription.attributes.ends_at,
              subscription_status: "cancelled",
            })
            .eq("id", userId);

          if (error)
            console.error("❌ Error handling cancelled subscription:", error);
          else
            console.log(
              `📉 User ${userId} subscription cancelled, premium access until: ${subscription.attributes.ends_at}`
            );
        } else if (["expired", "paused"].includes(subscriptionStatus)) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              role: "user",
              is_premium: false,
              premium_expires_at: null,
              subscription_id: null,
            })
            .eq("id", userId);

          if (error) console.error("❌ Error downgrading user:", error);
          else
            console.log(
              `📉 User ${userId} downgraded via subscription status: ${subscriptionStatus}`
            );
        }

        const subscriptionData: SubscriptionData = {
          customerId: customerId.toString(),
          subscriptionId:
            subscription.attributes.first_subscription_item.subscription_id.toString(),
          productId: productId.toString(),
          variantId: variantId.toString(),
          status: subscription.attributes.status,
          cancelled: subscription.attributes.cancelled,
          renewsAt: subscription.attributes.renews_at,
          endsAt: subscription.attributes.ends_at,
          createdAt: subscription.attributes.created_at,
          updatedAt: subscription.attributes.updated_at,
        };

        console.log("✅ Subscription webhook processed successfully");
        return res.status(200).send("Subscription Processed");
      } else if (transactionEvents.includes(data.meta.event_name)) {
        if (!isOrder(data.data)) {
          console.error("❌ Invalid order data structure");
          return res.status(400).send("Invalid order data");
        }

        const order = data.data;
        const orderId = parseInt(order.id);
        const customerId = order.attributes.customer_id;
        const productId = order.attributes.first_order_item.product_id;
        const variantId = order.attributes.first_order_item.variant_id;

        console.log("💳 Transaction data:", {
          userId,
          orderId,
          customerId,
          productId,
          variantId,
          status: order.attributes.status,
          total: order.attributes.total,
        });

        const existingTransaction = await getTransactionByOrderId(
          supabaseAdmin,
          orderId
        );

        if (data.meta.event_name === "order_created") {
          if (existingTransaction) {
            console.log("🔄 Updating existing transaction");
            await updateTransactionStatus(
              supabaseAdmin,
              orderId,
              order.attributes.status,
              order.attributes.refunded
            );
          } else {
            console.log("🆕 Creating new transaction");
            await insertTransaction(supabaseAdmin, {
              userId,
              orderId,
              customerId,
              productId,
              variantId,
              orderNumber: order.attributes.order_number,
              total: order.attributes.total,
              status: order.attributes.status,
              refunded: order.attributes.refunded,
              currency: order.attributes.currency,
              createdAt: order.attributes.created_at,
            });
          }

          if (order.attributes.status === "paid") {
            try {
              const { error } = await supabaseAdmin
                .from("profiles")
                .update({
                  role: "premium-user",
                  subscription_id: orderId.toString(),
                })
                .eq("id", userId);

              if (error) throw error;
              console.log(
                `✅ User ${userId} upgraded to premium via successful order`
              );
            } catch (error) {
              console.error("❌ Error upgrading user to premium:", error);
            }
          }
        } else if (data.meta.event_name === "order_refunded") {
          if (existingTransaction) {
            console.log("💸 Processing refund");
            await updateTransactionStatus(
              supabaseAdmin,
              orderId,
              "refunded",
              true
            );

            try {
              const { error } = await supabaseAdmin
                .from("profiles")
                .update({
                  role: "user",
                  subscription_id: null,
                })
                .eq("id", userId);

              if (error) throw error;
              console.log(`📉 User ${userId} downgraded due to refund`);
            } catch (error) {
              console.error("❌ Error downgrading user:", error);
            }
          }
        }

        console.log("✅ Transaction webhook processed successfully");
        return res.status(200).send("Transaction Processed");
      }

      console.log("ℹ️ Unhandled event received:", data.meta.event_name);
      return res.status(200).send("Webhook received");
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

router.use(express.json());

router.get("/products", async (req, res) => {
  try {
    console.log("🛍️ Fetching products...");
    const response = await fetch("https://api.lemonsqueezy.com/v1/products", {
      headers: {
        Authorization: `Bearer ${process.env.LEMON_API_KEY_TEST}`,
        Accept: "application/vnd.api+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Lemon Squeezy API error: ${response.status}`);
    }

    const data = await response.json();
    const subscriptionProducts = data.data.filter((product: any) =>
      product.attributes?.name?.toLowerCase().includes("subscription")
    );

    const productsWithVariants = await Promise.all(
      subscriptionProducts.map(async (product: any) => {
        const variantsResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/products/${product.id}/variants`,
          {
            headers: {
              Authorization: `Bearer ${process.env.LEMON_API_KEY_TEST}`,
              Accept: "application/vnd.api+json",
            },
          }
        );

        if (!variantsResponse.ok) {
          throw new Error(`Failed to fetch variants for product ${product.id}`);
        }

        const variantsData = await variantsResponse.json();
        const firstVariant = variantsData.data[0];

        return {
          id: product.id,
          name: product.attributes.name,
          price: product.attributes.price,
          description: product.attributes.description || "",
          variant_id: firstVariant?.id,
          test_mode: product.attributes.test_mode,
        };
      })
    );

    res.json(productsWithVariants);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/checkout", async (req: Request, res: Response) => {
  try {
    console.log("💰 Checkout request:", req.body);
    const { variantId, userId, email } = req.body;

    if (!variantId) {
      return res.status(400).json({ error: "Missing variantId" });
    }
    if (!userId || !email) {
      return res.status(400).json({ error: "Missing user data" });
    }

    const checkoutUrl = await createCheckoutUrl({
      variantId: variantId,
      userEmail: email,
      userId,
    });

    res.json({ checkoutUrl });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout URL" });
  }
});

router.get("/portal/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const customerId = await getCustomerId(supabaseAdmin, userId);
    const subscriptionId = await getSubscriptionId(supabaseAdmin, customerId);
    const url = await createCustomerPortal(subscriptionId);
    res.json({ url });
  } catch (err) {
    console.error("❌ Customer portal error:", err);
    res.status(500).json({ error: "Failed to create portal URL" });
  }
});

router.get("/transactions/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(transactions);
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/subscriptions/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMON_API_KEY_TEST}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/subscriptions/:id/cancel", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${req.params.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.LEMON_API_KEY_TEST}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            id: req.params.id,
            attributes: {
              cancelled: true,
            },
          },
        }),
      }
    );

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
