import { useAuth } from "@/context/authContext";
import { Button } from "./ui/button";

const CancelSubscriptionButton = () => {
  const { subscriptionId, session } = useAuth();
  const environment = import.meta.env.MODE === "production";
  const backendUrl = environment
    ? import.meta.env.VITE_BACKEND_URL_PRODUCTION
    : import.meta.env.VITE_BACKEND_URL_SANDBOX;

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`, // ✅ attach token
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Cancel failed:", err);
        return;
      }

      const data = await res.json();
      console.log("Subscription canceled:", data);
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  return (
    <Button
      className="px-10 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      size="lg"
      onClick={handleCancelSubscription}
    >
      Cancel Subscription
    </Button>
  );
};

export default CancelSubscriptionButton;
