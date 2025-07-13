import { useState } from "react";
import UploadPage from "./InputPage/UploadPage";
import { Button } from "@/components/ui/button";
import JobInput from "./InputPage/JobInput";

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

  const handleResumeChange = (newData: Resume) => {
    setResume(newData);
  };

  const handleJobDataChange = (newData: JobDescriptionData) => {
    setJobData(newData);
  };

  const generateCoverLetter = async (
    resumeText: Resume,
    jobDescription: JobDescriptionData
  ) => {
    const res = await fetch("/api/generateCoverLetter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    const data = await res.json();
    setData(data.choices?.[0]?.message?.content);
  };

  const nextStep = () => {
    if (step === 1) setStep(2);
    else setStep(3);
  };
  const previousStep = () => {
    if (step === 3) setStep(2);
    else setStep(1);
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
        <div className="flex flex-col max-w-52 items-center text-center">
          <h2>Resume Content</h2>
          {<>{data}</>}
        </div>
      )}
      <div className="flex gap-4 items-center">
        <Button onClick={previousStep}>Previous Step</Button>
        <Button
          onClick={nextStep}
          disabled={
            step === 1
              ? resume.textContent.length < 100
              : jobData.jobDescription.length < 100 &&
                jobData.company === "" &&
                jobData.jobTitle === ""
          }
        >
          Next Step
        </Button>
        <Button onClick={() => generateCoverLetter}>Generate Stuff</Button>
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
