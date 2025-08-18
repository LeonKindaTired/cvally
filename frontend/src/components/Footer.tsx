import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Github, Mail, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "../images/cvally.png";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 dark:border-gray-800 pt-16">
      <div className="container mx-auto px-4 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center space-x-2">
                <img src={logo} className="w-12 h-12" />
                <span className="text-xl font-bold dark:text-white">
                  CVAlly
                </span>
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-xs leading-relaxed">
              AI-powered resume analysis and optimization for your career
              success. Transform your job search with intelligent tools.
            </p>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform hover:-translate-y-1 shadow-sm"
              >
                <a
                  href="https://github.com/LeonKindaTired"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github
                    size={18}
                    className="text-gray-700 dark:text-gray-300"
                  />
                </a>
              </Button>
            </div>
          </div>

          {/* Pages Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/letters"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  My Letters
                </Link>
              </li>
              <li>
                <Link
                  to="/upgrade"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Upgrade
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Contact Us
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Have questions? Reach out to us anytime. Our team is ready to help
              you.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-all"
            >
              <a
                href="mailto:contact@CVAlly.com"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  contact@CVAlly.com
                </span>
              </a>
            </Button>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t pt-8 pb-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} CVAlly. All rights reserved.
            <span className="mx-2">|</span>
            <a
              href="/privacy-policy"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="mx-2">|</span>
            <a
              href="/terms-of-service"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </a>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              English
            </Button>
          </div>
        </div>
      </div>

      {/* Floating scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
};

export default Footer;
