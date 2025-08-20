// src/pages/Success.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, refreshSession } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [message, setMessage] = useState("Processing your upgrade...");

  const transactionId = searchParams.get("txn_id");
  const environment = import.meta.env.MODE === "production";
  const backendUrl = environment
    ? import.meta.env.VITE_BACKEND_URL_PRODUCTION
    : import.meta.env.VITE_BACKEND_URL_SANDBOX;

  useEffect(() => {
    if (!transactionId) {
      setStatus("failed");
      setMessage("Missing transaction ID.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      attempts++;

      try {
        // Fetch transaction status from backend
        const res = await fetch(
          `${backendUrl}/api/transaction/${transactionId}`
        );
        const data = await res.json();

        if (!data.status) throw new Error("Invalid transaction data");

        if (data.status === "completed") {
          // Payment succeeded -> refresh session to update role
          await refreshSession();
          setStatus("success");
          setMessage("Upgrade successful!");
          clearInterval(interval);
        } else if (data.status === "failed") {
          setStatus("failed");
          setMessage("Payment failed. Please try again or contact support.");
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          setStatus("failed");
          setMessage(
            "Upgrade is taking longer than expected. Please contact support."
          );
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setStatus("failed");
        setMessage("Failed to verify upgrade. Please contact support.");
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [transactionId, backendUrl, refreshSession]);

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 mb-4" />
        <p className="text-lg text-center max-w-md">{message}</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <XCircle className="text-red-500 h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Upgrade Failed
          </h2>
          <p className="text-red-600 mb-4">{message}</p>
          <div className="text-left text-sm bg-red-100 p-3 rounded">
            <p>
              <span className="font-medium">Transaction ID:</span>{" "}
              {transactionId}
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md text-center">
        <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Upgrade Successful!</h1>
        <p className="mb-6">{message}</p>
        <button
          onClick={() => navigate("/analyze")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Start Analyzing
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
