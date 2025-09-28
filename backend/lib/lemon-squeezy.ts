import {
  createCheckout,
  getCustomer,
  getVariant,
  lemonSqueezySetup,
  listProducts,
  listVariants,
} from "@lemonsqueezy/lemonsqueezy.js";

const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1";

const LEMON_API_KEY =
  process.env.MODE === "sandbox"
    ? process.env.LEMON_API_KEY_TEST
    : process.env.LEMON_API_KEY_PROD;

const PUBLIC_APP_URL =
  process.env.MODE === "sandbox"
    ? process.env.FRONTEND_URL_SANDBOX
    : process.env.FRONTEND_URL_PRODUCTION;

export async function configureLemonSqueezy() {
  const requiredVars = [
    "LEMON_API_KEY_TEST",
    "LEMON_API_KEY_PROD",
    "LEMON_STORE_ID",
    "LEMON_WEBHOOK_SECRET_TEST",
    "LEMON_WEBHOOK_SECRET_PROD",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    return {
      error: `Missing required LemonSqueezy env variables: ${missingVars.join(
        ", "
      )}. Please, set them in your .env file.`,
    };
  }

  lemonSqueezySetup({ apiKey: LEMON_API_KEY });
  return { error: null };
}

async function lemonFetch(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY not set in .env");
  }

  const res = await fetch(`${LEMONSQUEEZY_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lemon Squeezy API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function getProduct(productId: string) {
  return lemonFetch(`/products/${productId}`);
}

export async function getAllProducts() {
  const { error } = await configureLemonSqueezy();

  if (error) {
    console.error(error);
    return [];
  }

  const products = await listProducts({
    filter: {
      storeId: process.env.LEMON_STORE_ID!,
    },
  });

  if (!products.data) {
    return [];
  }

  return products.data.data;
}

export async function getFirstVariant(productId: string) {
  const { error } = await configureLemonSqueezy();
  if (error) {
    console.error(error);
    return null;
  }

  const variants = await listVariants({
    filter: {
      productId,
    },
  });

  if (!variants.data) {
    return null;
  }

  return variants.data.data[0];
}

export async function createCheckoutUrl({
  variantId,
  userEmail = "",
  userId = "",
  embed = false,
}: {
  variantId: string;
  userEmail: string;
  userId: string;
  embed?: boolean;
}) {
  const { error } = await configureLemonSqueezy();
  if (error) {
    console.error(error);
    return null;
  }

  if (!process.env.LEMON_STORE_ID) {
    console.error(
      "Lemonsqueezy store ID is not defined in environment variables."
    );
  }
  if (!PUBLIC_APP_URL) {
    console.warn("PUBLIC_APP_URL is not defined, using default redirect URL.");
    return null;
  }

  const checkout = await createCheckout(
    process.env.LEMON_STORE_ID!,
    variantId,
    {
      checkoutOptions: {
        embed,
        media: true,
        logo: !embed,
      },
      checkoutData: {
        email: userEmail,
        custom: {
          user_id: userId,
        },
      },
      productOptions: {
        enabledVariants: [parseInt(variantId)],
        redirectUrl: `${PUBLIC_APP_URL || "http://localhost:5173"}/`,
      },
    }
  );

  if (!checkout.data?.data?.attributes?.url) {
    console.error("Failed to create checkout URL");
    return null;
  }

  return checkout.data?.data?.attributes?.url;
}

export async function createCustomerPortal(customerId: string) {
  const { error } = await configureLemonSqueezy();

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = await getCustomer(customerId);
  if (!data?.data?.attributes?.urls?.customer_portal) {
    return null;
  }

  return data?.data?.attributes.urls.customer_portal;
}

export async function getProductVariant(variantId: number | string) {
  const { error } = await configureLemonSqueezy();
  if (error) {
    console.error(error);
    return null;
  }
  const variant = await getVariant(variantId);
  return variant?.data?.data;
}

export async function getSubscription(subscriptionId: string) {
  return lemonFetch(`/subscriptions/${subscriptionId}`);
}
