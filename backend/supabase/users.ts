import { SupabaseClient } from "@supabase/supabase-js";

export async function updateCustomerId(
  supabase: SupabaseClient,
  {
    userId,
    customerId,
  }: {
    userId: string;
    customerId: string;
  }
) {
  const { data, error } = await supabase
    .from("users")
    .update({
      customer_id: customerId,
    })
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getCustomerId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("customer_id")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data.customer_id;
}

export async function upsertProduct(
  supabase: SupabaseClient,
  {
    variant_id,
    product_id,
    name,
    price,
  }: { variant_id: string; product_id: string; name: string; price: number }
) {
  const { data, error } = await supabase
    .from("products")
    .upsert(
      {
        variant_id,
        product_id,
        name,
        price,
      },
      { onConflict: "variant_id" }
    )
    .select();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
