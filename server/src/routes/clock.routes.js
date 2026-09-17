const express = require("express");
const { clock, getOutbox } = require("../controllers/clock.controller");
const router = express.Router();

router.post("/clock", clock);
router.get("/outbox", getOutbox);

module.exports = router;
