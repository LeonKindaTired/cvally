import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/authContext";

interface CancelSubscriptionButtonProps {
  subscriptionId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CancelSubscriptionButton = ({
  subscriptionId,
  onSuccess,
  onError,
}: CancelSubscriptionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  const environment = import.meta.env.VITE_NODE_ENV === "production";
  const backendUrl = environment
    ? import.meta.env.VITE_BACKEND_URL_PRODUCTION
    : import.meta.env.VITE_BACKEND_URL_SANDBOX;

  const handleCancelSubscription = async () => {
    if (!subscriptionId) {
      onError?.("No subscription ID found");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period."
      )
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${backendUrl}/api/lemon/subscriptions/${subscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session?.user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel subscription");
      }

      const result = await response.json();

      if (result.success) {
        onSuccess?.();
        alert(
          "Your subscription has been cancelled successfully. You'll retain access until the end of your billing period."
        );
      } else {
        throw new Error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      onError?.(error instanceof Error ? error.message : "An error occurred");
      alert(
        "Failed to cancel subscription. Please try again or contact support."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCancelSubscription}
      disabled={isLoading}
      variant="destructive"
      size="lg"
      className="w-full max-w-xs"
    >
      {isLoading ? "Cancelling..." : "Cancel Subscription"}
    </Button>
  );
};

export default CancelSubscriptionButton;
