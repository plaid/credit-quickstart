import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { loadStore } from "./store.js";

dotenv.config();

const PORT = process.env.APP_PORT || 3001;

const required = ["PLAID_CLIENT_ID", "PLAID_SECRET"];
const missing = required.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(
    `\n❌ Missing required environment variables: ${missing.join(", ")}`
  );
  console.error(
    "Please copy .env.template to .env and fill in the required values.\nSee README.md for more details."
  );
  process.exit(1);
}

await loadStore();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const routes = ["users", "tokens", "reports", "events"];

await Promise.all(
  routes.map(async (route) => {
    const routeModule = await import(`./routes/${route}.js`);
    app.use(`/server/${route}`, routeModule.default);
  })
);

const eventsModule = await import("./routes/events.js");
app.post("/internal/report-ready", (req, res) => {
  eventsModule.notifyReportReady();
  res.json({ status: "ok" });
});

const errorHandler = function (err, req, res, next) {
  console.error("Server error:");
  if (err.response?.data != null) {
    res.status(500).send(err.response.data);
    console.error(err.response.data);
  } else {
    res.status(500).send({
      error_code: "OTHER_ERROR",
      error_message: "An unexpected error occurred on the server.",
    });
    console.error(JSON.stringify(err, null, 2));
  }
};
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Main server listening on port ${PORT}`);
});
