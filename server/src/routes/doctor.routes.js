const express = require("express");
const { listDoctors, getDoctor, getDoctorDaySchedule } = require("../controllers/doctor.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", requireAuth, listDoctors);
router.get("/:id", requireAuth, getDoctor);
router.get("/:id/appointments", requireAuth, getDoctorDaySchedule);

module.exports = router;
