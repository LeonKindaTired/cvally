import { SupabaseClient } from "@supabase/supabase-js";

export async function insertSubscription(
  supabase: SupabaseClient,
  {
    customerId,
    productId,
    variantId,
    status,
    cancelled,
    renewsAt,
    endsAt,
    createdAt,
    updatedAt,
  }: {
    customerId: string;
    productId: string;
    variantId: string;
    status: string;
    cancelled: boolean;
    renewsAt: string;
    endsAt: string | null;
    createdAt: string;
    updatedAt: string;
  }
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        customer_id: customerId,
        product_id: productId,
        variant_id: variantId,
        status,
        cancelled,
        renews_at: renewsAt,
        ends_at: endsAt,
        created_at: createdAt,
        updated_at: updatedAt,
      },
      { onConflict: "customer_id" }
    )
    .select();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function hasSubscriptionEnded(
  supabase: SupabaseClient,
  customerId: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("ends_at")
    .eq("customer_id", customerId)
    .single();

  if (error) {
    console.error(error);
    return true;
  }
  console.log(data);
  if (data.ends_at === null) {
    return false;
  }

  const endDate = new Date(data.ends_at);

  return new Date() > endDate;
}

export async function getSubscriptionId(
  supabase: SupabaseClient,
  customerId: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("customer_id", customerId)
    .single();

  if (error) {
    console.error("Error fetching subscription ID:", error);
    throw error;
  }

  return data?.id;
}
