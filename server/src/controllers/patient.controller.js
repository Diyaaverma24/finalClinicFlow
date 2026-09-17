const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const prisma = new PrismaClient();

const createPatientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional(),
});

async function listPatients(req, res) {
  const { search } = req.query;
  const where = search
    ? { name: { contains: String(search) } }
    : {};
  const patients = await prisma.patient.findMany({ where, orderBy: { name: "asc" } });
  res.json({ data: patients });
}

async function getPatient(req, res) {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
  if (!patient) {
    return res.status(404).json({ success: false, error: { code: "PATIENT_NOT_FOUND", message: "Patient not found." } });
  }
  res.json({ data: patient });
}

async function createPatient(req, res) {
  const parsed = createPatientSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: "INVALID_INPUT", message: parsed.error.issues[0].message } });
  }
  const patient = await prisma.patient.create({ data: parsed.data });
  res.status(201).json({ data: patient });
}

module.exports = { listPatients, getPatient, createPatient };
