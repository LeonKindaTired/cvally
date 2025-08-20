import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Sparkles,
  BarChart2,
  UserCheck,
  ShieldCheck,
  Rocket,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/authContext";

const Home = () => {
  const { session } = useAuth();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-blue-500" />,
      title: "AI-Powered Analysis",
      description:
        "Get instant feedback on your resume's strengths and weaknesses using advanced AI algorithms",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-green-500" />,
      title: "ATS Optimization",
      description:
        "Optimize your resume to pass through Applicant Tracking Systems with keyword suggestions",
    },
    {
      icon: <UserCheck className="w-6 h-6 text-purple-500" />,
      title: "Personalized Suggestions",
      description:
        "Receive tailored recommendations based on your experience and target industry",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: "Privacy First",
      description:
        "Your data is never stored or shared. Processed securely and deleted after analysis",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Upload Your Resume",
      description: "Upload your existing resume in PDF, DOCX, or TXT format",
      icon: <FileText className="w-8 h-8" />,
    },
    {
      step: "2",
      title: "Add Job Details",
      description: "Provide the job description you're applying for",
      icon: <FileText className="w-8 h-8" />,
    },
    {
      step: "3",
      title: "Generate Cover Letter",
      description: "Get a tailored cover letter in seconds",
      icon: <Sparkles className="w-8 h-8" />,
    },
    {
      step: "4",
      title: "Apply with Confidence",
      description: "Saver your optimized cover letter and start applying",
      icon: <Rocket className="w-8 h-8" />,
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full mb-6 dark:bg-blue-900/50 dark:text-blue-300">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>AI-Powered Resume Analysis</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold max-w-3xl mb-6 dark:text-white">
              Transform Your <span className="text-blue-600">Job Search</span>{" "}
              with AI
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mb-10 dark:text-gray-400">
              Get tailored cover letters for you based on your CV
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="text-lg bg-blue-600 hover:bg-blue-700"
              >
                <Link to="/analyze">
                  Analyze My Resume
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {!session && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <Link to="/login">Sign Up</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Powerful Resume Optimization
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto dark:text-gray-400">
              Everything you need to create a job-winning resume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow
                          dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-800/50"
              >
                <div
                  className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4
                                dark:bg-gray-700"
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              How CVAlly Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto dark:text-gray-400">
              Get job-ready in just a few simple steps
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute top-16 left-1/2 transform -translate-x-1/2 h-3/4 w-0.5 bg-blue-200 hidden md:block
                            dark:bg-gray-700"
            ></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex ${
                    index % 2 === 0
                      ? "md:pr-10 md:text-right md:flex-row-reverse"
                      : "md:pl-10"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white
                                    dark:bg-blue-700"
                    >
                      {step.icon}
                    </div>
                  </div>
                  <div
                    className={`mt-4 ${
                      index % 2 === 0 ? "md:mt-0 md:mr-6" : "md:mt-0 md:ml-6"
                    }`}
                  >
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      STEP {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mt-1 mb-2 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground dark:text-gray-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join all of the users who landed their dream jobs with CVAlly
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="text-lg bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link to="/analyze">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
