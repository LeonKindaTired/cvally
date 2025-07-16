import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t bg-gray-50">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 w-8 h-8 rounded-full" />
              <span className="text-xl font-bold">CVAlly</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              AI-powered resume analysis and optimization for your career
              success
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="icon">
                <Github size={16} />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter size={16} />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/features" className="hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-primary">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/examples" className="hover:text-primary">
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/blog" className="hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-primary">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-primary">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} CVAlly. All rights reserved.
          </p>

          <div className="mt-4 md:mt-0 flex items-center gap-6">
            <Button variant="link" size="sm" className="text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              contact@CVAlly.com
            </Button>
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
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
