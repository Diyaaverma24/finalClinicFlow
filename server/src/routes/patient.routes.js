const express = require("express");
const { listPatients, getPatient, createPatient } = require("../controllers/patient.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", requireAuth, listPatients);
router.get("/:id", requireAuth, getPatient);
router.post("/", requireAuth, createPatient);

module.exports = router;
