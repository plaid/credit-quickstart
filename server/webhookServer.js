import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import { loadStore, updateRecord } from "./store.js";

dotenv.config();

const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 8002;

await loadStore();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/server/receive_webhook", async (req, res, next) => {
  try {
    console.log("Webhook received:");
    console.dir(req.body, { colors: true, depth: null });

    const webhookType = req.body.webhook_type;
    const webhookCode = req.body.webhook_code;

    if (webhookType === "CHECK_REPORT" && webhookCode === "USER_CHECK_REPORT_READY") {
      console.log("CRA report is ready! Updating store.");
      await updateRecord({ reportReady: true });
      const mainServerPort = process.env.APP_PORT || 3001;
      await fetch(`http://localhost:${mainServerPort}/internal/report-ready`, { method: "POST" });
    } else {
      console.log(`Unhandled webhook: ${webhookType}/${webhookCode}`);
    }

    res.json({ status: "received" });
  } catch (error) {
    next(error);
  }
});

const errorHandler = function (err, req, res, next) {
  console.error("Webhook server error:", err);
  res.status(500).json({ error: "Webhook processing failed" });
};
app.use(errorHandler);

const startServer = () => {
  app.listen(WEBHOOK_PORT, () => {
    console.log(`Webhook server listening on port ${WEBHOOK_PORT}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${WEBHOOK_PORT} in use — killing existing process and retrying...`);
      exec(`lsof -ti :${WEBHOOK_PORT} | xargs kill`, (killErr) => {
        if (killErr) {
          console.error(`❌ Failed to free port ${WEBHOOK_PORT}:`, killErr.message);
          process.exit(1);
        }
        setTimeout(startServer, 500);
      });
    } else {
      console.error("❌ Failed to start webhook server:", err);
      process.exit(1);
    }
  });
};

startServer();
