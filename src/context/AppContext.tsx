import { createContext, useContext, useState, ReactNode } from "react";
import { FlowState } from "../lib/constants";
import { callMyServer } from "../lib/utils";
import {
  ApplicantFormData,
  BaseReportData,
  IncomeInsightsData,
  NetworkInsightsData,
  CashflowInsightsData,
  LendScoreData,
  HomeLendingData,
} from "../lib/types";

interface AppContextType {
  flowState: FlowState;
  setFlowState: (state: FlowState) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  linkToken: string | null;
  setLinkToken: (token: string | null) => void;
  applicantData: ApplicantFormData | null;
  setApplicantData: (data: ApplicantFormData | null) => void;
  baseReport: BaseReportData | null;
  setBaseReport: (data: BaseReportData | null) => void;
  incomeInsights: IncomeInsightsData | null;
  setIncomeInsights: (data: IncomeInsightsData | null) => void;
  networkInsights: NetworkInsightsData | null;
  setNetworkInsights: (data: NetworkInsightsData | null) => void;
  cashflowInsights: CashflowInsightsData | null;
  setCashflowInsights: (data: CashflowInsightsData | null) => void;
  lendScore: LendScoreData | null;
  setLendScore: (data: LendScoreData | null) => void;
  homeLendingData: HomeLendingData | null;
  setHomeLendingData: (data: HomeLendingData | null) => void;
  isHomeLending: boolean;
  setIsHomeLending: (v: boolean) => void;
  debugInfo: string;
  setDebugInfo: (info: string) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  resetApp: () => Promise<void>;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [baseReport, setBaseReport] = useState<BaseReportData | null>(null);
  const [incomeInsights, setIncomeInsights] = useState<IncomeInsightsData | null>(null);
  const [networkInsights, setNetworkInsights] = useState<NetworkInsightsData | null>(null);
  const [cashflowInsights, setCashflowInsights] = useState<CashflowInsightsData | null>(null);
  const [lendScore, setLendScore] = useState<LendScoreData | null>(null);
  const [homeLendingData, setHomeLendingData] = useState<HomeLendingData | null>(null);
  const [isHomeLending, setIsHomeLending] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string>("Debug info will appear here...");
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  const resetApp = async () => {
    await callMyServer("/server/users/reset", true, {});
    setBaseReport(null);
    setIncomeInsights(null);
    setNetworkInsights(null);
    setCashflowInsights(null);
    setLendScore(null);
    setHomeLendingData(null);
    setIsHomeLending(false);
    setUserId(null);
    setLinkToken(null);
    setApplicantData(null);
    setDebugInfo("Debug info will appear here...");
    setFlowState(FlowState.WELCOME);
  };

  return (
    <AppContext.Provider
      value={{
        flowState,
        setFlowState,
        userId,
        setUserId,
        linkToken,
        setLinkToken,
        applicantData,
        setApplicantData,
        baseReport,
        setBaseReport,
        incomeInsights,
        setIncomeInsights,
        networkInsights,
        setNetworkInsights,
        cashflowInsights,
        setCashflowInsights,
        lendScore,
        setLendScore,
        homeLendingData,
        setHomeLendingData,
        isHomeLending,
        setIsHomeLending,
        debugInfo,
        setDebugInfo,
        webhookUrl,
        setWebhookUrl,
        resetApp,
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
