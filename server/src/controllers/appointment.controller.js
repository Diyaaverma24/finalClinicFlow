const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const { createAppointment, cancelAppointment, VALID_DURATIONS } = require("../services/appointment.service");
const prisma = new PrismaClient();

const bookSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  startTime: z.string().min(1), // ISO 8601
  durationMinutes: z.number().refine((v) => VALID_DURATIONS.includes(v), "Duration must be 15/30/45/60"),
});

// GET /api/appointments?page=&limit=&sortBy=&order=&doctorId=&date=&patientName=
async function listAppointments(req, res) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const sortBy = ["startTime", "createdAt", "status"].includes(req.query.sortBy) ? req.query.sortBy : "startTime";
  const order = req.query.order === "desc" ? "desc" : "asc";

  const where = {};
  if (req.query.doctorId) where.doctorId = req.query.doctorId;
  if (req.query.status) where.status = req.query.status;
  if (req.query.date) {
    const d = req.query.date;
    where.startTime = { gte: new Date(d + "T00:00:00"), lte: new Date(d + "T23:59:59.999") };
  }
  if (req.query.patientName) {
    where.patient = { name: { contains: String(req.query.patientName) } };
  }

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: { doctor: true, patient: true },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    data: appointments,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
}

async function getAppointment(req, res) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: { doctor: true, patient: true },
  });
  if (!appointment) {
    return res.status(404).json({ success: false, error: { code: "APPOINTMENT_NOT_FOUND", message: "Appointment not found." } });
  }
  res.json({ data: appointment });
}

async function bookAppointment(req, res) {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0].message } });
  }
  try {
    const appointment = await createAppointment(parsed.data);
    res.status(201).json({ data: appointment });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: { code: err.code || "SERVER_ERROR", message: err.message } });
  }
}

async function cancel(req, res) {
  try {
    const appointment = await cancelAppointment(req.params.id);
    res.json({ data: appointment });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: { code: err.code || "SERVER_ERROR", message: err.message } });
  }
}

module.exports = { listAppointments, getAppointment, bookAppointment, cancel };
