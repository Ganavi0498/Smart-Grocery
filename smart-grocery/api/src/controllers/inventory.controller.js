const { z } = require("zod");
const InventoryItem = require("../models/InventoryItem");

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().max(40).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().trim().max(16).optional(),
  threshold: z.number().min(0).optional(),
  expiryDate: z.union([z.string(), z.null()]).optional(), // ISO string from UI
  location: z.string().trim().max(40).optional(),
});

const updateSchema = createSchema.partial();

function parseMaybeDate(v) {
  if (v === null || v === undefined) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined; // invalid
  return d;
}

async function listInventory(req, res, next) {
  try {
    const householdId = req.householdId;
    const filter = (req.query.filter || "").toString();

    const query = { householdId };
    const now = new Date();

    // Filters: lowStock, expiringSoon
    if (filter === "lowStock") {
      query.$expr = { $lte: ["$quantity", "$threshold"] };
    }

    if (filter === "expiringSoon") {
      const days = Number(req.query.days || 7);
      const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      query.expiryDate = { $ne: null, $gte: now, $lte: until };
    }

    const items = await InventoryItem.find(query)
      .sort({ updatedAt: -1 })
      .limit(500);

    res.json({ items });
  } catch (e) {
    next(e);
  }
}

async function createItem(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      err.details = parsed.error.flatten();
      throw err;
    }

    const householdId = req.householdId;
    const userId = req.user.userId;

    const data = parsed.data;

    const expiry = parseMaybeDate(data.expiryDate);
    if (data.expiryDate && expiry === undefined) {
      const err = new Error("Invalid expiryDate");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      throw err;
    }

    const item = await InventoryItem.create({
      householdId,
      name: data.name,
      category: data.category || "Other",
      quantity: data.quantity ?? 1,
      unit: data.unit || "pcs",
      threshold: data.threshold ?? 0,
      expiryDate: expiry ?? null,
      location: data.location || "",
      lastUpdatedBy: userId,
    });

    res.status(201).json({ item });
  } catch (e) {
    next(e);
  }
}

async function updateItem(req, res, next) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      err.details = parsed.error.flatten();
      throw err;
    }

    const householdId = req.householdId;
    const userId = req.user.userId;
    const id = req.params.id;

    const data = parsed.data;

    if ("expiryDate" in data) {
      const expiry = parseMaybeDate(data.expiryDate);
      if (data.expiryDate && expiry === undefined) {
        const err = new Error("Invalid expiryDate");
        err.statusCode = 400;
        err.code = "VALIDATION_ERROR";
        throw err;
      }
      data.expiryDate = expiry ?? null;
    }

    const item = await InventoryItem.findOneAndUpdate(
      { _id: id, householdId },
      { ...data, lastUpdatedBy: userId },
      { new: true }
    );

    if (!item) {
      const err = new Error("Inventory item not found");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }

    res.json({ item });
  } catch (e) {
    next(e);
  }
}

async function deleteItem(req, res, next) {
  try {
    const householdId = req.householdId;
    const id = req.params.id;

    const item = await InventoryItem.findOneAndDelete({ _id: id, householdId });
    if (!item) {
      const err = new Error("Inventory item not found");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { listInventory, createItem, updateItem, deleteItem };
