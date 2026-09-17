const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function generateMorningReminders(nowStr) {
  const now = new Date(nowStr);
  
  // Create a stable date boundary for today based on the clock
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "SCHEDULED",
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    include: { patient: true, doctor: true },
  });

  let createdCount = 0;

  for (const appt of appointments) {
    // Basic time formatting e.g. "10:30 AM"
    const timeStr = appt.startTime.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const message = `Hi ${appt.patient.name}, reminder: you have an appointment with ${appt.doctor.name} today at ${timeStr}. — ClinicFlow`;

    try {
      await prisma.notificationOutbox.create({
        data: {
          appointmentId: appt.id,
          patientId: appt.patientId,
          type: "MORNING_APPOINTMENT_REMINDER",
          message,
          scheduledFor: startOfDay, // The uniqueness marker for "today"
        },
      });
      createdCount++;
    } catch (err) {
      // P2002 is Prisma's unique constraint violation code
      if (err.code !== "P2002") {
        console.error("Error creating notification outbox entry:", err);
      }
    }
  }

  return createdCount;
}

module.exports = { generateMorningReminders };
