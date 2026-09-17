const { PrismaClient } = require("@prisma/client");
const { runScheduledJobs } = require("../services/scheduler.service");
const prisma = new PrismaClient();

async function clock(req, res) {
  const { now } = req.body;
  if (!now) {
    return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "Missing 'now' timestamp in request body." } });
  }

  try {
    const summary = await runScheduledJobs(now);
    res.json({ data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

async function getOutbox(req, res) {
  try {
    const outbox = await prisma.notificationOutbox.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: outbox });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: err.message } });
  }
}

module.exports = { clock, getOutbox };
