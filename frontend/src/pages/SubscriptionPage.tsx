import { useAuth } from "@/context/authContext";
import { BadgeCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const SubscriptionPage = () => {
  const { isLoading, session, role } = useAuth();
  const [product, setProduct] = useState<any | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const fetchProduct = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/lemon/products");
          const data = await res.json();
          console.log("LemonSqueezy API Response:", data);

          if (data.length > 0) {
            setProduct({
              name: data[0].name,
              price_formatted: "$" + (data[0].price / 100).toFixed(2),
              description: data[0].description || "",
              variant_id: data[0].variant_id,
              test_mode: data[0].test_mode,
            });
          }
        } catch (err) {
          console.error("Error fetching product:", err);
        } finally {
          setLocalLoading(false);
        }
      };

      fetchProduct();
    }
  }, [isLoading]);

  const onSubscribe = async () => {
    if (!product?.variant_id) return;

    setIsPending(true);
    try {
      const res = await fetch("http://localhost:5000/api/lemon/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: product.variant_id,
          userId: session?.user.id,
          email: session?.user.email,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading || localLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upgrade to Premium
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get unlimited cover letter generations with our premium plan
        </p>
      </div>

      {/* Upgrade Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12 border border-blue-200 dark:border-blue-800/50">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full mb-6">
                <Zap className="text-blue-600 dark:text-blue-400" size={36} />
              </div>
              <h2 className="text-3xl font-bold mb-2">Premium Plan</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Everything you need for successful job applications
              </p>
            </div>

            <div className="flex justify-center mb-10">
              <div className="text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold">
                    {product?.price_formatted || "$4.99"}
                  </span>
                  <span className="text-gray-500 text-xl ml-2">/month</span>
                </div>
                <p className="text-gray-500 mt-2">Cancel anytime</p>
                {product?.test_mode && (
                  <span className="text-xs text-orange-500 mt-1">
                    Test Mode
                  </span>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-10 max-w-lg mx-auto">
              <li className="flex items-start">
                <span className="text-lg">
                  ✓ Unlimited cover letter generations
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-lg">
                  ✓ Advanced customization options
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-lg">
                  ✓ Save and organize your cover letters
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-lg">✓ Early access to new features</span>
              </li>
            </ul>

            <div className="text-center">
              <button
                onClick={onSubscribe}
                disabled={
                  isPending || !product?.variant_id || role === "premium-user"
                }
                className="w-full max-w-xs mx-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isPending
                  ? "Processing..."
                  : role === "premium-user"
                  ? "You are already a premium user"
                  : "Upgrade Now"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Go Premium?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-9 w-9 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Unlimited Access</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create as many cover letters as you need with no restrictions
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-9 w-9 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Faster Results</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get higher quality cover letters in less time
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BadgeCheck
                className="text-green-600 dark:text-green-400"
                size={36}
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Stand out with tailored cover letters that impress employers
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              How does billing work?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your {product?.price_formatted || "$4.99"} monthly subscription
              will be automatically billed each month until you cancel. You can
              cancel anytime from your account settings.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! You can cancel your subscription at any time. Your premium
              access will continue until the end of your current billing period.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We accept all major credit cards through our secure payment
              processor.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              How do I access premium features?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Immediately after payment, your account will be upgraded and all
              premium features will be unlocked automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
