import { SupabaseClient } from "@supabase/supabase-js";

export interface TransactionData {
  userId: string;
  orderId: number;
  customerId: number;
  productId: number;
  variantId: number;
  orderNumber: string;
  total: number;
  status: string;
  refunded: boolean;
  currency: string;
  createdAt: string;
}

export const insertTransaction = async (
  supabase: SupabaseClient,
  transaction: TransactionData
) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: transaction.userId,
        order_id: transaction.orderId,
        customer_id: transaction.customerId,
        product_id: transaction.productId,
        variant_id: transaction.variantId,
        order_number: transaction.orderNumber,
        total: transaction.total,
        status: transaction.status,
        refunded: transaction.refunded,
        currency: transaction.currency,
        lemon_squeezy_created_at: transaction.createdAt,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const updateTransactionStatus = async (
  supabase: SupabaseClient,
  orderId: number,
  status: string,
  refunded: boolean = false
) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({
      status,
      refunded,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .select();

  if (error) {
    throw error;
  }

  return data;
};

export const getTransactionByOrderId = async (
  supabase: SupabaseClient,
  orderId: number
) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
};
