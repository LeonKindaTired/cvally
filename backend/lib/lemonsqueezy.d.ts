interface Subscription {
  type: "subscriptions";
  id: "1";
  attributes: {
    store_id: 1;
    customer_id: 1;
    order_id: 1;
    order_item_id: 1;
    product_id: 1;
    variant_id: 1;
    product_name: "Lemonade";
    variant_name: "Citrus Blast";
    user_name: "John Doe";
    user_email: "johndoe@example.com";
    status: "active";
    status_formatted: "Active";
    card_brand: "visa";
    card_last_four: "4242";
    payment_processor: "stripe";
    pause: null;
    cancelled: false;
    trial_ends_at: null;
    billing_anchor: 12;
    first_subscription_item: {
      id: 1;
      subscription_id: 1;
      price_id: 1;
      quantity: 5;
      created_at: "2021-08-11T13:47:28.000000Z";
      updated_at: "2021-08-11T13:47:28.000000Z";
    };
    urls: {
      update_payment_method: "https://my-store.lemonsqueezy.com/subscription/1/payment-details?expires=1666869343&signature=9985e3bf9007840aeb3951412be475abc17439c449c1af3e56e08e45e1345413";
      customer_portal: "https://my-store.lemonsqueezy.com/billing?expires=1666869343&signature=82ae290ceac8edd4190c82825dd73a8743346d894a8ddbc4898b97eb96d105a5";
      customer_portal_update_subscription: "https://my-store.lemonsqueezy.com/billing/1/update?expires=1666869343&signature=e4fabc7ee703664d644bba9e79a9cd3dd00622308b335f3c166787f0b18999f2";
    };
    renews_at: "2022-11-12T00:00:00.000000Z";
    ends_at: null;
    created_at: "2021-08-11T13:47:27.000000Z";
    updated_at: "2021-08-11T13:54:19.000000Z";
    test_mode: false;
  };
}
