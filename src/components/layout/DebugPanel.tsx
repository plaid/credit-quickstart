import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { callMyServer } from "../../lib/utils";

const DebugPanel: React.FC = () => {
  const { debugInfo, webhookUrl, setWebhookUrl, userId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  const handleUpdateWebhook = async () => {
    const url = newWebhookUrl.trim();
    if (!url) return;
    const result = await callMyServer<{ status: string; webhookUrl: string }>(
      "/server/tokens/update_webhook",
      true,
      { newUrl: url }
    );
    if (result) {
      setWebhookUrl(result.webhookUrl);
      setUpdateStatus("✅ Webhook URL updated");
      setNewWebhookUrl("");
      setTimeout(() => setUpdateStatus(""), 3000);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-900 text-gray-400 p-3 text-left text-xs font-semibold uppercase tracking-wider flex justify-between items-center hover:bg-gray-800"
      >
        <span>Debug Panel</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm">
          <div className="mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Status
            </p>
            <textarea
              readOnly
              value={debugInfo}
              className="w-full bg-gray-800 text-green-400 p-2 rounded border border-gray-700 font-mono text-xs resize-none focus:outline-none"
              rows={4}
            />
          </div>

          {userId && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">User ID</p>
              <p className="text-xs text-yellow-300 font-mono">{userId}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Webhook URL
            </p>
            <p className="text-xs text-yellow-300 mb-2">
              {webhookUrl
                ? `Current: ${webhookUrl}`
                : "⚠️ No webhook URL configured. Use the manual check button on the pending screen, or set one below."}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://xxxx.ngrok-free.app (path appended automatically)"
                className="flex-1 bg-gray-800 text-green-400 p-2 rounded border border-gray-700 text-xs focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleUpdateWebhook}
                className="bg-mint-600 text-white px-3 py-1 rounded text-xs hover:bg-mint-500"
              >
                Update
              </button>
            </div>
            {updateStatus && (
              <p className="text-xs text-green-400 mt-1">{updateStatus}</p>
            )}
          </div>

          {webhookUrl && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                ngrok Inspector
              </p>
              <a
                href="http://localhost:4040"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-mint-400 hover:text-mint-450 underline"
              >
                http://localhost:4040
              </a>
              <span className="text-xs text-gray-500 ml-2">— inspect &amp; replay incoming webhooks</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
