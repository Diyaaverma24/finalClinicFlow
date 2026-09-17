const express = require("express");
const { listAppointments, getAppointment, bookAppointment, cancel, reschedule, complete } = require("../controllers/appointment.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", requireAuth, listAppointments);
router.get("/:id", requireAuth, getAppointment);
router.post("/", requireAuth, bookAppointment);
router.patch("/:id/cancel", requireAuth, cancel);
router.patch("/:id/reschedule", requireAuth, reschedule);
router.patch("/:id/complete", requireAuth, complete);

module.exports = router;
