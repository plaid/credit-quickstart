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

export default plaidClient;
