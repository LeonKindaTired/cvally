import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home as HomeIcon,
  FileText,
  LogIn,
  MoonStar,
  Sun,
  Search,
  LogOut,
  ArrowUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/supabase/supabase-client";
import { useThemeContext } from "@/context/themeContext";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import logo from "../images/cvally.png";

const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const { theme, setTheme } = useThemeContext();
  const { role } = useAuth();

  const changeTheme = () => {
    return theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(`${error}`);
      throw error;
    }

    toast.success("Logged out successfully");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} className="w-12 h-12" />
            <span className="text-xl font-bold dark:text-white">CVAlly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Button
              asChild
              variant={isActive("/") ? "secondary" : "ghost"}
              className="gap-2 dark:hover:bg-gray-800"
            >
              <Link to="/">
                <HomeIcon size={16} />
                Home
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex dark:hover:bg-gray-800"
            onClick={changeTheme}
          >
            {theme === "light" ? <MoonStar /> : <Sun />}
          </Button>

          {session ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex dark:hover:bg-gray-800"
                onClick={handleSignOut}
              >
                <LogOut />
              </Button>
              <Button
                asChild
                variant={isActive("/analyze") ? "secondary" : "ghost"}
                className="gap-2 dark:hover:bg-gray-800"
              >
                <Link to="/analyze">
                  <Search size={16} />
                  Analyze
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/letters") ? "secondary" : "ghost"}
                className="gap-2 dark:hover:bg-gray-800"
              >
                <Link to="/letters">
                  <FileText size={16} />
                  My Letters
                </Link>
              </Button>
              {role === "user" && (
                <Button asChild className="gap-2 bg-lime-600">
                  <Link to="/upgrade">
                    <div className="flex items-center">
                      <ArrowUp size={16} />
                      Upgrade
                    </div>
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                className="gap-2 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Link to="/login">
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Link to="/login">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
