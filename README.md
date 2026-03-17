# Plaid Check — Consumer Report Sample App

A sample loan application demonstrating Plaid's [Check Consumer Report (CRA)](https://plaid.com/docs/check/) products:

| Module | Type |
|---|---|
| Base Report | GA |
| Income Insights | GA |
| Network Insights | Beta |
| Cashflow Insights | Beta |
| LendScore | Beta |
| Home Lending (VOA) | Beta |

For Statements, see the regular multi-product [Quickstart](https://github.com/plaid/quickstart).

Plaid Check Consumer Report is Plaid's recommended solution for most credit use cases. For the legacy Income product, see [income-sample](https://github.com/plaid/income-sample).

Built with React 19 + Vite + TypeScript on the frontend, and Node.js + Express on the backend.

## Prerequisites

Access to Consumer Report in Sandbox is not granted by default. Existing Plaid customers can [submit a product access request](https://dashboard.plaid.com/support/new/admin/account-administration/request-product-access) or contact their account manager. New customers can [contact Sales](https://plaid.com/contact/).

The beta modules (Network Insights, Cashflow Insights, LendScore, Home Lending) require separate enablement. Contact your account manager if those tabs show "not available."

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

Click **Apply for a Loan**, then complete the form. Use **Fill with test data** to pre-fill the form including a test SSN and the home lending checkbox. Due to Sandbox limitations, the phone number prefilled in Link will not necessarily match the phone number entered in this form; this will not occur in Production.

When Plaid Link opens, use a **non-OAuth institution** (e.g. First Platypus Bank) and the Sandbox credentials below. Income Insights works by analyzing recurring income patterns in transaction history — the default `user_good` test user doesn't have those. The credentials below are designed with data that makes the reports meaningful:

> **Important:** In Plaid Link, if you're going through the returning user flow, connect a new bank rather than using a saved account — that way you can enter the Sandbox credentials below.

| Username | Password | Description |
|---|---|---|
| `user_bank_income` | `{}` | Wide variety of income streams of different types |
| `user_credit_bonus` | any | Two salary streams: one with bonuses in paycheck, one with bonuses as separate transactions |
| `user_credit_joint_account` | any | Two salary streams and two identities on the account |
| `user_credit_profile_excellent` | any | Positive cash flow, high salary-based income with secondary rental income |
| `user_credit_profile_good` | any | Neutral cash flow, multiple gig economy income streams |
| `user_credit_profile_poor` | any | Net loss cash flow, no consistent income source |

After connecting, the app waits for a webhook from Plaid indicating the report is ready. Without webhooks configured (see below), it polls automatically.

Once the report is ready, you'll see tabs for each product:

- **Base Report** — account balances and transaction history
- **Income Insights** — detected income sources and estimated monthly income
- **Network Insights** — risk signals from connection history including rent, BNPL, cash advances, and EWA (beta)
- **Cashflow Insights** — aggregated transaction volatility measures across income and expenditure categories (beta)
- **LendScore** — 1–99 default risk score with top adverse action reason codes (beta)
- **Home Lending** — Verification of Assets (VOA) report; only shown when the home lending checkbox was checked during application

Additional actions:
- **Download PDF** — full consumer report PDF
- **Refresh data** — triggers a report refresh for the same user without re-running Link, demonstrating the [`/cra/check_report/create`](https://plaid.com/docs/api/products/check/#cracheckreportcreate) flow. In Sandbox the refreshed report won't show new data since there's no new activity to pick up.
- **Start Over** — resets the app

## Product selection

The applicant form lets you choose which beta products to request. Base Report and Income Insights are always included. The three beta products — Network Insights, Cashflow Insights, and LendScore — can be toggled individually; uncheck any that your client is not enabled for. The link token and report refresh will only request the selected products, and unselected tabs will not appear in the report dashboard.

## Home Lending Report

The Home Lending Report (VOA) is not limited to GSE-backed loans — it can be used for HELOCs, non-traditional mortgages, and any home lending use case where asset verification is needed. Lenders who don't work with GSEs at all can still use this product.

Checking **Home Lending Report (VOA)** on the form enables the Verification of Assets report.

The form has two separate checkboxes:

- **Home Lending Report (VOA)** — enables the VOA report and shows the Home Lending tab. Works for any home lending use case; GSE involvement is not required.
- **Enable GSE sharing** (sub-option) — enables `gse_options` in the link token and reveals an SSN field. Required only when the lender needs to share the report with Fannie Mae or Freddie Mac via the sharing token. Fill with test data pre-fills SSN `123-45-6789` and checks both boxes.

## Receiving webhooks

Plaid sends a `USER_CHECK_REPORT_READY` webhook when your report is generated. To receive it locally, expose port 8002 with [ngrok](https://ngrok.com/):

```
ngrok http 8002
```

Copy the forwarding URL into your `.env` file:

```
WEBHOOK_URL=https://abc123.ngrok-free.app
```

The `/server/receive_webhook` path is appended automatically — you can paste just the base URL. Restart the server after updating `.env`. You can also update the webhook URL at runtime via the debug panel without restarting.

To inspect incoming webhooks, open [http://localhost:4040](http://localhost:4040). ngrok's inspector shows every request with full headers and body, and lets you replay them.

Without a webhook URL configured, the app polls for report status every 5 seconds as a fallback.

## Debug panel

The collapsible debug panel at the bottom of the page shows:
- Status messages and any errors from report fetching
- The Plaid `user_id` for the current session (useful for API debugging)
- The current webhook URL with a form to update it at runtime
- A link to the ngrok inspector

## Data storage

User data is stored in `user_data.json` (created automatically, excluded from git). The session persists across server restarts. To start fresh, click **Start Over** in the app or delete `user_data.json`.
