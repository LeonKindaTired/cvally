import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 w-8 h-8 rounded-full" />
              <span className="text-xl font-bold dark:text-white">CVAlly</span>
            </div>
            <p className="text-muted-foreground max-w-xs dark:text-gray-400">
              AI-powered resume analysis and optimization for your career
              success
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
              >
                <Github size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
              >
                <Twitter size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
              >
                <Linkedin size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold dark:text-white">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  to="/features"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/templates"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  to="/examples"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold dark:text-white">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  to="/blog"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold dark:text-white">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-primary dark:hover:text-blue-400"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="border-t pt-8 flex flex-col md:flex-row justify-between items-center
                        dark:border-gray-800"
        >
          <p className="text-muted-foreground text-sm dark:text-gray-400">
            © {new Date().getFullYear()} CVAlly. All rights reserved.
          </p>

          <div className="mt-4 md:mt-0 flex items-center gap-6">
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground dark:text-gray-400"
            >
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                contact@CVAlly.com
              </div>
            </Button>
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="icon"
              className="text-muted-foreground dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ArrowUp size={18} />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
