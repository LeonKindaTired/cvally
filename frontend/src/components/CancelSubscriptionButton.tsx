import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/authContext";

interface CancelSubscriptionButtonProps {
  subscriptionId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  id?: string;
}

const CancelSubscriptionButton = ({
  subscriptionId,
  onSuccess,
  onError,
  id,
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
      } else {
        throw new Error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      onError?.(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      id={id}
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
