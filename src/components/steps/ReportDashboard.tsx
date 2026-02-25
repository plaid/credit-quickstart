import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { FlowState } from "../../lib/constants";
import { callMyServer, formatPhone } from "../../lib/utils";
import BaseReportView from "../reports/BaseReportView";
import IncomeInsightsView from "../reports/IncomeInsightsView";
import ReportPdfButton from "../reports/ReportPdfButton";

type ReportTab = "base_report" | "income_insights";

const ReportDashboard: React.FC = () => {
  const { setFlowState, setBaseReport, setIncomeInsights, setLinkToken, setDebugInfo, setApplicantData, baseReport, applicantData } =
    useAppContext();

  const owner = baseReport?.report?.items
    ?.flatMap((item) => item.accounts ?? [])
    ?.flatMap((account) => account.owners ?? [])
    ?.find((o) => o.names?.length > 0 || o.phone_numbers?.length > 0);
  const dateGenerated = baseReport?.report?.date_generated
    ? new Date(baseReport.report.date_generated).toLocaleString()
    : null;
  const [activeTab, setActiveTab] = useState<ReportTab>("base_report");

  const handleRefreshReport = async () => {
    await callMyServer("/server/reports/refresh", true, {});
    setFlowState(FlowState.REPORT_REFRESH_PENDING);
  };

  const handleStartOver = async () => {
    await callMyServer("/server/users/reset", true, {});
    setBaseReport(null);
    setIncomeInsights(null);
    setLinkToken(null);
    setApplicantData(null);
    setDebugInfo("Debug info will appear here...");
    setFlowState(FlowState.WELCOME);
  };

  const tabClass = (tab: ReportTab) =>
    `py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-mint-450 text-mint-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div className="bg-white rounded-lg shadow-md w-full max-w-3xl">
      <div className="bg-mint-700 text-white px-6 py-2 rounded-t-lg text-xs font-medium tracking-wide uppercase">
        Underwriter view — Platypus Lending internal
      </div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Loan Application Review
            </h2>
            <div className="flex gap-8 mt-2 text-sm">
              {applicantData && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Applicant</p>
                  <p className="text-gray-800 font-medium">{applicantData.firstName} {applicantData.lastName}</p>
                  <p className="text-gray-500">{formatPhone(applicantData.phoneNumber)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Account owner</p>
                {owner && (owner.names[0] || owner.phone_numbers[0]) ? (
                  <>
                    {owner.names[0] && <p className="text-gray-800 font-medium">{owner.names[0]}</p>}
                    {owner.phone_numbers[0] && <p className="text-gray-500">{formatPhone(owner.phone_numbers[0].data)}</p>}
                  </>
                ) : (
                  <p className="text-gray-400 italic">Unavailable</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Powered by Plaid Check Reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ReportPdfButton />
            <button
              onClick={handleRefreshReport}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Simulate new application
            </button>
            <button
              onClick={handleStartOver}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      {dateGenerated && (
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
          Report generated: <span className="font-medium text-gray-700">{dateGenerated}</span>
        </div>
      )}
      <div className="border-b border-gray-200 px-6">
        <nav className="flex gap-4">
          <button
            className={tabClass("base_report")}
            onClick={() => setActiveTab("base_report")}
          >
            Base Report
          </button>
          <button
            className={tabClass("income_insights")}
            onClick={() => setActiveTab("income_insights")}
          >
            Income Insights
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "base_report" && <BaseReportView />}
        {activeTab === "income_insights" && <IncomeInsightsView />}
      </div>
    </div>
  );
};

export default ReportDashboard;
