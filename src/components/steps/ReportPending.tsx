import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { callMyServer } from "../../lib/utils";
import { FlowState } from "../../lib/constants";

const POLL_INTERVAL_MS = 5000;

const ReportPending: React.FC = () => {
  const { setFlowState, setBaseReport, setIncomeInsights, webhookUrl, setDebugInfo, setLinkToken } =
    useAppContext();
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [pollingFallback, setPollingFallback] = useState(false);

  const handleStartOver = async () => {
    setIsResetting(true);
    eventSourceRef.current?.close();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    await callMyServer("/server/users/reset", true, {});
    setBaseReport(null);
    setIncomeInsights(null);
    setLinkToken(null);
    setDebugInfo("Debug info will appear here...");
    setFlowState(FlowState.WELCOME);
  };

  const fetchReports = async () => {
    const [baseReport, incomeInsights] = await Promise.all([
      callMyServer("/server/reports/base_report"),
      callMyServer("/server/reports/income_insights"),
    ]);
    if (baseReport && incomeInsights) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setBaseReport(baseReport);
      setIncomeInsights(incomeInsights);
      setDebugInfo("Report loaded successfully.");
      setFlowState(FlowState.REPORT_READY);
    }
  };

  const startPolling = (reason: string) => {
    setPollingFallback(true);
    setDebugInfo(reason);
    pollIntervalRef.current = setInterval(fetchReports, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    const es = new EventSource("/server/events/stream");
    eventSourceRef.current = es;

    es.addEventListener("connected", async () => {
      if (!webhookUrl) {
        startPolling("⚠️ No webhook URL configured — polling for report every 5s.");
        return;
      }

      const result = await callMyServer<{ valid: boolean }>(
        "/server/tokens/validate_webhook"
      );

      if (result?.valid) {
        setDebugInfo(`Waiting for webhook at ${webhookUrl}...`);
      } else {
        startPolling(
          `⚠️ Webhook receiver endpoint ${webhookUrl} invalid, falling back to polling every 5s.`
        );
      }
    });

    es.addEventListener("report-ready", async () => {
      setDebugInfo("Report is ready! Fetching data...");
      await fetchReports();
    });

    es.onerror = () => {
      console.log("SSE connection error or closed");
    };

    return () => {
      es.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualCheck = async () => {
    setDebugInfo("Checking report status...");
    await fetchReports();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-mint-200 border-t-mint-600"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        You're all done!
      </h2>
      <p className="text-sm text-gray-500 mb-1">
        Your bank account is connected. Thanks for applying to Platypus Lending.
      </p>
      <p className="text-sm text-gray-400 mb-6">
        We're generating your application review for our team now — this usually takes just a moment.
      </p>

      {pollingFallback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-left">
          <p className="text-xs text-yellow-800">
            {webhookUrl
              ? `Webhook receiver endpoint ${webhookUrl} invalid, falling back to polling.`
              : "No webhook URL configured — polling for report status automatically."}
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <button
          onClick={handleManualCheck}
          className="bg-gray-100 text-gray-700 py-2 px-5 rounded hover:bg-gray-200 border border-gray-300 text-sm font-medium"
        >
          Check Now
        </button>
        <button
          onClick={handleStartOver}
          disabled={isResetting}
          className="text-sm text-gray-400 hover:text-gray-600 underline disabled:opacity-50"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ReportPending;
