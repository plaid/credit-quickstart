import { showAsCurrency } from "../../lib/utils";

interface IncomeStreamCardProps {
  description: string;
  category: string;
  payFrequency?: string;
  projectedMonthlyIncome?: number;
  historicalAverageMonthlyIncome?: number;
  employerName?: string;
}

const IncomeStreamCard: React.FC<IncomeStreamCardProps> = ({
  description,
  category,
  payFrequency,
  projectedMonthlyIncome,
  historicalAverageMonthlyIncome,
  employerName,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 mr-4">
          <p className="font-medium text-gray-800 truncate">{description}</p>
          {employerName && (
            <p className="text-xs text-gray-500">{employerName}</p>
          )}
          <div className="flex gap-3 mt-1">
            {category.toUpperCase() !== "UNKNOWN" && (
              <span className="text-xs bg-mint-100 text-mint-600 px-2 py-0.5 rounded-full capitalize">
                {category.replace(/_/g, " ").toLowerCase()}
              </span>
            )}
            {payFrequency && payFrequency.toUpperCase() !== "UNKNOWN" && (
              <span className="text-xs text-gray-500 capitalize">
                {payFrequency.replace(/_/g, " ").toLowerCase()}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {projectedMonthlyIncome != null && (
            <div>
              <p className="font-semibold text-gray-800">
                {showAsCurrency(projectedMonthlyIncome)}
              </p>
              <p className="text-xs text-gray-500">projected/mo</p>
            </div>
          )}
          {historicalAverageMonthlyIncome != null && (
            <p className="text-xs text-gray-500 mt-1">
              avg {showAsCurrency(historicalAverageMonthlyIncome)}/mo
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeStreamCard;
