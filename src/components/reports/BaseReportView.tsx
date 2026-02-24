import { useAppContext } from "../../context/AppContext";
import { showAsCurrency } from "../../lib/utils";
import TransactionTable from "./TransactionTable";
import { BaseReportTransaction } from "../../lib/types";

const BaseReportView: React.FC = () => {
  const { baseReport } = useAppContext();

  if (!baseReport?.report?.items?.length) {
    return <p className="text-gray-500 text-sm py-4">No base report data available.</p>;
  }

  const item = baseReport.report.items[0];
  const accounts = item.accounts ?? [];
  const transactions: BaseReportTransaction[] = accounts.flatMap(
    (account) => account.transactions ?? []
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Accounts</h3>
        <div className="grid gap-3">
          {accounts.map((account) => (
            <div
              key={account.account_id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{account.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {account.type} · {account.subtype}
                  </p>
                </div>
                <div className="text-right">
                  {account.balances.current != null && (
                    <p className="font-semibold text-gray-800">
                      {showAsCurrency(account.balances.current)}
                    </p>
                  )}
                  {account.balances.available != null && (
                    <p className="text-xs text-gray-500">
                      Available: {showAsCurrency(account.balances.available)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Recent Transactions
        </h3>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
};

export default BaseReportView;
