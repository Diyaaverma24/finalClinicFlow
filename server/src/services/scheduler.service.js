const { PrismaClient } = require("@prisma/client");
const { generateMorningReminders } = require("./notification.service");
const prisma = new PrismaClient();

async function markEligibleAppointmentsAsNoShow(nowStr) {
  const now = new Date(nowStr);
  
  // Rule: An appointment becomes NO_SHOW exactly when it is at least 30 minutes past its start time
  const threshold = new Date(now.getTime() - 30 * 60000);

  const result = await prisma.appointment.updateMany({
    where: {
      status: "SCHEDULED",
      startTime: { lte: threshold },
    },
    data: {
      status: "NO_SHOW",
      noShowAt: now,
    },
  });

  return result.count;
}

async function runScheduledJobs(nowStr) {
  const noShowsMarked = await markEligibleAppointmentsAsNoShow(nowStr);
  const remindersCreated = await generateMorningReminders(nowStr);

  return {
    clock: nowStr,
    noShowsMarked,
    remindersCreated,
  };
}

module.exports = { runScheduledJobs, markEligibleAppointmentsAsNoShow };
