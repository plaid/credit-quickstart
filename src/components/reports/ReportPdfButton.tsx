import { useState } from "react";

const ReportPdfButton: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const response = await fetch("/server/reports/pdf");
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to download report.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "consumer_report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Error downloading PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
      >
        {isDownloading ? "Downloading..." : "Download PDF"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ReportPdfButton;
