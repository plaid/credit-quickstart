// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const callMyServer = async function <T = any>(
  endpoint: string,
  isPost: boolean = false,
  postData: unknown = null,
  onError?: (errorMsg: string) => void
): Promise<T | null> {
  const optionsObj: RequestInit = isPost ? { method: "POST" } : {};
  if (isPost && postData !== null) {
    optionsObj.headers = { "Content-type": "application/json" };
    optionsObj.body = JSON.stringify(postData);
  }
  const response = await fetch(endpoint, optionsObj);
  if (response.status === 500 || response.status === 400) {
    await handleServerError(response, onError);
    return null as unknown as T;
  }
  const data = await response.json();
  console.log(`Result from calling ${endpoint}: ${JSON.stringify(data)}`);
  return data as T;
};

const handleServerError = async function (
  responseObject: Response,
  onError?: (errorMsg: string) => void
): Promise<void> {
  const error = await responseObject.json();
  console.error("Server error:", error);
  if (onError) {
    const errorMsg = `❌ Server Error: ${error.error_message || error.error || JSON.stringify(error)}`;
    onError(errorMsg);
  }
};

export const showAsCurrency = function (amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

export const formatPhone = function (phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 11 && digits[0] === "1" ? digits.slice(1) : digits;
  if (local.length === 10) {
    return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return phone;
};

const UPPERCASE_TERMS = new Set(["bnpl", "ewa"]);

export const formatCategory = function (raw: string): string {
  const words = raw
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => (UPPERCASE_TERMS.has(word) ? word.toUpperCase() : word));
  if (words.length > 0 && !UPPERCASE_TERMS.has(words[0].toLowerCase())) {
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  }
  return words.join(" ");
};

export const formatDate = function (dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
