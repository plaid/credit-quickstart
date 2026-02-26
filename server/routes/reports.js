import express from "express";
import plaidClient from "../plaid.js";
import { getRecord, updateRecord } from "../store.js";

const router = express.Router();

router.get("/base_report", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const response = await plaidClient.craCheckReportBaseReportGet({
      user_id: record.plaidUserId,
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/income_insights", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const response = await plaidClient.craCheckReportIncomeInsightsGet({
      user_id: record.plaidUserId,
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/pdf", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const response = await plaidClient.craCheckReportPdfGet(
      { user_id: record.plaidUserId },
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=consumer_report.pdf");
    res.send(Buffer.from(response.data));
  } catch (error) {
    if (error.response?.data instanceof ArrayBuffer || Buffer.isBuffer(error.response?.data)) {
      try {
        error.response.data = JSON.parse(Buffer.from(error.response.data).toString("utf8"));
      } catch {
        // not JSON, leave as-is
      }
    }
    next(error);
  }
});

router.get("/network_insights", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const response = await plaidClient.craCheckReportNetworkInsightsGet({
      user_id: record.plaidUserId,
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/cashflow_insights", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const response = await plaidClient.craCheckReportCashflowInsightsGet({
      user_id: record.plaidUserId,
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/lend_score", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const response = await plaidClient.craCheckReportLendScoreGet({
      user_id: record.plaidUserId,
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/home_lending", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    if (!record.homeLending) {
      res.status(400).json({ error: "Not a home lending application." });
      return;
    }

    const response = await plaidClient.craCheckReportVerificationGet({
      user_id: record.plaidUserId,
      reports_requested: ["VOA"],
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    const webhookUrl = (process.env.WEBHOOK_URL || "").trim();
    await plaidClient.craCheckReportCreate({
      user_id: record.plaidUserId,
      webhook: webhookUrl,
      days_requested: 730,
      consumer_report_permissible_purpose: "ACCOUNT_REVIEW_CREDIT",
    });
    await updateRecord({ reportReady: false });
    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
});

export default router;
