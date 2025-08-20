import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FileSearch, ArrowRight } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Illustration/Image Section */}
            <div className="flex-1">
              <div className="relative">
                <div className="text-[10rem] md:text-[16rem] font-bold text-blue-100 dark:text-blue-900/30 text-center md:text-left">
                  404
                </div>
                <div className="absolute inset-0 flex items-center justify-center md:justify-start">
                  <div className="w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20"></div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full mb-6 dark:bg-blue-900/50 dark:text-blue-300">
                <FileSearch className="w-4 h-4 mr-2" />
                <span>Page Not Found</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
                Lost in the <span className="text-blue-600">Job Search</span>?
              </h1>

              <p className="text-lg text-muted-foreground mb-10 dark:text-gray-400">
                The page you're looking for doesn't exist. But don't worry - we
                can help you find your dream job instead.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="text-lg bg-blue-600 hover:bg-blue-700"
                >
                  <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <Link to="/analyze">
                    Analyze Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
