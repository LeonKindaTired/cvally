import { Zap, Calendar, X } from "lucide-react";
import CancelSubscriptionButton from "@/components/CancelSubscriptionButton";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { Button } from "@/components/ui/button";

const CancelSubscriptionPage = () => {
  const [nextBillingDate, setNextBillingDate] = useState<string>("");
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [overlayType, setOverlayType] = useState<
    "success" | "error" | "confirmation"
  >("success");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { subscriptionId } = useAuth();

  const environment = import.meta.env.VITE_NODE_ENV === "production";
  const backendUrl = environment
    ? import.meta.env.VITE_BACKEND_URL_PRODUCTION
    : import.meta.env.VITE_BACKEND_URL_SANDBOX;

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!subscriptionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${backendUrl}/api/lemon/subscriptions/${subscriptionId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscription details");
        }

        const data = await response.json();
        setSubscriptionDetails(data);
        setNextBillingDate(
          data.data.attributes.renews_at || data.data.attributes.ends_at
        );
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [subscriptionId, backendUrl]);

  const showPopup = (
    message: string,
    type: "success" | "error" | "confirmation" = "success",
    onConfirm?: () => void
  ) => {
    setOverlayMessage(message);
    setOverlayType(type);
    if (onConfirm) {
      setPendingAction(() => onConfirm);
    }
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setOverlayMessage("");
    setPendingAction(null);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    closeOverlay();
  };

  const handleCancelClick = () => {
    showPopup(
      "Are you sure you want to cancel your subscription? You'll retain access until the end of your billing period.",
      "confirmation",
      () => {
        document.getElementById("cancel-subscription-button")?.click();
      }
    );
  };

  const formattedDate = nextBillingDate
    ? new Date(nextBillingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Loading...";

  const price = subscriptionDetails?.data?.attributes?.price
    ? `$${(subscriptionDetails.data.attributes.price / 100).toFixed(2)}`
    : "$4.99";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!subscriptionId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            No Active Subscription
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            You don't have an active subscription to manage.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Overlay Popup */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeOverlay}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div
                className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                  overlayType === "success"
                    ? "bg-green-100 dark:bg-green-900/20"
                    : overlayType === "error"
                    ? "bg-red-100 dark:bg-red-900/20"
                    : "bg-blue-100 dark:bg-blue-900/20"
                }`}
              >
                {overlayType === "success" ? (
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : overlayType === "error" ? (
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                )}
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">
                {overlayType === "success"
                  ? "Success!"
                  : overlayType === "error"
                  ? "Error"
                  : "Confirm Cancellation"}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {overlayMessage}
              </p>

              <div
                className={`flex gap-3 ${
                  overlayType === "confirmation"
                    ? "justify-center"
                    : "justify-center"
                }`}
              >
                {overlayType === "confirmation" ? (
                  <>
                    <Button
                      onClick={closeOverlay}
                      variant="outline"
                      className="flex-1"
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      variant="destructive"
                      className="flex-1"
                    >
                      Yes, Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={closeOverlay}
                    className={`w-full ${
                      overlayType === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Subscription Management
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your premium subscription settings
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-blue-200 dark:border-blue-800/50">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full mb-6">
                <Zap className="text-blue-600 dark:text-blue-400" size={36} />
              </div>
              <h2 className="text-3xl font-bold mb-2">Current Plan</h2>
              <p className="text-gray-600 dark:text-gray-400">
                You're on the Premium plan
              </p>
            </div>

            <div className="flex justify-center mb-10">
              <div className="text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold">{price}</span>
                  <span className="text-gray-500 text-xl ml-2">/month</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-10">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-6 py-4 rounded-lg">
                <Calendar className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscriptionDetails?.data?.attributes.status ===
                    "cancelled"
                      ? "Subscription ends on"
                      : "Next billing date"}
                  </p>
                  <p className="font-semibold">{formattedDate}</p>
                </div>
              </div>
            </div>

            {subscriptionDetails?.data?.attributes.status === "cancelled" ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg mb-8">
                <p className="text-center text-yellow-700 dark:text-yellow-300">
                  Your subscription has been cancelled. You'll retain access
                  until {formattedDate}.
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-8">
                  <p className="text-center text-red-700 dark:text-red-300">
                    If you cancel, you'll lose access to premium features at the
                    end of your billing period. You won't be charged again after{" "}
                    {formattedDate}.
                  </p>
                </div>

                <div className="text-center">
                  <div className="hidden">
                    <CancelSubscriptionButton
                      id="cancel-subscription-button"
                      subscriptionId={subscriptionId}
                      onSuccess={() => {
                        showPopup(
                          "Your subscription has been cancelled successfully. You'll retain access until the end of your billing period.",
                          "success"
                        );
                      }}
                      onError={(errorMessage) => {
                        showPopup(
                          errorMessage ||
                            "Failed to cancel subscription. Please try again.",
                          "error"
                        );
                      }}
                    />
                  </div>

                  <Button
                    onClick={handleCancelClick}
                    variant="destructive"
                    size="lg"
                    className="w-full max-w-xs"
                  >
                    Cancel Subscription
                  </Button>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto">
                    You can resubscribe anytime.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              What happens when I cancel?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You'll keep premium access until the end of your current billing
              period. After that, your account will revert to our Free plan. You
              can resubscribe anytime.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Can I get a refund?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We don't provide prorated refunds for partial months. You'll
              continue to have premium access until your billing period ends.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              What happens to my saved cover letters?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All your saved cover letters will remain accessible, but you'll
              lose access to premium features like unlimited generations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionPage;
