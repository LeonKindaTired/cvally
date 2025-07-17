import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/supabase-client";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset link sent!");
      setMessage("Check your email for the reset link");
    } catch (error: any) {
      setMessage(error.error_description || error.message);
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 dark:text-white dark:hover:bg-gray-800"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>

        <div className="overflow-hidden border-0 shadow-lg rounded-xl dark:border dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white dark:from-amber-700 dark:to-orange-800">
            <h1 className="text-2xl font-bold">Reset Your Password</h1>
            <p className="text-amber-100 mt-2 dark:text-amber-200">
              Enter your email to receive a reset link
            </p>
          </div>

          <div className="p-6 dark:bg-gray-800">
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="reset-email"
                  className="text-sm font-medium dark:text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 dark:from-amber-700 dark:to-orange-700 dark:hover:from-amber-800 dark:hover:to-orange-800"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send Reset Link
              </Button>

              {message && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
                    message.includes("sent")
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-medium text-amber-600 hover:underline dark:text-amber-400"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
