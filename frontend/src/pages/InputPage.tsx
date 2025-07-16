import { useState } from "react";
import UploadPage from "./InputPage/UploadPage";
import { Button } from "@/components/ui/button";
import JobInput from "./InputPage/JobInput";
import axios from "axios";
import toast from "react-hot-toast";
// import PDFStep from "./InputPage/PDFStep";

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

  const handleResumeChange = (newData: Resume) => {
    setResume(newData);
  };

  const handleJobDataChange = (newData: JobDescriptionData) => {
    setJobData(newData);
  };

  const generateCoverLetter = async () => {
    if (!resume.textContent || !jobData.jobDescription) return;

    setLoading(true);
    try {
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
  return (
    <div className="flex flex-col items-center">
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
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Generated Cover Letter</h2>
          <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
            {data}
          </div>
          <div className="flex gap-4 items-center mt-4">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(data);
                toast("Copied to clipboard.");
              }}
            >
              Copy to Clipboard
            </Button>
            <Button
              onClick={generateCoverLetter}
              disabled={loading || jobData.jobDescription.length < 100}
            >
              {loading ? "Generating..." : "Regenerate"}
            </Button>
          </div>
        </div>
      )}

      {/* {step === 4 && <PDFStep letter={data} />} */}

      <div className="flex gap-4 items-center mt-4">
        <Button onClick={previousStep} disabled={step === 1}>
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
          >
            Next Step
          </Button>
        ) : null}

        {/* <Button
          onClick={nextStep}
          disabled={
            step === 1
              ? resume.textContent.length < 100
              : jobData.jobDescription.length < 100
          }
        >
          Next Step
        </Button> */}

        {step === 2 && (
          <Button
            onClick={generateCoverLetter}
            disabled={loading || jobData.jobDescription.length < 100}
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </Button>
        )}
      </div>

      <div className="mt-12 mb-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
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
