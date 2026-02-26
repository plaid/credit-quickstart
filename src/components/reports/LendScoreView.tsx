import { LendScoreData } from "../../lib/types";

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
          across a broad range of credit products. Based on Cash Flow Insights and Network Insights.
          A higher score indicates greater likelihood of repayment.
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
              <ol className="space-y-1">
                {lendScore.reason_codes.map((code, i) => (
                  <li key={code} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                    <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded font-mono">
                      {code}
                    </span>
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
