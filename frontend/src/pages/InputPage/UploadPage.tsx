import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Clipboard,
  FileText,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import mammoth from "mammoth";
import toast from "react-hot-toast";
import type { Resume } from "../InputPage";

interface UploadPageProps {
  onResumeChange: (data: Resume) => void;
  initialResume: Resume;
}

const UploadPage = ({ onResumeChange, initialResume }: UploadPageProps) => {
  const [textContent, setTextContent] = useState(initialResume.textContent);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
      updateTextContent(text);
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

  const updateTextContent = (text: string) => {
    setTextContent(text);
    onResumeChange({ textContent: text });
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
    setTextContent("");
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      updateTextContent(text);
      setShowPreview(true);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      toast("Failed to access clipboard. Please paste manually.");
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textContent);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          Upload Your Resume
        </h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Let AI analyze your resume and provide personalized insights
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <Card className="w-full md:w-1/2 h-[400px] transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Clipboard className="text-blue-500" />
              <span>Paste Resume Text</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-57px)] flex flex-col">
            <div className="relative flex-1 min-h-0">
              <Textarea
                value={textContent}
                onChange={(e) => updateTextContent(e.target.value)}
                placeholder="Paste your resume content here..."
                className="h-full w-full resize-none overflow-y-auto dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
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
            <Button
              className="mt-4 w-full dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={
                !textContent.trim() ||
                isLoading ||
                textContent.length < 100 ||
                textContent.length > 5000
              }
            >
              {isLoading ? "Processing..." : "Analyze Text"}
            </Button>
          </CardContent>
        </Card>

        <div className="my-4 md:my-0 text-xl font-bold text-muted-foreground dark:text-gray-400">
          OR
        </div>

        <Card className="w-full md:w-1/2 h-[400px] transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <FileText className="text-green-500" />
              <span>Upload Resume File</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-57px)] flex flex-col">
            <div
              className={`border-2 border-dashed rounded-lg flex-1 flex flex-col items-center justify-center p-6 text-center ${
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
            <Button
              className="mt-4 w-full dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={!fileName || isLoading}
            >
              {isLoading ? "Processing..." : "Analyze File"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {textContent && (
        <div className="mt-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <FileText className="text-blue-500 h-5 w-5" />
                  <span>Extracted Resume Content</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
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
                    {textContent}
                  </pre>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFile}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  >
                    Clear Content
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
