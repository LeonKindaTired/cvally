import { Zap, Calendar } from "lucide-react";
import CancelSubscriptionButton from "@/components/CancelSubscriptionButton";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

const CancelSubscriptionPage = () => {
  const [nextBillingDate, setNextBillingDate] = useState<string>("");
  const { subscriptionId } = useAuth();

  const environment = import.meta.env.MODE === "production";
  const backendUrl = environment
    ? import.meta.env.VITE_BACKEND_URL_PRODUCTION
    : import.meta.env.VITE_BACKEND_URL_SANDBOX;

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!subscriptionId) return;

      try {
        const response = await fetch(
          `${backendUrl}/api/subscription/${subscriptionId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscription details");
        }

        const data = await response.json();
        setNextBillingDate(data.data.next_billed_at);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscriptionDetails();
  }, [subscriptionId, backendUrl]);

  const formattedDate = nextBillingDate
    ? new Date(nextBillingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Loading...";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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
                  <span className="text-5xl font-bold">$4.99</span>
                  <span className="text-gray-500 text-xl ml-2">/month</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-10">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-6 py-4 rounded-lg">
                <Calendar className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Next billing date
                  </p>
                  <p className="font-semibold">{formattedDate}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-8">
                <p className="text-center text-red-700 dark:text-red-300">
                  If you cancel, you'll lose access to premium features at the
                  end of your billing period. You won't be charged again after{" "}
                  {formattedDate}.
                </p>
              </div>

              <div className="text-center">
                <CancelSubscriptionButton />

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto">
                  You can resubscribe anytime.
                </p>
              </div>
            </div>
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
