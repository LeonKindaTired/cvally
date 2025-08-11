import { handlePaddleWebhook } from "@/paddle/paddleWebhook";
import type { APIRoute } from "astro";

export const post: APIRoute = async ({ request }: any) => {
  try {
    const event = await request.json();
    await handlePaddleWebhook(event);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
    });
  }
};
