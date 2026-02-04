const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const {
  createHousehold,
  joinHousehold,
  getCurrentHousehold,
} = require("../controllers/household.controller");

router.post("/", requireAuth, createHousehold);
router.post("/join", requireAuth, joinHousehold);
router.get("/current", requireAuth, getCurrentHousehold);

module.exports = router;
