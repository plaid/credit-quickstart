import express from "express";

const router = express.Router();

const clients = new Set();

export function notifyReportReady() {
  for (const res of clients) {
    res.write("event: report-ready\n");
    res.write(`data: ${JSON.stringify({ reportReady: true })}\n\n`);
  }
}

router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write("event: connected\n");
  res.write(`data: ${JSON.stringify({ message: "SSE connection established" })}\n\n`);

  clients.add(res);
  req.on("close", () => clients.delete(res));
});

export default router;
