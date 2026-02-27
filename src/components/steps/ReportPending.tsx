import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { callMyServer } from "../../lib/utils";
import { FlowState } from "../../lib/constants";

const POLL_INTERVAL_MS = 5000;

interface ReportPendingProps {
  isRefresh?: boolean;
  isEmploymentRefresh?: boolean;
}

const ReportPending: React.FC<ReportPendingProps> = ({ isRefresh = false, isEmploymentRefresh = false }) => {
  const {
    setFlowState,
    setBaseReport,
    setIncomeInsights,
    setNetworkInsights,
    setCashflowInsights,
    setLendScore,
    setHomeLendingData,
    setUserId,
    isHomeLending,
    webhookUrl,
    setDebugInfo,
    setLinkToken,
  } = useAppContext();
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webhookUrlRef = useRef(webhookUrl);
  useEffect(() => {
    webhookUrlRef.current = webhookUrl;
  }, [webhookUrl]);
  const [isResetting, setIsResetting] = useState(false);
  const [pollingFallback, setPollingFallback] = useState(false);

  const handleStartOver = async () => {
    setIsResetting(true);
    eventSourceRef.current?.close();
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    await callMyServer("/server/users/reset", true, {});
    setBaseReport(null);
    setIncomeInsights(null);
    setNetworkInsights(null);
    setCashflowInsights(null);
    setLendScore(null);
    setHomeLendingData(null);
    setUserId(null);
    setLinkToken(null);
    setDebugInfo("Debug info will appear here...");
    setFlowState(FlowState.WELCOME);
  };

  const fetchReports = async () => {
    if (isEmploymentRefresh) {
      // Employment refresh only updates home lending data — the base report
      // and all other tabs reflect the original loan application and stay unchanged.
      let coreError = "";
      const homeLendingData = await callMyServer(
        "/server/reports/home_lending",
        false,
        null,
        (msg) => { coreError = msg; }
      );
      if (!homeLendingData) {
        setDebugInfo(`Employment verification not ready yet — will retry.\n\n${coreError}`);
        return false;
      }
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setHomeLendingData(homeLendingData);
      setDebugInfo("Employment verification complete.");
      setFlowState(FlowState.REPORT_READY);
      return true;
    }

    const betaErrors: string[] = [];
    const logBetaError = (msg: string) => betaErrors.push(msg);

    let coreError = "";
    const logCoreError = (msg: string) => { coreError = msg; };

    const [baseReport, incomeInsights, networkInsights, cashflowInsights, lendScore] =
      await Promise.all([
        callMyServer("/server/reports/base_report", false, null, logCoreError),
        callMyServer("/server/reports/income_insights", false, null, logCoreError),
        callMyServer("/server/reports/network_insights", false, null, logBetaError),
        callMyServer("/server/reports/cashflow_insights", false, null, logBetaError),
        callMyServer("/server/reports/lend_score", false, null, logBetaError),
      ]);
    if (baseReport == null || incomeInsights == null) {
      setDebugInfo(`Report not ready yet — will retry.\n\n${coreError}`);
      return false;
    }
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setBaseReport(baseReport);
    setIncomeInsights(incomeInsights);
    if (networkInsights) setNetworkInsights(networkInsights);
    if (cashflowInsights) setCashflowInsights(cashflowInsights);
    if (lendScore) setLendScore(lendScore);
    if (isHomeLending) {
      const homeLendingData = await callMyServer("/server/reports/home_lending");
      if (homeLendingData) setHomeLendingData(homeLendingData);
    }
    const statusMsg = betaErrors.length > 0
      ? `Report loaded.\n\nWarnings:\n${betaErrors.join("\n")}`
      : "Report loaded successfully.";
    setDebugInfo(statusMsg);
    setFlowState(FlowState.REPORT_READY);
    return true;
  };

  const startPolling = (reason: string) => {
    setPollingFallback(true);
    setDebugInfo(reason);
    pollIntervalRef.current = setInterval(fetchReports, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    const es = new EventSource("/server/events/stream");
    eventSourceRef.current = es;

    const handleConnected = async () => {
      if (!webhookUrlRef.current) {
        startPolling("⚠️ No webhook URL configured — polling for report every 5s.");
        return;
      }

      const result = await callMyServer<{ valid: boolean }>(
        "/server/tokens/validate_webhook"
      );

      if (result?.valid) {
        setDebugInfo(`Waiting for webhook at ${webhookUrlRef.current}...`);
      } else {
        startPolling(
          `⚠️ Webhook receiver endpoint ${webhookUrlRef.current} invalid, falling back to polling every 5s.`
        );
      }
    };

    const handleReportReady = async () => {
      setDebugInfo("Report is ready! Fetching data...");
      await fetchReports();
    };

    es.addEventListener("connected", handleConnected);
    es.addEventListener("report-ready", handleReportReady);

    es.onerror = () => {
      es.removeEventListener("connected", handleConnected);
      es.removeEventListener("report-ready", handleReportReady);
      if (!pollIntervalRef.current) {
        startPolling("⚠️ SSE connection failed — polling for report every 5s.");
      }
    };

    return () => {
      es.removeEventListener("connected", handleConnected);
      es.removeEventListener("report-ready", handleReportReady);
      es.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
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
      {isEmploymentRefresh ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Verifying employment
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            Checking deposit history to confirm continued employment.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            This is the final verification step before closing — no new bank connection required.
          </p>
        </>
      ) : isRefresh ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Generating updated report
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            Simulating a returning borrower applying for a new loan.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Plaid is fetching their latest financial data — this usually takes just a moment.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            You're all done!
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            Your bank account is connected. Thanks for applying to Platypus Lending.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            We're generating your application review for our team now — this usually takes just a moment.
          </p>
        </>
      )}

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
