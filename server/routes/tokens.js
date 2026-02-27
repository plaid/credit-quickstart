import express from "express";
import plaidClient from "../plaid.js";
import { getRecord } from "../store.js";

const router = express.Router();

export const normalizeWebhookUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (!trimmed.includes("/server/receive_webhook")) {
    return trimmed.replace(/\/$/, "") + "/server/receive_webhook";
  }
  return trimmed;
};

router.post("/create_link_token", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found. Create a user first." });
      return;
    }

    const webhookUrl = process.env.WEBHOOK_URL || "";

    const craOptions = {
      days_requested: 730,
      cashflow_insights: {
        attributes_version: "CFI1",
      },
      lend_score: {
        lend_score_version: "LS1",
      },
      network_insights: {
        network_insights_version: "NI1",
      },
    };

    if (record.homeLending) {
      craOptions.base_report = {
        gse_options: {
          report_types: ["VOA"],
        },
      };
    }

    const linkTokenRequest = {
      user_id: record.plaidUserId,
      user: { client_user_id: record.clientUserId },
      client_name: "Platypus Lending",
      products: ["cra_base_report", "cra_network_insights", "cra_cashflow_insights", "cra_lend_score"],
      country_codes: ["US"],
      language: "en",
      cra_options: craOptions,
      consumer_report_permissible_purpose: "ACCOUNT_REVIEW_CREDIT",
    };

    if (webhookUrl) {
      linkTokenRequest.webhook = webhookUrl;
    }

    const response = await plaidClient.linkTokenCreate(linkTokenRequest);
    res.json({ linkToken: response.data.link_token });
  } catch (error) {
    next(error);
  }
});

router.post("/update_webhook", async (req, res, next) => {
  try {
    const { newUrl } = req.body;
    if (!newUrl) {
      res.status(400).json({ error: "newUrl is required" });
      return;
    }
    const normalized = normalizeWebhookUrl(newUrl);
    process.env.WEBHOOK_URL = normalized;
    res.json({ status: "success", webhookUrl: normalized });
  } catch (error) {
    next(error);
  }
});

router.get("/webhook_url", async (req, res, next) => {
  try {
    res.json({ webhookUrl: process.env.WEBHOOK_URL || "" });
  } catch (error) {
    next(error);
  }
});

router.get("/validate_webhook", async (req, res, next) => {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      res.json({ valid: false, reason: "no webhook URL configured" });
      return;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      // Any HTTP response (including 404/405) means the tunnel is up and reachable.
      // Only a network error (ECONNREFUSED, timeout) means it's not.
      await fetch(webhookUrl, { method: "GET", signal: controller.signal });
      clearTimeout(timeoutId);
      res.json({ valid: true });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      res.json({ valid: false, reason: fetchErr.message });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
