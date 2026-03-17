const PLAID_ENV = (process.env.PLAID_ENV || "sandbox").toLowerCase();
import { Configuration, PlaidEnvironments, PlaidApi } from "plaid";

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

plaidClient.axios.interceptors.request.use((config) => {
  console.log(`Plaid API → ${config.method?.toUpperCase()} ${config.url}`);
  if (config.data) {
    try {
      console.log("  body:", JSON.stringify(JSON.parse(config.data), null, 2));
    } catch {
      console.log("  body:", config.data);
    }
  }
  return config;
});

plaidClient.axios.interceptors.response.use(
  (response) => {
    console.log(`Plaid API ← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const url = error.config?.url ?? "(unknown)";
    const status = error.response?.status ?? "(no response)";
    const d = error.response?.data;
    if (d?.error_code) {
      console.error(`Plaid API ← ${status} ${url}: ${d.error_type}/${d.error_code} — ${d.error_message} (request_id: ${d.request_id})`);
    } else {
      console.error(`Plaid API ← ${status} ${url}: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default plaidClient;
