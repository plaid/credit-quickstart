import { HomeLendingData } from "../../lib/types";
import { showAsCurrency } from "../../lib/utils";

interface HomeLendingViewProps {
  data: HomeLendingData | null;
}

const HomeLendingView: React.FC<HomeLendingViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">Home Lending (VOA) data is not available.</p>
      </div>
    );
  }

  const voa = data.report?.voa;
  if (!voa) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">Verification of Assets (VOA) report not found.</p>
      </div>
    );
  }

  const allAccounts = voa.items?.flatMap((item) => item.accounts ?? []) ?? [];
  const attributes = voa.attributes as Record<string, unknown> | undefined;
  const attributeEntries = attributes ? Object.entries(attributes) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          {voa.generated_time && (
            <p className="text-xs text-gray-400">
              Generated: <span className="font-medium text-gray-600">{new Date(voa.generated_time).toLocaleString()}</span>
            </p>
          )}
          {voa.days_requested && (
            <p className="text-xs text-gray-400">
              Days requested: <span className="font-medium text-gray-600">{voa.days_requested}</span>
            </p>
          )}
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">VOA Report</span>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">Verification of Assets</h3>
        <p className="text-xs text-blue-700">
          This report is designed for home lending use cases and can be shared with GSEs such as
          Fannie Mae and Freddie Mac for mortgage verification.
        </p>
      </div>

      {allAccounts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Verified Accounts</h3>
          <div className="space-y-3">
            {allAccounts.map((account, i) => (
              <div key={account.account_id ?? i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{account.name}</p>
                    {account.official_name && (
                      <p className="text-xs text-gray-500">{account.official_name}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {account.type}{account.subtype ? ` · ${account.subtype}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {account.balances?.current != null && (
                      <div>
                        <p className="text-xs text-gray-400">Current</p>
                        <p className="text-sm font-semibold text-gray-800">{showAsCurrency(account.balances.current)}</p>
                      </div>
                    )}
                    {account.balances?.available != null && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-400">Available</p>
                        <p className="text-sm text-gray-600">{showAsCurrency(account.balances.available)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attributeEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">VOA Attributes</h3>
          <div className="rounded border border-gray-200 divide-y divide-gray-100">
            {attributeEntries.map(([key, value]) => (
              <div key={key} className="flex items-start gap-4 px-3 py-2">
                <span className="font-mono text-xs text-gray-500 w-1/2 shrink-0 break-all">{key}</span>
                <span className="font-mono text-xs text-gray-800 break-all">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeLendingView;
