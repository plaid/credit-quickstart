import { useEffect, useRef } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";

interface LinkConnectProps {
  linkToken: string;
  onComplete: () => void;
  onExit: () => void;
}

const LinkConnect: React.FC<LinkConnectProps> = ({ linkToken, onComplete, onExit }) => {
  // Success is signaled by HANDOFF (onSuccess is empty in Multi-Item Link); wait for Link to close before unmounting.
  const handedOff = useRef(false);
  const closed = useRef(false);
  const finishIfDone = () => {
    if (handedOff.current && closed.current) onComplete();
  };

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: () => {
      console.log("Plaid Link onSuccess");
      closed.current = true;
      finishIfDone();
    },
    onExit: (err, metadata) => {
      console.log("Plaid Link exited", { err, metadata });
      closed.current = true;
      if (handedOff.current) onComplete();
      else onExit();
    },
    onEvent: (eventName, metadata) => {
      console.log(`Plaid Link event: ${eventName}`, metadata);
      if (eventName === "HANDOFF") {
        handedOff.current = true;
        finishIfDone();
      }
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
      <div className="flex items-center justify-center gap-2 text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-mint-450"></div>
        <span className="text-sm">
          {ready ? "Opening secure connection..." : "Initializing secure connection..."}
        </span>
      </div>
    </div>
  );
};

export default LinkConnect;
