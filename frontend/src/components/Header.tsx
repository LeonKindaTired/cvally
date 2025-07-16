import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileText, Settings, LogIn } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-500 w-8 h-8 rounded-full" />
            <span className="text-xl font-bold">CVAlly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Button
              asChild
              variant={isActive("/") ? "secondary" : "ghost"}
              className="gap-2"
            >
              <Link to="/">
                <Home size={16} />
                Home
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive("/resumes") ? "secondary" : "ghost"}
              className="gap-2"
            >
              <Link to="/resumes">
                <FileText size={16} />
                My Resumes
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Settings size={18} />
          </Button>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/login" className="gap-2">
                <LogIn size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/login">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
