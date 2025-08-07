import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useThemeContext } from "@/context/themeContext";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";

const PaddleButton = () => {
  const [paddle, setPaddle] = useState<Paddle>();
  const { theme } = useThemeContext();

  const environment =
    import.meta.env.Mode === "production" ? "production" : "sandbox";

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
        console.log("Paddel initialized");
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCheckout = () => {
    if (!paddle) return console.error("Paddle not initialized");

    paddle.Checkout.open({
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
        displayMode: "overlay",
        theme: theme,
        successUrl: `${
          environment === "production"
            ? import.meta.env.VITE_BASE_URL_PRODUCTION
            : import.meta.env.VITE_BASE_URL_SANDBOX
        }/success`,
      },
    });
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
