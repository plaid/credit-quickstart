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
      options: { network_insights_version: "NI1" },
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
      options: { attributes_version: "CFI1" },
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
      options: { lend_score_version: "LS1" },
    });
    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

router.get("/home_lending", async (req, res, next) => {
  let reportsRequested = ["VOA"];
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

    if (record.employmentRefreshRun) reportsRequested.push("EMPLOYMENT_REFRESH");

    const response = await plaidClient.craCheckReportVerificationGet({
      user_id: record.plaidUserId,
      reports_requested: reportsRequested,
      ...(record.employmentRefreshRun && {
        employment_refresh_options: { days_requested: 60 },
      }),
    });
    res.json(response.data);
  } catch (error) {
    console.error(`[home_lending] craCheckReportVerificationGet failed — reports_requested: ${JSON.stringify(reportsRequested)}`);
    next(error);
  }
});

router.get("/home_lending_pdf", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId || !record.homeLending) {
      res.status(400).json({ error: "No home lending user found." });
      return;
    }

    const response = await plaidClient.craCheckReportVerificationPdfGet(
      { user_id: record.plaidUserId, report_requested: "voa" },
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=voa_report.pdf");
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

router.get("/home_lending_employment_pdf", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId || !record.homeLending) {
      res.status(400).json({ error: "No home lending user found." });
      return;
    }

    const response = await plaidClient.craCheckReportVerificationPdfGet(
      { user_id: record.plaidUserId, report_requested: "employment_refresh" },
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=employment_refresh_report.pdf");
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

router.get("/home_lending_sharing_token", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId || !record.homeLending) {
      res.status(400).json({ error: "No home lending user found." });
      return;
    }

    const { partner } = req.query;
    const audience =
      partner === "freddie-mac"
        ? "urn:plaid:params:cra-partner:freddie-mac"
        : "urn:plaid:params:cra-partner:fannie-mae";

    const response = await plaidClient.oauthToken({
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      subject_token_type: "urn:plaid:params:credit:multi-user",
      subject_token: record.plaidUserId,
      audience,
      scope: "user:read",
    });
    res.json({ access_token: response.data.access_token, token_type: response.data.token_type });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh_employment", async (req, res, next) => {
  try {
    const record = getRecord();
    if (!record.plaidUserId || !record.homeLending) {
      res.status(400).json({ error: "No home lending user found." });
      return;
    }

    const body = {
      user_id: record.plaidUserId,
      days_requested: 730,
      consumer_report_permissible_purpose: "ACCOUNT_REVIEW_CREDIT",
    };
    if (process.env.WEBHOOK_URL) body.webhook = process.env.WEBHOOK_URL;
    await plaidClient.craCheckReportCreate(body);
    console.log("craCheckReportCreate succeeded — employment refresh");
    await updateRecord({ reportReady: false, employmentRefreshRun: true });
    res.json({ status: "success" });
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

    const enabledProducts = record.enabledProducts ?? ["network_insights", "cashflow_insights", "lend_score"];
    const body = {
      user_id: record.plaidUserId,
      days_requested: 730,
      consumer_report_permissible_purpose: "ACCOUNT_REVIEW_CREDIT",
    };
    if (process.env.WEBHOOK_URL) body.webhook = process.env.WEBHOOK_URL;
    if (enabledProducts.includes("cashflow_insights")) body.cashflow_insights = { attributes_version: "CFI1" };
    if (enabledProducts.includes("lend_score")) body.lend_score = { lend_score_version: "LS1" };
    if (enabledProducts.includes("network_insights")) body.network_insights = { network_insights_version: "NI1" };
    await plaidClient.craCheckReportCreate(body);
    console.log(`craCheckReportCreate succeeded — products: [${Object.keys(body).filter(k => ["cashflow_insights", "lend_score", "network_insights"].includes(k)).join(", ") || "base only"}]`);
    await updateRecord({ reportReady: false });
    res.json({ status: "success" });
  } catch (error) {
    next(error);
  }
});

export default router;
