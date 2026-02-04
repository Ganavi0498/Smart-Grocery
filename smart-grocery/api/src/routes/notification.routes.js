// api/src/routes/notification.routes.js
const express = require("express");
const router = express.Router();

// IMPORTANT: your auth middleware export might be either:
// 1) module.exports = requireAuth
// OR
// 2) module.exports = { requireAuth }
// This adapter supports BOTH without touching existing auth.js
const authModule = require("../middleware/auth");
const requireAuth = authModule.requireAuth || authModule;

if (typeof requireAuth !== "function") {
  // Fail fast with a readable message (still only touching notifications)
  throw new TypeError(
    `Auth middleware export is not a function. Got: ${typeof requireAuth}. ` +
    `Check api/src/middleware/auth.js export style.`
  );
}

const ctrl = require("../controllers/notification.controller");

router.use(requireAuth);

router.get("/", ctrl.listMyNotifications);

router.get("/prefs", ctrl.getPrefs);
router.put("/prefs", ctrl.updatePrefs);

router.post("/generate-expiry", ctrl.generateExpiryNotifications);

router.patch("/:id/read", ctrl.markRead);
router.patch("/:id/dismiss", ctrl.dismiss);

module.exports = router;
