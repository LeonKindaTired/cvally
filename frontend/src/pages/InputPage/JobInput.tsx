import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Clipboard,
} from "lucide-react";
import mammoth from "mammoth";
import toast from "react-hot-toast";

type JobDescriptionData = {
  jobTitle: string;
  company: string;
  jobDescription: string;
};

interface JobInputProps {
  onJobDataChange: (data: JobDescriptionData) => void;
  initialJobData: JobDescriptionData;
}

const JobInput = ({ onJobDataChange, initialJobData }: JobInputProps) => {
  const [formData, setFormData] = useState(initialJobData);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const updateFormData = (newData: JobDescriptionData) => {
    setFormData(newData);
    onJobDataChange(newData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (file.size > MAX_FILE_SIZE) {
      alert("File size exceeds 5MB limit");
      handleClearFile();
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      const fileContent = await readFileAsArrayBuffer(file);
      const text = await parseFile(file, fileContent);
      updateFormData({ ...formData, jobDescription: text });
      setShowPreview(true);
    } catch (error) {
      console.error("Error parsing file:", error);
      alert(
        `Error processing file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      handleClearFile();
    } finally {
      setIsLoading(false);
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseFile = async (file: File, data: ArrayBuffer): Promise<string> => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return await parsePdf(data);

      case "docx":
        const docxResult = await mammoth.extractRawText({ arrayBuffer: data });
        return docxResult.value;

      case "txt":
        return new TextDecoder().decode(data);

      default:
        throw new Error(
          "Unsupported file format. Please use PDF, DOCX, or TXT."
        );
    }
  };

  const parsePdf = async (data: ArrayBuffer): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Load PDF.js from CDN
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = async () => {
          try {
            // @ts-ignore - pdfjsLib is now global
            const pdfjsLib = window["pdfjsLib"];

            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

            const pdfDoc = await pdfjsLib.getDocument(new Uint8Array(data))
              .promise;
            let textContent = "";

            for (let i = 1; i <= pdfDoc.numPages; i++) {
              const page = await pdfDoc.getPage(i);
              const text = await page.getTextContent();
              textContent +=
                text.items.map((item: any) => item.str).join(" ") + "\n";
            }

            resolve(textContent);
          } catch (error) {
            reject(error);
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error("PDF processing error:", error);
        reject(new Error("Failed to process PDF file"));
      }
    });
  };

  const handleClearFile = () => {
    setFileName("");
    updateFormData({ ...formData, jobDescription: "" });
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateFormData({ ...formData, jobDescription: text });
      setShowPreview(true);
    } catch (error) {
      console.error("Falied to read clipboard: ", error);
      toast("Failed to access clipboard. Please paste manually.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Job Details</h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Provide information about the job you're applying for
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="dark:text-gray-300">
            Job Title{" "}
          </Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g. Software Engineer"
            required
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="dark:text-gray-300">
            Company{" "}
          </Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Google"
            required
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="">
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="jobDescription" className="dark:text-gray-300">
            Job Description{" "}
          </Label>
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            Paste text or upload file (PDF, DOCX, TXT)
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="relative flex-1 min-h-0">
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  placeholder="Paste job description here..."
                  className="min-h-[200px] w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                />
                <Button
                  variant="secondary"
                  className="absolute top-2 right-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  onClick={handlePaste}
                  disabled={isLoading}
                >
                  <Clipboard className="mr-2" />
                  Paste
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xl font-bold text-muted-foreground dark:text-gray-400">
            OR
          </div>

          <Card className="transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <FileText className="text-green-500" />
                <span>Upload Job Description File</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center ${
                  fileName
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 hover:border-primary cursor-pointer dark:border-gray-600 dark:hover:border-blue-500"
                } ${isLoading ? "opacity-70 pointer-events-none" : ""}`}
                onClick={() => !isLoading && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  disabled={isLoading}
                />

                {fileName ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-green-500 mb-3" />
                    <p className="font-medium dark:text-white">{fileName}</p>
                    <p className="text-sm text-muted-foreground mt-2 dark:text-gray-400">
                      {isLoading
                        ? "Extracting text..."
                        : "File ready for analysis"}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-2 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFile();
                      }}
                      disabled={isLoading}
                    >
                      <X className="mr-1" /> Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-4 dark:text-gray-500" />
                    <h3 className="font-medium text-lg mb-1 dark:text-white">
                      Drag & Drop or Click to Upload
                    </h3>
                    <p className="text-muted-foreground text-sm dark:text-gray-400">
                      Supported formats: .pdf, .docx, .txt (Max 5MB)
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Browse Files"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {formData.jobDescription && (
        <div className="mt-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <FileText className="text-blue-500 h-5 w-5" />
                  <span>Job Description Preview</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePreview}
                    className="dark:hover:bg-gray-700"
                  >
                    {showPreview ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {showPreview && (
              <CardContent className="pt-4">
                <div className="bg-gray-50 rounded-lg border p-4 max-h-[300px] overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                  <pre className="whitespace-pre-wrap text-sm dark:text-gray-200">
                    {formData.jobDescription}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobInput;
