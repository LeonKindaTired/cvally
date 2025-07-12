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
import { supabase } from "@/supabase/supabase-client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleTabChange = (value: string) => setActiveTab(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (activeTab === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Logged in succesfully.");
        setEmail("");
        setPassword("");
        navigate("/");
      }
    } else {
      if (password !== confirmPassword) {
        toast.error("Passwords don't match.");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! Check your email.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setActiveTab("signin");
      }
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Login</TabsTrigger>
            <TabsTrigger value="signup">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>Login into your account.</CardTitle>
                <CardDescription>
                  Input your email and password to login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form className="flex flex-col" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-5">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <a href="/reset-password" className="text-center mt-2 mb-5">
                    Forgot your password?
                  </a>
                  <Button type="submit">Login</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>Create new account</CardTitle>
                <CardDescription>
                  Input your information to make a new account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit">Sign Up</Button>
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
