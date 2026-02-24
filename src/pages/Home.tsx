import { useAppContext } from "../context/AppContext";
import { FlowState } from "../lib/constants";
import { callMyServer } from "../lib/utils";
import Header from "../components/layout/Header";
import PlatypusLogo from "../components/PlatypusLogo";
import DebugPanel from "../components/layout/DebugPanel";
import ApplicantForm from "../components/steps/ApplicantForm";
import LinkConnect from "../components/steps/LinkConnect";
import ReportPending from "../components/steps/ReportPending";
import ReportDashboard from "../components/steps/ReportDashboard";
import { ApplicantFormData } from "../lib/types";
import { useState, useEffect } from "react";

const Home: React.FC = () => {
  const {
    flowState,
    setFlowState,
    linkToken,
    setLinkToken,
    setApplicantData,
    setDebugInfo,
    setWebhookUrl,
    setBaseReport,
    setIncomeInsights,
  } = useAppContext();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [linkExited, setLinkExited] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreState = async () => {
      const [webhookData, status] = await Promise.all([
        callMyServer<{ webhookUrl: string }>("/server/tokens/webhook_url"),
        callMyServer<{ hasUser: boolean; reportReady: boolean }>("/server/users/status"),
      ]);

      if (webhookData?.webhookUrl) setWebhookUrl(webhookData.webhookUrl);

      if (status?.hasUser) {
        const [baseReport, incomeInsights] = await Promise.all([
          callMyServer("/server/reports/base_report"),
          callMyServer("/server/reports/income_insights"),
        ]);
        if (baseReport && incomeInsights) {
          setBaseReport(baseReport);
          setIncomeInsights(incomeInsights);
          setFlowState(FlowState.REPORT_READY);
        } else {
          setFlowState(FlowState.REPORT_PENDING);
        }
      }
      setIsInitializing(false);
    };
    restoreState();
  }, [setWebhookUrl, setFlowState, setBaseReport, setIncomeInsights]);

  const handleApplyClicked = () => {
    setFlowState(FlowState.APPLICANT_FORM);
    setDebugInfo("Fill in your applicant info, or use 'Fill with test data' for sandbox credentials.");
  };

  const handleFormSubmit = async (data: ApplicantFormData) => {
    setIsCreatingUser(true);
    setApplicantData(data);
    setDebugInfo("Creating your Plaid user...");

    const result = await callMyServer<{ status: string }>(
      "/server/users/create",
      true,
      data,
      setDebugInfo
    );

    if (!result) {
      setIsCreatingUser(false);
      return;
    }

    setDebugInfo("User created. Generating Link token...");

    const tokenResult = await callMyServer<{ linkToken: string }>(
      "/server/tokens/create_link_token",
      true,
      {},
      setDebugInfo
    );

    if (!tokenResult) {
      setIsCreatingUser(false);
      return;
    }

    setLinkToken(tokenResult.linkToken);
    setDebugInfo(
      `Link token created. Opening Plaid Link...\n\nIn sandbox, use a non-OAuth institution (e.g. First Platypus Bank) with credentials that have income data:\n• Username: user_bank_income  Password: {}\n• Username: user_credit_profile_excellent  Password: any\n• Username: user_credit_profile_good  Password: any\n\nSee README for the full list of test users.`
    );
    setIsCreatingUser(false);
    setLinkExited(false);
    setFlowState(FlowState.LINK_CONNECT);
  };

  const handleLinkSuccess = (_publicToken: string) => {
    setDebugInfo(
      "Bank account connected! Waiting for Plaid to generate your report...\n\nPlaid will send a USER_CHECK_REPORT_READY webhook when the report is ready."
    );
    setFlowState(FlowState.REPORT_PENDING);
  };

  const handleLinkExit = () => {
    setLinkExited(true);
    setDebugInfo("Plaid Link was closed. You can reopen it or go back.");
  };

  const handleRetryLink = () => {
    setLinkExited(false);
  };

  const renderContent = () => {
    switch (flowState) {
      case FlowState.WELCOME:
        return (
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <PlatypusLogo size={120} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Platypus Lending
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Loans for people as unique as us.
            </p>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Ready to apply for a loan? We'll securely connect to your bank
              account via Plaid to evaluate your application — no credit checks,
              pay stubs, or tax forms required.
            </p>
            <button
              onClick={handleApplyClicked}
              className="w-full bg-mint-600 text-white py-3 px-4 rounded hover:bg-mint-500 font-medium text-lg"
            >
              Apply for a Loan
            </button>
          </div>
        );

      case FlowState.APPLICANT_FORM:
        return (
          <ApplicantForm onSubmit={handleFormSubmit} isLoading={isCreatingUser} />
        );

      case FlowState.LINK_CONNECT:
        if (linkExited) {
          return (
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Connection Cancelled
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                You closed the bank connection window. You'll need to connect
                your bank to continue with your loan application.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetryLink}
                  className="bg-mint-600 text-white py-2 px-5 rounded hover:bg-mint-500 font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setFlowState(FlowState.APPLICANT_FORM)}
                  className="bg-gray-100 text-gray-700 py-2 px-5 rounded hover:bg-gray-200 border border-gray-300"
                >
                  Go Back
                </button>
              </div>
            </div>
          );
        }
        if (!linkToken) {
          return (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-mint-450"></div>
              <span>Loading...</span>
            </div>
          );
        }
        return (
          <LinkConnect
            linkToken={linkToken}
            onSuccess={handleLinkSuccess}
            onExit={handleLinkExit}
          />
        );

      case FlowState.REPORT_PENDING:
        return <ReportPending />;

      case FlowState.REPORT_READY:
        return <ReportDashboard />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex items-start justify-center pt-8 pb-8 flex-grow px-4">
        {isInitializing ? (
          <div className="flex items-center justify-center gap-2 text-gray-400 pt-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mint-600"></div>
          </div>
        ) : renderContent()}
      </div>
      <div className="max-w-3xl mx-auto w-full px-4 pb-4">
        <DebugPanel />
      </div>

      {flowState === FlowState.LINK_CONNECT && (
        <div className="fixed bottom-12 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs z-50 max-w-xs">
          <p className="font-semibold text-gray-700 mb-1">Sandbox credentials</p>
          <p className="font-semibold text-orange-600 mb-2">⚠ To use the credentials below, click "Add new account" in Link and select a non-OAuth bank (e.g. First Platypus Bank).</p>
          <table className="w-full font-mono">
            <thead>
              <tr className="text-gray-400 text-xs">
                <th className="text-left pr-3 font-normal">Username</th>
                <th className="text-left pr-3 font-normal">Password</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-orange-600 font-semibold">
                <td className="pr-3">user_bank_income</td>
                <td>{"{}"}</td>
              </tr>
              <tr className="text-gray-500">
                <td className="pr-3">user_credit_profile_excellent</td>
                <td>any</td>
              </tr>
              <tr className="text-gray-500">
                <td className="pr-3">user_credit_profile_good</td>
                <td>any</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Home;
