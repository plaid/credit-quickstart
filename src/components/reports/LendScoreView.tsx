import { LendScoreData } from "../../lib/types";

const REASON_CODE_LABELS: Record<string, string> = {
  PCS0201: "Low bank account balance",
  PCS0202: "Unstable bank account balance",
  PCS0203: "High number of bank penalties",
  PCS0204: "High variation in number of buy now pay later loans",
  PCS0205: "Too many buy now pay later loans",
  PCS0206: "High variation in number of cash advances",
  PCS0207: "Too many cash advances",
  PCS0208: "High reliance on cash",
  PCS0209: "Unstable reliance on cash",
  PCS0210: "Not enough connected accounts",
  PCS0211: "High number of Plaid connections to lending applications",
  PCS0212: "Low level of available credit",
  PCS0213: "Low usage of credit cards",
  PCS0214: "Unstable credit card payment history",
  PCS0215: "Low amount of credit card payments",
  PCS0216: "High credit utilization",
  PCS0217: "Unstable usage of credit cards",
  PCS0218: "Low spending in essential categories (groceries, rent, utilities)",
  PCS0219: "High expenses relative to income or savings",
  PCS0220: "Low income amount",
  PCS0221: "High variation in income amounts",
  PCS0222: "Low amount of large purchases",
  PCS0223: "High spending in leisure and lifestyle activities, including dining, entertainment, travel",
  PCS0224: "High variation in amount of loans originated",
  PCS0225: "Too many loans",
  PCS0226: "High volatility of long term loan payments",
  PCS0227: "Low payments to long term loans",
  PCS0228: "Low number of income sources",
  PCS0229: "High volatility of personal loan payments",
  PCS0230: "High payments to personal loans",
  PCS0231: "Recent Plaid connections to personal lending applications",
  PCS0232: "Low recurring expenses",
  PCS0233: "High variation in payments to BNPL and cash advance loans",
  PCS0234: "High payments to BNPL and cash advance loans",
  PCS0235: "Low transaction amount and volume",
};

interface LendScoreViewProps {
  data: LendScoreData | null;
}

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const pct = (score / 99) * 100;
  const color =
    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="flex items-center gap-4">
      <div className="text-5xl font-bold text-gray-800">{score}</div>
      <div className="flex-1">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>1</span>
          <span>Higher = lower risk</span>
          <span>99</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const LendScoreView: React.FC<LendScoreViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">LendScore data is not available for this report.</p>
        <p className="text-xs mt-1">This beta feature may not be enabled for your account.</p>
      </div>
    );
  }

  const report = data.report;
  const lendScore = report?.lend_score;

  return (
    <div className="space-y-6">
      {report?.generated_time && (
        <p className="text-xs text-gray-400">
          Generated: <span className="font-medium text-gray-600">{new Date(report.generated_time).toLocaleString()}</span>
        </p>
      )}

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-indigo-800 mb-1">About LendScore</h3>
        <p className="text-xs text-indigo-700">
          A score from 1–99 indicating how likely a borrower is to default over the next 12 months
          across a broad range of credit products. A higher score indicates greater likelihood of
          repayment. Scores are based on Cash Flow Insights and Network Insights.
        </p>
      </div>

      {lendScore ? (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          {lendScore.score != null ? (
            <ScoreGauge score={lendScore.score} />
          ) : lendScore.error_reason ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800 font-medium">Score unavailable</p>
              <p className="text-xs text-yellow-700 mt-1">{lendScore.error_reason}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Score unavailable</p>
          )}

          {lendScore.reason_codes && lendScore.reason_codes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Top risk factors (adverse action)
              </h4>
              <ol className="space-y-2">
                {lendScore.reason_codes.map((code, i) => (
                  <li key={code} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 w-4 mt-0.5">{i + 1}.</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-mono">
                        {code}
                      </span>
                      {REASON_CODE_LABELS[code] ? (
                        <span className="text-xs text-gray-700">{REASON_CODE_LABELS[code]}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unknown code</span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">No LendScore returned.</p>
      )}
    </div>
  );
};

export default LendScoreView;
