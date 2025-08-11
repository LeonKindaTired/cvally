// src/pages/Success.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { CheckCircle, Loader2 } from "lucide-react";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { session, refreshSession, role } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [message, setMessage] = useState("Processing your upgrade...");

  const transactionId = searchParams.get("txn_id");
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const processUpgrade = async () => {
      if (!session) {
        setTimeout(processUpgrade, 5000);
        return;
      }

      if (role === "premium-user") {
        setStatus("success");
        setMessage("You are already premium!");
        return;
      }

      const userId = session.user?.id;

      if (!transactionId || !userId) {
        setStatus("failed");
        setMessage("Missing transaction information");
        return;
      }

      try {
        const upgradeResponse = await fetch(`${backendUrl}/api/upgrade-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!upgradeResponse.ok) {
          const errorText = await upgradeResponse.text();
          throw new Error(`User upgrade failed: ${errorText}`);
        }

        await refreshSession();
        setStatus("success");
        setMessage("Upgrade successful!");
      } catch (error) {
        console.error("Upgrade error:", error);
        setStatus("failed");
        setMessage("Upgrade processing failed. Please contact support.");
      }
    };

    processUpgrade();
  }, [session, transactionId, backendUrl]);

  // Processing state - upgrade in progress
  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 mb-4" />
        <p className="text-lg text-center max-w-md">{message}</p>
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Upgrade Issue</h2>
          <p className="text-red-600 mb-4">{message}</p>
          <div className="text-left text-sm bg-red-100 p-3 rounded">
            <p>
              <span className="font-medium">Transaction ID:</span>{" "}
              {transactionId || "N/A"}
            </p>
            <p>
              <span className="font-medium">User ID:</span>{" "}
              {session?.user?.id || "N/A"}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state
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
