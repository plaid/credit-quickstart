import { createContext, useContext, useState, ReactNode } from "react";
import { FlowState } from "../lib/constants";
import { ApplicantFormData, BaseReportData, IncomeInsightsData } from "../lib/types";

interface AppContextType {
  flowState: FlowState;
  setFlowState: (state: FlowState) => void;
  linkToken: string | null;
  setLinkToken: (token: string | null) => void;
  applicantData: ApplicantFormData | null;
  setApplicantData: (data: ApplicantFormData | null) => void;
  baseReport: BaseReportData | null;
  setBaseReport: (data: BaseReportData | null) => void;
  incomeInsights: IncomeInsightsData | null;
  setIncomeInsights: (data: IncomeInsightsData | null) => void;
  debugInfo: string;
  setDebugInfo: (info: string) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flowState, setFlowState] = useState<FlowState>(FlowState.WELCOME);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [applicantData, setApplicantDataState] = useState<ApplicantFormData | null>(() => {
    try { return JSON.parse(localStorage.getItem("applicantData") ?? "null"); } catch { return null; }
  });
  const setApplicantData = (data: ApplicantFormData | null) => {
    if (data) localStorage.setItem("applicantData", JSON.stringify(data));
    else localStorage.removeItem("applicantData");
    setApplicantDataState(data);
  };
  const [baseReport, setBaseReport] = useState<BaseReportData | null>(null);
  const [incomeInsights, setIncomeInsights] = useState<IncomeInsightsData | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Debug info will appear here...");
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  return (
    <AppContext.Provider
      value={{
        flowState,
        setFlowState,
        linkToken,
        setLinkToken,
        applicantData,
        setApplicantData,
        baseReport,
        setBaseReport,
        incomeInsights,
        setIncomeInsights,
        debugInfo,
        setDebugInfo,
        webhookUrl,
        setWebhookUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
