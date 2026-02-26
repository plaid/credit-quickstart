import { NetworkInsightsData } from "../../lib/types";
import { formatAttributeValue } from "../../lib/utils";

interface NetworkInsightsViewProps {
  data: NetworkInsightsData | null;
}

const NetworkInsightsView: React.FC<NetworkInsightsViewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">Network Insights data is not available for this report.</p>
        <p className="text-xs mt-1">This beta feature may not be enabled for your account.</p>
      </div>
    );
  }

  const report = data.report;
  const items = report?.items ?? [];
  const attributes = report?.network_attributes;
  const attributeEntries = attributes ? Object.entries(attributes) : [];

  return (
    <div className="space-y-6">
      {report?.generated_time && (
        <p className="text-xs text-gray-400">
          Generated: <span className="font-medium text-gray-600">{new Date(report.generated_time).toLocaleString()}</span>
        </p>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">About Network Insights</h3>
        <p className="text-xs text-blue-700">
          Differentiated risk signals based on a user's connection history, including services not
          consistently reported to traditional credit bureaus — such as rent, BNPL, cash advances,
          and earned wage access.
        </p>
      </div>

      {items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Connected Institutions</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={item.item_id ?? i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border border-gray-100">
                <span className="text-sm text-gray-800 font-medium">{item.institution_name ?? "Unknown Institution"}</span>
                <span className="text-xs text-gray-400 font-mono">{item.institution_id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {attributeEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Network Attributes</h3>
          <div className="rounded border border-gray-200 divide-y divide-gray-100">
            {attributeEntries.map(([key, value]) => (
              <div key={key} className="flex gap-4 px-3 py-1.5">
                <span className="font-mono text-xs text-gray-500 flex-1 min-w-0 break-all">{key}</span>
                <span className="font-mono text-xs text-gray-800 shrink-0 text-right">{formatAttributeValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && attributeEntries.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No network attribute data returned.</p>
      )}
    </div>
  );
};

export default NetworkInsightsView;
