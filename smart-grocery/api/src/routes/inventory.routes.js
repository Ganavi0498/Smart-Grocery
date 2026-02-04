const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { requireHousehold } = require("../middleware/requireHousehold");
const { listInventory, createItem, updateItem, deleteItem } = require("../controllers/inventory.controller");

router.get("/", requireAuth, requireHousehold, listInventory);
router.post("/", requireAuth, requireHousehold, createItem);
router.patch("/:id", requireAuth, requireHousehold, updateItem);
router.delete("/:id", requireAuth, requireHousehold, deleteItem);

module.exports = router;
