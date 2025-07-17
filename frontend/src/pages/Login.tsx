import { useState, type FormEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/supabase/supabase-client";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw new Error(error.message);

        toast.success("Logged in successfully");
        navigate("/");
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        // Create auth user
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw new Error(error.message);

        // Create profile with default role (3 = 'user')
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([{ id: data.user.id, role_id: 3 }]);

          if (profileError) {
            if (profileError.code === "23505") {
              console.log("Profile already exists");
            } else {
              throw new Error(profileError.message);
            }
          }
        }

        toast.success("Account created! Check your email for confirmation");
        setActiveTab("signin");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordVisibility = () => setShowPassword(!showPassword);
  const handleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 dark:text-white dark:hover:bg-gray-800"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="overflow-hidden border-0 shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white dark:from-blue-700 dark:to-indigo-800">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription className="text-blue-100 dark:text-blue-200">
                  Sign in to continue to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="login-email"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Password
                      </label>
                      <Link
                        to="/reset-password"
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        onClick={handlePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Sign In
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    onClick={() =>
                      supabase.auth.signInWithOAuth({ provider: "google" })
                    }
                    disabled={isLoading}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="overflow-hidden border-0 shadow-lg dark:border dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white dark:from-green-700 dark:to-teal-800">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription className="text-green-100 dark:text-green-200">
                  Join us to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="signup-email"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="signup-password"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        onClick={handlePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        onClick={handleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 dark:from-green-700 dark:to-teal-700 dark:hover:from-green-800 dark:hover:to-teal-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Account
                  </Button>

                  <p className="px-8 text-center text-sm text-muted-foreground dark:text-gray-400">
                    By clicking continue, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="underline underline-offset-4 hover:text-primary dark:text-blue-400"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="underline underline-offset-4 hover:text-primary dark:text-blue-400"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
