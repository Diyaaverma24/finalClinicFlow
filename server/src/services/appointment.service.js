const { PrismaClient } = require("@prisma/client");
const { calculateCancellationFee } = require("../utils/cancellation");
const prisma = new PrismaClient();

const VALID_DURATIONS = [15, 30, 45, 60];

/**
 * Core conflict rule:
 *   newStart < existingEnd AND newEnd > existingStart  => overlap
 * Only SCHEDULED appointments for the SAME doctor block a slot.
 */
async function hasConflict(doctorId, startTime, endTime, excludeAppointmentId = null) {
  const overlapping = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: "SCHEDULED",
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  return overlapping.length > 0;
}

async function createAppointment({ doctorId, patientId, startTime, durationMinutes }) {
  if (!VALID_DURATIONS.includes(durationMinutes)) {
    const err = new Error("Duration must be one of 15, 30, 45, 60 minutes.");
    err.code = "INVALID_DURATION";
    err.status = 400;
    throw err;
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    const err = new Error("Doctor not found.");
    err.code = "DOCTOR_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    const err = new Error("Patient not found.");
    err.code = "PATIENT_NOT_FOUND";
    err.status = 404;
    throw err;
  }

  const start = new Date(startTime);
  if (isNaN(start.getTime())) {
    const err = new Error("Invalid start time.");
    err.code = "INVALID_TIME";
    err.status = 400;
    throw err;
  }
  const end = new Date(start.getTime() + durationMinutes * 60000);

  // Transaction so the conflict-check + create is atomic under this app's
  // single-process dev DB. For real concurrent load, a Postgres exclusion
  // constraint on (doctorId, [startTime,endTime)) is the stronger fix —
  // documented as a known limitation in REASONING.md.
  return prisma.$transaction(async (tx) => {
    const overlapping = await tx.appointment.findMany({
      where: {
        doctorId,
        status: "SCHEDULED",
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (overlapping.length > 0) {
      const err = new Error("Doctor already has an appointment during this time.");
      err.code = "APPOINTMENT_CONFLICT";
      err.status = 409;
      throw err;
    }
    return tx.appointment.create({
      data: { doctorId, patientId, startTime: start, endTime: end },
      include: { doctor: true, patient: true },
    });
  });
}

async function cancelAppointment(appointmentId) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    const err = new Error("Appointment not found.");
    err.code = "APPOINTMENT_NOT_FOUND";
    err.status = 404;
    throw err;
  }
  if (appointment.status === "CANCELLED") {
    const err = new Error("Appointment is already cancelled.");
    err.code = "ALREADY_CANCELLED";
    err.status = 400;
    throw err;
  }
  const now = new Date();
  if (new Date(appointment.startTime) <= now) {
    const err = new Error("Appointment has already started or ended.");
    err.code = "INVALID_TIME";
    err.status = 400;
    throw err;
  }

  const { fee } = calculateCancellationFee(appointment.startTime, now);

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancellationFee: fee, cancelledAt: now },
    include: { doctor: true, patient: true },
  });
}

async function rescheduleAppointment(appointmentId, startTime, durationMinutes) {
  if (!VALID_DURATIONS.includes(durationMinutes)) {
    const err = new Error("Duration must be one of 15, 30, 45, 60 minutes.");
    err.code = "INVALID_DURATION";
    err.status = 400;
    throw err;
  }
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    const err = new Error("Appointment not found.");
    err.code = "APPOINTMENT_NOT_FOUND";
    err.status = 404;
    throw err;
  }
  if (appointment.status !== "SCHEDULED") {
    const err = new Error("Only SCHEDULED appointments can be rescheduled.");
    err.code = "INVALID_APPOINTMENT_STATE";
    err.status = 400;
    throw err;
  }
  const start = new Date(startTime);
  if (isNaN(start.getTime())) {
    const err = new Error("Invalid start time.");
    err.code = "INVALID_TIME";
    err.status = 400;
    throw err;
  }
  const end = new Date(start.getTime() + durationMinutes * 60000);

  return prisma.$transaction(async (tx) => {
    const overlapping = await tx.appointment.findMany({
      where: {
        doctorId: appointment.doctorId,
        status: "SCHEDULED",
        id: { not: appointmentId },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (overlapping.length > 0) {
      const err = new Error("Doctor already has an appointment during this time.");
      err.code = "APPOINTMENT_CONFLICT";
      err.status = 409;
      throw err;
    }
    return tx.appointment.update({
      where: { id: appointmentId },
      data: { startTime: start, endTime: end },
      include: { doctor: true, patient: true },
    });
  });
}

async function completeAppointment(appointmentId) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    const err = new Error("Appointment not found.");
    err.code = "APPOINTMENT_NOT_FOUND";
    err.status = 404;
    throw err;
  }
  if (appointment.status !== "SCHEDULED") {
    const err = new Error("Only SCHEDULED appointments can be completed.");
    err.code = "INVALID_APPOINTMENT_STATE";
    err.status = 400;
    throw err;
  }
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED", completedAt: new Date() },
    include: { doctor: true, patient: true },
  });
}

module.exports = { hasConflict, createAppointment, cancelAppointment, rescheduleAppointment, completeAppointment, VALID_DURATIONS };

