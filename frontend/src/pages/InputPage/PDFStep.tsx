import { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { Loader2 } from "lucide-react";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface PDFStepProps {
  letter: string;
}

const PDFStep = ({ letter }: PDFStepProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generatePdf = () => {
      setIsLoading(true);

      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;

      const lines = doc.splitTextToSize(letter, maxWidth);

      let yPosition = margin;

      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPosition = margin;
        }

        doc.text(line, margin, yPosition);
        yPosition += 10;
      });

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsLoading(false);

      return () => URL.revokeObjectURL(url);
    };

    generatePdf();
  }, [letter]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPage) =>
      Math.max(1, Math.min(numPages || 1, prevPage + offset))
    );
  };

  const downloadPdf = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "cover-letter.pdf";
    link.click();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Cover Letter PDF</h2>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Generating PDF preview...</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden shadow-lg mb-6 w-full">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full"
            >
              <Page
                pageNumber={pageNumber}
                width={800}
                renderTextLayer={false}
              />
            </Document>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>

              <span className="text-sm font-medium">
                Page {pageNumber} of {numPages}
              </span>

              <Button
                variant="outline"
                onClick={() => changePage(1)}
                disabled={!!numPages && pageNumber >= numPages}
              >
                Next
              </Button>
            </div>

            <Button
              onClick={downloadPdf}
              className="bg-green-600 hover:bg-green-700"
            >
              Download PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PDFStep;
