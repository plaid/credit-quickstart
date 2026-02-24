import { useAppContext } from "../../context/AppContext";
import { showAsCurrency } from "../../lib/utils";
import IncomeStreamCard from "./IncomeStreamCard";

const IncomeInsightsView: React.FC = () => {
  const { incomeInsights } = useAppContext();

  if (!incomeInsights?.report?.items?.length) {
    return (
      <p className="text-gray-500 text-sm py-4">
        No income insights data available.
      </p>
    );
  }

  const item = incomeInsights.report.items[0];
  const summary = item.bank_income_summary;
  const sources = item.bank_income_sources ?? [];

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-mint-100 border border-mint-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-mint-700 mb-3">
            Income Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {summary.projected_monthly_income != null && (
              <div>
                <p className="text-2xl font-bold text-mint-600">
                  {showAsCurrency(summary.projected_monthly_income)}
                </p>
                <p className="text-xs text-mint-500">projected/mo</p>
              </div>
            )}
            {summary.historical_average_monthly_income != null && (
              <div>
                <p className="text-2xl font-bold text-mint-600">
                  {showAsCurrency(summary.historical_average_monthly_income)}
                </p>
                <p className="text-xs text-mint-500">historical avg/mo</p>
              </div>
            )}
            {summary.income_sources_count != null && (
              <div>
                <p className="text-2xl font-bold text-mint-600">
                  {summary.income_sources_count}
                </p>
                <p className="text-xs text-mint-500">income sources</p>
              </div>
            )}
            {summary.total_transactions != null && (
              <div>
                <p className="text-2xl font-bold text-mint-600">
                  {summary.total_transactions}
                </p>
                <p className="text-xs text-mint-500">income transactions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Income Sources
          </h3>
          <div className="space-y-3">
            {sources.map((source) => (
              <IncomeStreamCard
                key={source.income_source_id}
                description={source.income_description}
                category={source.income_category}
                payFrequency={source.pay_frequency}
                projectedMonthlyIncome={source.projected_monthly_income}
                historicalAverageMonthlyIncome={
                  source.historical_average_monthly_income
                }
                employerName={source.employer?.name}
              />
            ))}
          </div>
        </div>
      )}

      {sources.length === 0 && (
        <p className="text-sm text-gray-500">No income sources detected.</p>
      )}
    </div>
  );
};

export default IncomeInsightsView;
