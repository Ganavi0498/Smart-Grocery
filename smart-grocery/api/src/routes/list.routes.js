// api/src/routes/list.routes.js
const express = require("express");

// Make auth import resilient (works whether auth.js exports function OR { requireAuth })
const auth = require("../middleware/auth");
const requireAuth = auth.requireAuth || auth;

const listController = require("../controllers/list.controller");

const router = express.Router();

// Guard: fail fast with a clear message instead of "argument handler is required"
if (typeof requireAuth !== "function") {
  throw new Error(
    "Auth middleware export mismatch: expected a function. " +
      "Fix api/src/middleware/auth.js export or adjust import in list.routes.js."
  );
}

router.use(requireAuth);

// GET /api/lists/current
router.get("/current", listController.getCurrentList);

// POST /api/lists/items
router.post("/items", listController.addListItem);

// PATCH /api/lists/items/:itemId
router.patch("/items/:itemId", listController.updateListItem);

// DELETE /api/lists/items/:itemId
router.delete("/items/:itemId", listController.deleteListItem);

// POST /api/lists/sync-low-stock
router.post("/sync-low-stock", listController.syncLowStockToList);

// POST /api/lists/complete
router.post("/complete", listController.completeCurrentList);

module.exports = router;
