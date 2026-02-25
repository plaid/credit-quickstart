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

router.post("/refresh", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId) {
      res.status(400).json({ error: "No user found." });
      return;
    }

    await plaidClient.craCheckReportCreate({ user_id: record.plaidUserId });
    await updateRecord({ reportReady: false });
    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
});

export default router;
