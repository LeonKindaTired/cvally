// src/components/PaddleButton.tsx
import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useThemeContext } from "@/context/themeContext";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { v4 as uuidv4 } from "uuid";

const PaddleButton = () => {
  const [paddle, setPaddle] = useState<Paddle>();
  const { theme } = useThemeContext();
  const { session } = useAuth();

  // Get backend URL from environment
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const environment =
    import.meta.env.MODE === "production" ? "production" : "sandbox";
  const baseUrl =
    environment === "production"
      ? import.meta.env.VITE_BASE_URL_PRODUCTION
      : import.meta.env.VITE_BASE_URL_SANDBOX;

  useEffect(() => {
    try {
      initializePaddle({
        environment: environment,
        token:
          environment === "production"
            ? import.meta.env.VITE_PADDLE_PUBLIC_KEY_PRODUCTION
            : import.meta.env.VITE_PADDLE_PUBLIC_KEY_SANDBOX,
      }).then((paddle) => {
        setPaddle(paddle);
        console.log("Paddle initialized");
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCheckout = () => {
    if (!paddle) {
      console.error("Paddle not initialized");
      return;
    }

    if (!session?.user?.id) {
      console.error("User session is incomplete");
      return;
    }

    // Generate unique transaction ID
    const transactionId = `txn_${uuidv4()}`;

    const options = {
      items: [
        {
          priceId:
            environment === "production"
              ? import.meta.env.VITE_PADDLE_PRODUCT_ID_PRODUCTION
              : import.meta.env.VITE_PADDLE_PRODUCT_ID_SANDBOX,
          quantity: 1,
        },
      ],
      settings: {
        displayMode: "overlay" as const,
        theme: theme,
        // Use transaction ID in success URL
        successUrl: `${baseUrl}/success?txn_id=${transactionId}`,
      },
      // Pass user ID and transaction ID to webhook
      customData: {
        user_id: session.user.id,
        transaction_id: transactionId,
      },
    };

    (paddle.Checkout.open as any)(options);

    // Create transaction record immediately
    fetch(`${backendUrl}/api/create-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: transactionId,
        user_id: session.user.id,
        status: "pending",
      }),
    }).catch((err) => console.error("Transaction creation failed:", err));
  };

  return (
    <Button
      className="px-10 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      size="lg"
      onClick={handleCheckout}
    >
      <Sparkles className="mr-3" />
      Upgrade Now
    </Button>
  );
};

export default PaddleButton;
