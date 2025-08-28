import { supabase } from "@/supabase/supabase-client";

export async function handlePaddleWebhook(event: any) {
  try {
    const eventType = event.event_type;

    if (eventType === "transaction.completed") {
      const transactionId = event.data.custom_data?.transaction_id;
      const userId = event.data.custom_data?.user_id;

      if (!transactionId || !userId) {
        console.error("Missing transaction data", event.data);
        return;
      }

      await supabase
        .from("transactions")
        .update({
          status: "verified",
          paddle_data: event.data,
        })
        .eq("id", transactionId);

      await supabase
        .from("profiles")
        .update({ role: "premium" })
        .eq("id", userId);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
}
