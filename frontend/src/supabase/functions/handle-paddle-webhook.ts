import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { verifyWebhook } from "paddle";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("paddle-signature")!;
  const rawBody = await req.text();

  try {
    const isValid = verifyWebhook({
      signature,
      body: rawBody,
      secretKey: Deno.env.get("PADDLE_WEBHOOK_SECRET")!,
    });

    if (!isValid) throw new Error("Invalid signature");

    const event = JSON.parse(rawBody);

    if (event.event_type === "subscription.created") {
      const { passthrough, id: paddleUserId } = event.data;
      const { userId } = JSON.parse(passthrough);

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role: "premium-user" },
      });

      if (error) throw error;

      await supabaseAdmin.from("purchases").insert({
        user_id: userId,
        paddle_user_id: paddleUserId,
        subscription_id: event.data.subscription_id,
        plan_id: event.data.plan_id,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
