const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function listDoctors(req, res) {
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });
  res.json({ data: doctors });
}

async function getDoctor(req, res) {
  const doctor = await prisma.doctor.findUnique({ where: { id: req.params.id } });
  if (!doctor) {
    return res.status(404).json({ success: false, error: { code: "DOCTOR_NOT_FOUND", message: "Doctor not found." } });
  }
  res.json({ data: doctor });
}

// GET /api/doctors/:id/appointments?date=YYYY-MM-DD  -> that doctor's day schedule
async function getDoctorDaySchedule(req, res) {
  const { id } = req.params;
  const dateStr = req.query.date;
  if (!dateStr) {
    return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: "date query param (YYYY-MM-DD) is required." } });
  }
  const dayStart = new Date(dateStr + "T00:00:00");
  const dayEnd = new Date(dateStr + "T23:59:59.999");
  const appointments = await prisma.appointment.findMany({
    where: { doctorId: id, startTime: { gte: dayStart, lte: dayEnd } },
    include: { patient: true },
    orderBy: { startTime: "asc" },
  });
  res.json({ data: appointments });
}

module.exports = { listDoctors, getDoctor, getDoctorDaySchedule };
