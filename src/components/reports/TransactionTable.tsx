import { BaseReportTransaction } from "../../lib/types";
import { showAsCurrency, formatDate, formatCategory } from "../../lib/utils";

interface TransactionTableProps {
  transactions: BaseReportTransaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No transactions found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
              Date
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
              Description
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
              Category
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {[...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50).map((txn) => (
            <tr
              key={txn.transaction_id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                {formatDate(txn.date)}
              </td>
              <td className="py-2 px-3 text-gray-800">
                {txn.merchant_name || txn.name || txn.description || txn.original_description || "—"}
              </td>
              <td className="py-2 px-3 text-gray-500 text-xs">
                {txn.credit_category ? (
                  <>
                    <span className="capitalize">{formatCategory(txn.credit_category.primary)}</span>
                    {(() => {
                      const sub = txn.credit_category.detailed
                        ? formatCategory(
                            txn.credit_category.detailed
                              .replace(new RegExp(`^${txn.credit_category.primary}_?`, "i"), "")
                              .trim()
                          )
                        : null;
                      return sub && sub !== formatCategory(txn.credit_category.primary)
                        ? <span className="block text-gray-400 capitalize">{sub}</span>
                        : null;
                    })()}
                  </>
                ) : "—"}
              </td>
              <td
                className={`py-2 px-3 text-right font-medium ${
                  txn.amount < 0 ? "text-green-600" : "text-gray-800"
                }`}
              >
                {showAsCurrency(Math.abs(txn.amount))}
                {txn.amount < 0 && (
                  <span className="text-xs text-gray-400 ml-1">cr</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length > 50 && (
        <p className="text-xs text-gray-400 mt-2 px-3">
          Showing 50 of {transactions.length} transactions.
        </p>
      )}
    </div>
  );
};

export default TransactionTable;
