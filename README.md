# Platypus Lending — CRA Sample App

A sample loan application demonstrating Plaid's [Check Consumer Reports (CRA)](https://plaid.com/docs/check/) products: **Base Report** and **Income Insights**.

Built with React 19 + Vite + TypeScript on the frontend, and Node.js + Express on the backend.

## Prerequisites

Access to Consumer Report in Sandbox is not granted by default. Existing Plaid customers can [submit a product access request](https://dashboard.plaid.com/support/new/admin/account-administration/request-product-access) or contact their account manager. New customers can [contact Sales](https://plaid.com/contact/). Customers with Production access to Consumer Report will also automatically be granted Sandbox access.

## Running the app

1. Copy `.env.template` to `.env` and add your Plaid credentials:
   ```
   cp .env.template .env
   ```

2. Install dependencies and start everything:
   ```
   npm install && npm start
   ```

This starts three processes concurrently:
- Main server on port 3001
- Webhook receiver on port 8002
- Vite dev server on port 5173

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Using the app

Click **Apply for a Loan**, then click **Fill with test data** to pre-fill the form with sandbox-compatible values.

When Plaid Link opens, use a **non-OAuth institution** (e.g. First Platypus Bank) and sandbox credentials that include income data. Income Insights works by analyzing recurring income patterns in transaction history — most sandbox users don't have these, so the Income Insights tab will be empty or unhelpful. The credentials below are specifically designed with income streams that make the report meaningful. Use one of these instead:

> **Important:** In Plaid Link, connect a new bank rather than using a saved account — that way you can enter the sandbox credentials above.

| Username | Password | Description |
|---|---|---|
| `user_bank_income` | `{}` | Wide variety of income streams of different types |
| `user_credit_bonus` | any | Two salary streams: one with bonuses in paycheck, one with bonuses as separate transactions |
| `user_credit_joint_account` | any | Two salary streams and two identities on the account |
| `user_credit_profile_excellent` | any | Positive cash flow, high salary-based income with secondary rental income |
| `user_credit_profile_good` | any | Neutral cash flow, multiple gig economy income streams |
| `user_credit_profile_poor` | any | Net loss cash flow, no consistent income source |

After connecting, the app waits for a webhook from Plaid indicating the report is ready. Without webhooks configured (see below), use the **Check Report Status** button on the pending screen to manually poll for the report.

Once the report is ready, you'll see:
- **Base Report tab** — account balances and transaction history
- **Income Insights tab** — detected income sources and projected monthly income
- **Download PDF Report** button for the full consumer report PDF

Click **Start Over** to reset and run a fresh flow.

## Receiving webhooks

Plaid sends a `USER_CHECK_REPORT_READY` webhook when your report is generated. To receive it locally, expose port 8002 with [ngrok](https://ngrok.com/):

```
ngrok http 8002
```

Copy the forwarding URL into your `.env` file:

```
WEBHOOK_URL=https://abc123.ngrok-free.app/server/receive_webhook
```

Restart the server after updating `.env`. You can also update the webhook URL at runtime via the debug panel at the bottom of the page — useful if ngrok restarts and gives you a new URL.

To inspect incoming webhooks, open [http://localhost:4040](http://localhost:4040) in your browser. ngrok's inspector shows every request that came through the tunnel with full headers and body, and lets you replay them.

## Data storage

User data is stored in `user_data.json` (created automatically, excluded from git). To start fresh, stop the server and delete the file, or click **Start Over** in the app.
