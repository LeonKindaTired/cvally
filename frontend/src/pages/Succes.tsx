// src/pages/Success.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { CheckCircle } from "lucide-react";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { session, refreshSession } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [message, setMessage] = useState("Processing your upgrade...");

  const transactionId = searchParams.get("txn_id");
  const userId = session?.user?.id;

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const processUpgrade = async () => {
      if (!transactionId || !userId) {
        setStatus("failed");
        setMessage("Missing transaction information");
        return;
      }

      try {
        console.log("Calling upgrade endpoint with:", { userId });

        const upgradeResponse = await fetch(`${backendUrl}/api/upgrade-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        console.log("Upgrade response status:", upgradeResponse.status);

        if (!upgradeResponse.ok) {
          const errorText = await upgradeResponse.text();
          console.error("Upgrade failed:", errorText);
          throw new Error("User upgrade failed");
        }

        // 2. Refresh session
        await refreshSession();

        // 3. Check transaction status
        const transactionResponse = await fetch(
          `${backendUrl}/api/transaction/${transactionId}`
        );
        const transactionData = await transactionResponse.json();

        if (transactionData.status === "completed") {
          setStatus("success");
          setMessage("Upgrade successful!");
        } else {
          // Poll for transaction completion
          setTimeout(() => processUpgrade(), 3000);
        }
      } catch (error) {
        console.error("Upgrade error:", error);
        setStatus("failed");
        setMessage("Upgrade processing failed. Please contact support.");
      }
    };

    processUpgrade();
  }, [transactionId, userId, backendUrl]);

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
        <p className="text-lg">{message}</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Upgrade Issue</h2>
          <p>{message}</p>
          <p className="mt-4">
            Transaction ID: {transactionId || "N/A"}
            <br />
            User ID: {userId || "N/A"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md text-center">
        <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Upgrade Successful!</h1>
        <p className="mb-6">{message}</p>
        <a
          href="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
};

export default SuccessPage;
