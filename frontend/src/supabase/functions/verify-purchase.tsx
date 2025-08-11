// supabase/functions/verify-purchase/index.ts
import { serve } from "std/http/server.ts";
import { createClient } from "supabase";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { sessionId, userId } = await req.json();

  try {
    const response = await fetch(
      `https://api.paddle.com/checkout-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${Deno.env.get("PADDLE_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to verify session");

    const session = await response.json();

    if (session.status === "completed") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        app_metadata: { role: "premium-user" },
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Payment not completed" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
