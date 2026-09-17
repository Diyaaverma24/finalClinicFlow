const express = require("express");
const { listAppointments, getAppointment, bookAppointment, cancel } = require("../controllers/appointment.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", requireAuth, listAppointments);
router.get("/:id", requireAuth, getAppointment);
router.post("/", requireAuth, bookAppointment);
router.patch("/:id/cancel", requireAuth, cancel);

module.exports = router;
