# Plaid Check — Consumer Report Sample App

A sample loan application demonstrating Plaid's [Check Consumer Report (CRA)](https://plaid.com/docs/check/) GA products: **Base Report** and **Income Insights**. LendScore (beta), Network Insights (beta), and Cash Flow updates (beta) are not currently covered in this sample app.

For Statements, see the regular multi-product [Quickstart](https://github.com/plaid/quickstart).

Plaid Check Consumer Report is Plaid's recommended solution for most credit use cases. For the legacy Income product, see [income-sample](https://github.com/plaid/income-sample). 

Built with React 19 + Vite + TypeScript on the frontend, and Node.js + Express on the backend.

## Prerequisites

Access to Consumer Report in Sandbox is not granted by default. Existing Plaid customers can [submit a product access request](https://dashboard.plaid.com/support/new/admin/account-administration/request-product-access) or contact their account manager. New customers can [contact Sales](https://plaid.com/contact/). 

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

Click **Apply for a Loan**, then complete the form. Due to Sandbox limitations, the phone number prefilled in Link will not necessarily match the phone number entered in this form; this will not occur in Production.

When Plaid Link opens, use a **non-OAuth institution** (e.g. First Platypus Bank) and the special Sandbox income credentials. Income Insights works by analyzing recurring income patterns in transaction history — the default `user_good` test user doesn't have those, so the Income Insights tab for that user will be empty or unhelpful. The credentials below are specifically designed with income streams that make the report meaningful. Use one of these instead:

> **Important:** In Plaid Link, if you're going through the returning user flow, connect a new bank rather than using a saved account — that way you can enter the Sandbox credentials above.

| Username | Password | Description |
|---|---|---|
| `user_bank_income` | `{}` | Wide variety of income streams of different types |
| `user_credit_bonus` | any | Two salary streams: one with bonuses in paycheck, one with bonuses as separate transactions |
| `user_credit_joint_account` | any | Two salary streams and two identities on the account |
| `user_credit_profile_excellent` | any | Positive cash flow, high salary-based income with secondary rental income |
| `user_credit_profile_good` | any | Neutral cash flow, multiple gig economy income streams |
| `user_credit_profile_poor` | any | Net loss cash flow, no consistent income source |

After connecting, the app waits for a webhook from Plaid indicating the report is ready. Without webhooks configured (see below), it will manually poll for the report.

Once the report is ready, you'll see:
- **Base Report tab** — account balances and transaction history
- **Income Insights tab** — detected income sources and estimated monthly income
- **Download PDF Report** button for the full consumer report PDF
- **Simulate new loan application** - triggers a new report generation for the same user without re-running Link. This demonstrates the [`/cra/check_report/create`](https://plaid.com/docs/api/products/check/#cracheckreportcreate) refresh flow. In Sandbox, the refreshed report won't show new data since there's no new activity to pick up. 
- **Start over** - resets the app 

## Receiving webhooks

Plaid sends a `USER_CHECK_REPORT_READY` webhook when your report is generated. To receive it locally, expose port 8002 with [ngrok](https://ngrok.com/):

```
ngrok http 8002
```

Copy the forwarding URL into your `.env` file, and make sure to append `/server/receive_webhook` to the end:

```
WEBHOOK_URL=https://abc123.ngrok-free.app/server/receive_webhook
```

Restart the server after updating `.env`. You can also update the webhook URL at runtime via the debug panel at the bottom of the page — useful if ngrok restarts and gives you a new URL.

To inspect incoming webhooks, open [http://localhost:4040](http://localhost:4040) in your browser. ngrok's inspector shows every request that came through the tunnel with full headers and body, and lets you replay them.

If you don't configure webhooks, the app will poll for updates instead. For real application use cases, 

## Data storage

User data is stored in `user_data.json` (created automatically, excluded from git). To start fresh, stop the server and delete the file, or click **Start Over** in the app.
