import { useState } from "react";
import { HomeLendingData, VoaAmountField, VoaAccount, EmploymentRefreshTransaction } from "../../lib/types";
import { showAsCurrency, formatDate, formatCategory } from "../../lib/utils";
import { callMyServer } from "../../lib/utils";
import { useAppContext } from "../../context/AppContext";
import { FlowState } from "../../lib/constants";
import TransactionTable from "./TransactionTable";

interface HomeLendingViewProps {
  data: HomeLendingData | null;
}

// In Plaid's sign convention, credits (money coming IN) are negative and
// debits (money going OUT) are positive. Inflow is represented as a negative
// number; we display it as a positive amount with a label.
const formatVoaAmount = (field: VoaAmountField | null | undefined) => {
  if (field == null) return "—";
  const currency = field.iso_currency_code ?? "USD";
  return Math.abs(field.amount).toLocaleString("en-US", { style: "currency", currency });
};

const AccountCard: React.FC<{ account: VoaAccount }> = ({ account }) => {
  const [showTxns, setShowTxns] = useState(false);
  const txns = account.transactions_insights?.all_transactions ?? [];
  const owner = account.owners?.[0];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {account.name}
            {account.mask && <span className="text-gray-400 font-normal ml-1">···{account.mask}</span>}
          </p>
          {account.official_name && account.official_name !== account.name && (
            <p className="text-xs text-gray-500">{account.official_name}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded capitalize">
              {account.type}{account.subtype ? ` · ${account.subtype}` : ""}
            </span>
            {account.ownership_type && account.ownership_type !== "unknown" && (
              <span className="text-xs text-gray-400 capitalize">{formatCategory(account.ownership_type)}</span>
            )}
            <span className="text-xs text-gray-400">{account.days_available} days history</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          {account.balances.current != null && (
            <div>
              <p className="text-xs text-gray-400">Current</p>
              <p className="text-sm font-semibold text-gray-800">{showAsCurrency(account.balances.current)}</p>
            </div>
          )}
          {account.balances.available != null && (
            <div className="mt-1">
              <p className="text-xs text-gray-400">Available</p>
              <p className="text-sm text-gray-600">{showAsCurrency(account.balances.available)}</p>
            </div>
          )}
          {account.balances.limit != null && (
            <div className="mt-1">
              <p className="text-xs text-gray-400">Limit</p>
              <p className="text-sm text-gray-600">{showAsCurrency(account.balances.limit)}</p>
            </div>
          )}
        </div>
      </div>

      {owner && (owner.names?.[0] || owner.addresses?.[0]) && (
        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-medium text-gray-600">Owner: </span>
          {owner.names?.[0] && <span>{owner.names[0]}</span>}
          {owner.addresses?.[0] && (
            <span className="ml-2 text-gray-400">
              {[
                owner.addresses[0].data.street,
                owner.addresses[0].data.city,
                owner.addresses[0].data.region,
                owner.addresses[0].data.postal_code,
              ].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      )}

      {txns.length > 0 && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setShowTxns(!showTxns)}
            className="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-left flex justify-between items-center"
          >
            <span>
              {txns.length} transaction{txns.length !== 1 ? "s" : ""}
              {account.transactions_insights.start_date && account.transactions_insights.end_date && (
                <span className="text-gray-400 ml-1">
                  ({formatDate(account.transactions_insights.start_date)} – {formatDate(account.transactions_insights.end_date)})
                </span>
              )}
            </span>
            <span>{showTxns ? "▲" : "▼"}</span>
          </button>
          {showTxns && (
            <div className="border-t border-gray-100">
              <TransactionTable transactions={txns} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EmploymentRefreshSection: React.FC<{
  data: NonNullable<HomeLendingData["report"]>["employment_refresh"] | null | undefined;
}> = ({ data }) => {
  const { setFlowState, setHomeLendingData } = useAppContext();
  const [showTxns, setShowTxns] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await callMyServer("/server/reports/refresh_employment", true, {});
    setRefreshing(false);
    if (result) {
      setHomeLendingData(null);
      setFlowState(FlowState.EMPLOYMENT_REFRESH_PENDING);
    }
  };

  const handleDownloadPdf = async () => {
    const response = await fetch("/server/reports/home_lending_employment_pdf");
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employment_refresh_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const allTxns = data?.items.flatMap((item) => item.accounts.flatMap((a) => a.transactions)) ?? [];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Employment Refresh</span>
            {data && <span className="text-xs text-gray-400">{new Date(data.generated_time).toLocaleString()}</span>}
          </div>
          <p className="text-xs text-purple-700 mt-0.5">
            Lightweight refresh that verifies continued employment via deposit patterns — no re-running Link required.
            Amounts are omitted by design.
          </p>
          <p className="text-xs text-purple-600 mt-0.5">
            The PDF is Plaid's official GSE-formatted report and contains a more limited field set than the data shown here.
          </p>
        </div>
        <div className="flex gap-2 ml-4 shrink-0">
          {data && (
            <button onClick={handleDownloadPdf} className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 font-medium">
              Download PDF
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-500 disabled:opacity-50 font-medium"
          >
            {refreshing ? "Requesting..." : data ? "Re-run" : "Run Employment Refresh"}
          </button>
        </div>
      </div>

      {!data ? (
        <div className="px-4 py-6 text-center text-gray-400">
          <p className="text-sm">No Employment Refresh data yet.</p>
          <p className="text-xs mt-1">Click "Run Employment Refresh" above to verify continued employment without re-running Link.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          <div className="px-4 py-2 text-xs text-gray-500">
            {data.days_requested} days · {allTxns.length} deposit{allTxns.length !== 1 ? "s" : ""} detected
          </div>
          {data.items.map((item, i) => (
            <div key={item.item_id ?? i}>
              <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{item.institution_name}</span>
                <span className="text-xs text-gray-400">Updated {new Date(item.last_update_time).toLocaleString()}</span>
              </div>
              {item.accounts.map((account) => (
                <div key={account.account_id} className="border-t border-gray-100">
                  <button
                    onClick={() => setShowTxns((prev) => ({ ...prev, [account.account_id]: !prev[account.account_id] }))}
                    className="w-full px-4 py-2 text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-800">{account.name}</span>
                      <span className="text-xs text-gray-400 ml-2 capitalize">{account.type}{account.subtype ? ` · ${account.subtype}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{account.transactions.length} deposit{account.transactions.length !== 1 ? "s" : ""}</span>
                      <span className="text-xs text-gray-400">{showTxns[account.account_id] ? "▲" : "▼"}</span>
                    </div>
                  </button>
                  {showTxns[account.account_id] && account.transactions.length > 0 && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      <div className="grid grid-cols-2 px-4 py-1.5 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <span>Description</span>
                        <span className="text-right">Date</span>
                      </div>
                      {[...account.transactions].sort((a, b) => b.date.localeCompare(a.date)).map((txn: EmploymentRefreshTransaction, j) => (
                        <div key={j} className="grid grid-cols-2 px-4 py-2 text-xs">
                          <span className="text-gray-700">{txn.original_description}</span>
                          <span className="text-gray-500 text-right">
                            {formatDate(txn.date)}
                            {txn.pending && <span className="text-yellow-600 ml-1">(pending)</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SharingTokenSection: React.FC = () => {
  const [partner, setPartner] = useState<"fannie-mae" | "freddie-mac">("fannie-mae");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setToken(null);
    setError(null);
    const result = await callMyServer<{ access_token: string }>(
      `/server/reports/home_lending_sharing_token?partner=${partner}`,
      false,
      null,
      (msg) => setError(msg)
    );
    setLoading(false);
    if (result?.access_token) setToken(result.access_token);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-700">GSE Sharing Token</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Generate an OAuth token to share this VOA report with a GSE partner (Fannie Mae or Freddie Mac).
        </p>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={partner}
          onChange={(e) => { setPartner(e.target.value as "fannie-mae" | "freddie-mac"); setToken(null); setError(null); }}
          className="text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-mint-450"
        >
          <option value="fannie-mae">Fannie Mae</option>
          <option value="freddie-mac">Freddie Mac</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-sm bg-mint-600 text-white px-3 py-1.5 rounded hover:bg-mint-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate token"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {token && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Share this token with {partner === "fannie-mae" ? "Fannie Mae" : "Freddie Mac"}:</p>
          <div className="bg-gray-900 text-green-400 font-mono text-xs p-3 rounded break-all select-all">
            {token}
          </div>
          <p className="text-xs text-gray-400 mt-1">This token is time-limited. Generate a new one for each sharing session.</p>
        </div>
      )}
    </div>
  );
};

const HomeLendingView: React.FC<HomeLendingViewProps> = ({ data }) => {
  const handleDownloadPdf = async () => {
    const response = await fetch("/server/reports/home_lending_pdf");
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voa_report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

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
  const totalTxnCount = allAccounts.reduce(
    (sum, a) => sum + (a.transactions_insights?.all_transactions?.length ?? 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">VOA Report</span>
            <span className="text-xs text-gray-400">
              {new Date(voa.generated_time).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {voa.days_requested} days requested · {allAccounts.length} account{allAccounts.length !== 1 ? "s" : ""} · {totalTxnCount.toLocaleString()} transactions
          </p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 font-medium flex items-center gap-1.5"
        >
          Download PDF
        </button>
      </div>

      {/* Inflow / Outflow summary */}
      {(voa.attributes?.total_inflow_amount != null || voa.attributes?.total_outflow_amount != null) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-xs text-green-700 font-medium uppercase tracking-wide mb-1">Total Inflow</p>
            <p className="text-2xl font-bold text-green-800">
              {formatVoaAmount(voa.attributes.total_inflow_amount)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Money received into the account over the report period. Plaid represents deposits as negative amounts internally; this displays the absolute value.
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="text-xs text-red-700 font-medium uppercase tracking-wide mb-1">Total Outflow</p>
            <p className="text-2xl font-bold text-red-800">
              {formatVoaAmount(voa.attributes.total_outflow_amount)}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Money leaving the account over the report period (purchases, transfers, bills).
            </p>
          </div>
        </div>
      )}

      {/* Institutions & accounts */}
      {voa.items?.map((item, i) => (
        <div key={item.item_id ?? i}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-700">{item.institution_name}</h3>
            <span className="text-xs text-gray-400 font-mono">{item.institution_id}</span>
            {item.last_update_time && (
              <span className="text-xs text-gray-400 ml-auto">
                Updated {new Date(item.last_update_time).toLocaleString()}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {item.accounts.map((account) => (
              <AccountCard key={account.account_id} account={account} />
            ))}
          </div>
        </div>
      ))}

      {/* Employment Refresh */}
      <EmploymentRefreshSection data={data.report?.employment_refresh} />

      {/* GSE sharing token */}
      <SharingTokenSection />
    </div>
  );
};

export default HomeLendingView;
