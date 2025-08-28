import { useEffect, useState } from "react";
import UploadPage from "./InputPage/UploadPage";
import { Button } from "@/components/ui/button";
import JobInput from "./InputPage/JobInput";
import axios from "axios";
import toast from "react-hot-toast";
import SaveCoverLetter from "@/components/SaveCoverLetter";
import { useAuth } from "@/context/authContext";
import {
  canGenerateCoverLetter,
  getCoverLetterUsage,
  incrementCoverLetterCount,
} from "@/components/CoverLetterUtils";
import { Link } from "react-router-dom";

export type Resume = {
  textContent: string;
};

export type JobDescriptionData = {
  jobTitle: string;
  company: string;
  jobDescription: string;
};

const InputPage = () => {
  const [step, setStep] = useState(1);
  const [resume, setResume] = useState<Resume>({
    textContent: "",
  });
  const [jobData, setJobData] = useState<JobDescriptionData>({
    jobTitle: "",
    company: "",
    jobDescription: "",
  });
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<
    number | null
  >(null);
  const [coverLetterCount, setCoverLetterCount] = useState(0);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const { session, role } = useAuth();

  const handleResumeChange = (newData: Resume) => {
    setResume(newData);
  };

  const handleJobDataChange = (newData: JobDescriptionData) => {
    setJobData(newData);
  };

  const generateCoverLetter = async () => {
    if (!resume.textContent || !jobData.jobDescription) return;

    if (!session?.user?.id) {
      toast.error("Please sign in to generate cover letters");
      return;
    }

    if (
      role !== "premium-user" &&
      remainingGenerations !== null &&
      remainingGenerations <= 0
    ) {
      toast.error("You've reached your monthly cover letter limit");
      setLimitExceeded(true);
      return;
    }

    setLoading(true);
    try {
      const canGenerate = await canGenerateCoverLetter(
        session.user.id,
        role || "user"
      );

      if (!canGenerate) {
        toast.error("You've reached your monthly cover letter limit");
        setLimitExceeded(true);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/generate/generate-cv",
        {
          resumeText: resume.textContent,
          jobDescription: jobData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.error || "API request failed");
      }

      setData(response.data.cv);
      setStep(3);

      await incrementCoverLetterCount(session.user.id);
      setCoverLetterCount((prev) => prev + 1);
      setRemainingGenerations((prev) =>
        prev !== null ? Math.max(0, prev - 1) : null
      );
      setLimitExceeded(false);

      toast.success("Cover letter generated");
    } catch (error: any) {
      console.error("Error:", error);
      setData(`Error: ${error.response?.data?.error || error.message}`);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else setStep(4);
  };
  const previousStep = () => {
    setStep(step - 1);
  };

  useEffect(() => {
    const fetchRemaining = async () => {
      if (!session?.user?.id) return;
      try {
        const usage = await getCoverLetterUsage(session.user.id);
        setCoverLetterCount(usage.cover_letter_count);

        if (role === "premium-user") {
          setRemainingGenerations(Infinity);
        } else {
          setRemainingGenerations(Math.max(0, 3 - usage.cover_letter_count));
        }
      } catch (error) {
        console.error("Failed to fetch cover letter usage: ", error);
      }
    };

    fetchRemaining();
  }, [session, role]);

  return (
    <div className="flex flex-col items-center dark:bg-gray-900">
      {session && step !== 3 && (
        <div className="w-full max-w-4xl my-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          {role === "premium-user" ? (
            <span className="text-green-600 font-medium">
              ⭐ Premium: Unlimited cover letters
            </span>
          ) : remainingGenerations === null ? (
            <span>Loading generation limits...</span>
          ) : (
            <span>
              {remainingGenerations} cover letter
              {remainingGenerations !== 1 ? "s" : ""} left this month
              {coverLetterCount > 0 && ` (used ${coverLetterCount} of 3)`}
            </span>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="w-full">
          <UploadPage
            onResumeChange={handleResumeChange}
            initialResume={resume}
          />
        </div>
      )}
      {step === 2 && (
        <div className="w-full">
          <JobInput
            onJobDataChange={handleJobDataChange}
            initialJobData={jobData}
          />
        </div>
      )}
      {step === 3 && (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700 mt-5">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Generated Cover Letter
          </h2>
          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md dark:bg-gray-700 dark:text-gray-200">
            {data}
          </div>

          {limitExceeded && role !== "premium-user" && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-bold text-yellow-700 dark:text-yellow-300">
                Monthly Limit Reached
              </h3>
              <p className="mb-2">
                You've used all 3 cover letters this month. Upgrade to premium
                for unlimited generations.
              </p>
              <Button
                variant="outline"
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => (window.location.href = "/pricing")}
              >
                Upgrade to Premium
              </Button>
            </div>
          )}

          <div className="flex gap-4 items-center mt-4 flex-wrap">
            <Button
              onClick={generateCoverLetter}
              disabled={loading || jobData.jobDescription.length < 100}
              className="dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {loading
                ? "Generating..."
                : data.length === 0 || data === ""
                ? "Generate"
                : "Regenerate"}
            </Button>
            {(data.length !== 0 || data !== "") && (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(data);
                  toast("Copied to clipboard.");
                }}
                className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Copy to Clipboard
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => setSaveDialogOpen(true)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Save Cover Letter
            </Button>
          </div>
        </div>
      )}

      <SaveCoverLetter
        content={data}
        jobTitle={jobData.jobTitle}
        company={jobData.company}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />

      {/* {step === 4 && <PDFStep letter={data} />} */}

      <div className="flex gap-4 items-center mt-4">
        <Button
          onClick={previousStep}
          disabled={step === 1}
          className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Previous Step
        </Button>

        {step < 3 ? (
          <Button
            onClick={nextStep}
            disabled={
              step === 1
                ? resume.textContent.length < 100
                : jobData.jobDescription.length < 100
            }
            className="dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Next Step
          </Button>
        ) : (
          <Button className="dark:bg-blue-700 dark:hover:bg-blue-600">
            <Link to="/letters">My Letters</Link>
          </Button>
        )}
      </div>

      <div className="mt-12 mb-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto dark:text-gray-400">
        <p>
          Your data is securely processed and never stored. Our AI analyzes your
          resume to provide personalized career suggestions, keyword
          optimization, and formatting improvements.
        </p>
      </div>
    </div>
  );
};

export default InputPage;
