import { useEffect } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";

interface LinkConnectProps {
  linkToken: string;
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
}

const LinkConnect: React.FC<LinkConnectProps> = ({ linkToken, onSuccess, onExit }) => {
  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: (public_token) => {
      console.log("Plaid Link success, public token received");
      onSuccess(public_token);
    },
    onExit: (err, metadata) => {
      console.log("Plaid Link exited", { err, metadata });
      onExit();
    },
    onEvent: (eventName, metadata) => {
      console.log(`Plaid Link event: ${eventName}`, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
      <div className="text-4xl mb-4">🏦</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Connect Your Bank Account
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        We use Plaid to securely access your bank information to evaluate your
        loan application.
      </p>
      {!ready ? (
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-mint-450"></div>
          <span className="text-sm">Initializing secure connection...</span>
        </div>
      ) : (
        <button
          onClick={() => open()}
          className="bg-mint-600 text-white py-2 px-6 rounded hover:bg-mint-500 font-medium"
        >
          Open Bank Connection
        </button>
      )}
    </div>
  );
};

export default LinkConnect;
