const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo@123", 10);
  await prisma.user.create({
    data: { name: "Admin", email: "demo@clinicflow.com", passwordHash },
  });

  const [drSharma, drPatel, drSingh] = await Promise.all([
    prisma.doctor.create({ data: { name: "Dr. Ananya Sharma", specialization: "General Physician" } }),
    prisma.doctor.create({ data: { name: "Dr. Raj Patel", specialization: "Cardiologist" } }),
    prisma.doctor.create({ data: { name: "Dr. Meera Singh", specialization: "Dermatologist" } }),
  ]);

  const patientNames = [
    ["Rahul Sharma", "9800000001"],
    ["Priya Verma", "9800000002"],
    ["Aman Gupta", "9800000003"],
    ["Neha Singh", "9800000004"],
    ["Rohit Jain", "9800000005"],
  ];
  const patients = [];
  for (const [name, phone] of patientNames) {
    patients.push(await prisma.patient.create({ data: { name, phone } }));
  }

  // Build appointments for "today" so the dashboard has live data.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function at(hour, min = 0) {
    const d = new Date(today);
    d.setHours(hour, min, 0, 0);
    return d;
  }

  const seedAppointments = [
    { doctorId: drSharma.id, patientId: patients[0].id, start: at(9, 0), end: at(9, 30) },
    { doctorId: drSharma.id, patientId: patients[1].id, start: at(10, 0), end: at(10, 30) },
    { doctorId: drSharma.id, patientId: patients[2].id, start: at(11, 0), end: at(11, 30) },
    { doctorId: drPatel.id, patientId: patients[3].id, start: at(9, 30), end: at(10, 0) },
    { doctorId: drPatel.id, patientId: patients[4].id, start: at(14, 0), end: at(14, 45) },
    { doctorId: drSingh.id, patientId: patients[0].id, start: at(15, 0), end: at(15, 30) },
  ];

  for (const a of seedAppointments) {
    await prisma.appointment.create({
      data: { doctorId: a.doctorId, patientId: a.patientId, startTime: a.start, endTime: a.end },
    });
  }

  // One already-cancelled appointment to demonstrate the free/late fee history.
  const cancelledOne = await prisma.appointment.create({
    data: {
      doctorId: drSharma.id,
      patientId: patients[3].id,
      startTime: at(13, 0),
      endTime: at(13, 30),
      status: "CANCELLED",
      cancellationFee: 200,
      cancelledAt: new Date(),
    },
  });

  console.log("Seed complete. Demo login: demo@clinicflow.com / Demo@123");
  console.log("Doctors:", drSharma.id, drPatel.id, drSingh.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
