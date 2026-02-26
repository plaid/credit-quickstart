import { CashflowInsightsData } from "../../lib/types";
import { showAsCurrency } from "../../lib/utils";

function formatAttributeValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.amount === "number" && typeof obj.iso_currency_code === "string") {
      return showAsCurrency(obj.amount);
    }
    return JSON.stringify(value);
  }
  return String(value);
}

interface CashflowInsightsViewProps {
  data: CashflowInsightsData | null;
}

const CashflowInsightsView: React.FC<CashflowInsightsViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">Cashflow Insights data is not available for this report.</p>
        <p className="text-xs mt-1">This beta feature may not be enabled for your account.</p>
      </div>
    );
  }

  const report = data.report;
  const attributes = report?.attributes as Record<string, unknown> | undefined;
  const attributeEntries = attributes ? Object.entries(attributes) : [];

  const plaidCheckScore = report?.plaid_check_score;

  return (
    <div className="space-y-6">
      {report?.generated_time && (
        <p className="text-xs text-gray-400">
          Generated: <span className="font-medium text-gray-600">{new Date(report.generated_time).toLocaleString()}</span>
        </p>
      )}

      <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-teal-800 mb-1">About Cashflow Insights</h3>
        <p className="text-xs text-teal-700">
          Aggregated transaction data across all permissioned accounts, including measures of
          volatility across income and expenditure categories. Forms the foundation for the
          Plaid LendScore.
        </p>
      </div>

      {plaidCheckScore && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Plaid Check Score</h3>
          {plaidCheckScore.score != null ? (
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-mint-600">{plaidCheckScore.score}</div>
              <div className="text-xs text-gray-500">out of 99</div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Score unavailable</p>
          )}
          {plaidCheckScore.reason_codes && plaidCheckScore.reason_codes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Reason codes:</p>
              <div className="flex flex-wrap gap-1">
                {plaidCheckScore.reason_codes.map((code) => (
                  <span key={code} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {attributeEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cashflow Attributes</h3>
          <div className="rounded border border-gray-200 divide-y divide-gray-100">
            {attributeEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-4 px-3 py-2">
                <span className="font-mono text-xs text-gray-500 w-1/2 shrink-0 break-all">{key}</span>
                <span className="font-mono text-xs text-gray-800 break-all">
                  {formatAttributeValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!plaidCheckScore && attributeEntries.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No cashflow attribute data returned.</p>
      )}
    </div>
  );
};

export default CashflowInsightsView;
