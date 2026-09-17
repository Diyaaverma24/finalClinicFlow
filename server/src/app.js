const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const doctorRoutes = require("./routes/doctor.routes");
const patientRoutes = require("./routes/patient.routes");
const appointmentRoutes = require("./routes/appointment.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found." } });
});

// Central error handler (catches anything thrown/rejected and not already handled)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, error: { code: err.code || "SERVER_ERROR", message: err.message || "Something went wrong." } });
});

module.exports = app;
