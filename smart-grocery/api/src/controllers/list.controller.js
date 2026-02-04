const GroceryList = require("../models/GroceryList");
const User = require("../models/User");

// IMPORTANT: make sure this file actually exists and matches your inventory model name
const InventoryItem = require("../models/InventoryItem");

function getUserId(req) {
  return req.user?.userId || req.userId || req.user?.id || req.user?._id;
}

async function getHouseholdId(req) {
  const inReq = req.user?.householdId || req.householdId;
  if (inReq) return inReq;

  const userId = getUserId(req);
  if (!userId) return null;

  const u = await User.findById(userId).select("householdId");
  return u?.householdId || null;
}

async function ensureActiveList(householdId) {
  let list = await GroceryList.findOne({ householdId, status: "active" });
  if (!list) {
    list = await GroceryList.create({
      householdId,
      status: "active",
      title: "Grocery List",
      items: [],
    });
  }
  return list;
}

async function getCurrentList(req, res, next) {
  try {
    const householdId = await getHouseholdId(req);
    if (!householdId) {
      return res.status(400).json({ error: "User has no household. Create/join household first." });
    }

    const list = await ensureActiveList(householdId);
    return res.json({ list });
  } catch (err) {
    next(err);
  }
}

async function addListItem(req, res, next) {
  try {
    const householdId = await getHouseholdId(req);
    if (!householdId) return res.status(400).json({ error: "User has no household." });

    const userId = getUserId(req);
    const { name, category, quantity, unit, notes } = req.body || {};

    if (!name || String(name).trim().length < 2) {
      return res.status(422).json({ error: "Item name must be at least 2 characters." });
    }

    const list = await ensureActiveList(householdId);

    list.items.push({
      name: String(name).trim(),
      category: category ? String(category).trim() : "Other",
      quantity: Number.isFinite(Number(quantity)) ? Number(quantity) : 1,
      unit: unit ? String(unit).trim() : "pcs",
      notes: notes ? String(notes).trim() : "",
      checked: false,
      source: "manual",
      addedBy: userId || undefined,
    });

    await list.save();
    return res.status(201).json({ list });
  } catch (err) {
    next(err);
  }
}

async function updateListItem(req, res, next) {
  try {
    const householdId = await getHouseholdId(req);
    if (!householdId) return res.status(400).json({ error: "User has no household." });

    const { itemId } = req.params;
    const patch = req.body || {};

    const list = await ensureActiveList(householdId);
    const item = list.items.id(itemId);

    if (!item) return res.status(404).json({ error: "Item not found." });

    if (patch.name !== undefined) item.name = String(patch.name).trim();
    if (patch.category !== undefined) item.category = String(patch.category).trim();
    if (patch.unit !== undefined) item.unit = String(patch.unit).trim();
    if (patch.notes !== undefined) item.notes = String(patch.notes).trim();

    if (patch.quantity !== undefined) {
      const q = Number(patch.quantity);
      if (!Number.isFinite(q) || q < 0) {
        return res.status(422).json({ error: "Quantity must be a non-negative number." });
      }
      item.quantity = q;
    }

    if (patch.checked !== undefined) item.checked = Boolean(patch.checked);

    await list.save();
    return res.json({ list });
  } catch (err) {
    next(err);
  }
}

async function deleteListItem(req, res, next) {
  try {
    const householdId = await getHouseholdId(req);
    if (!householdId) return res.status(400).json({ error: "User has no household." });

    const { itemId } = req.params;

    const list = await ensureActiveList(householdId);
    const item = list.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not found." });

    item.deleteOne();
    await list.save();

    return res.json({ list });
  } catch (err) {
    next(err);
  }
}

async function syncLowStockToList(req, res, next) {
  try {
    const householdId = await getHouseholdId(req);
    if (!householdId) return res.status(400).json({ error: "User has no household." });

    const inv = await InventoryItem.find({
      householdId,
      threshold: { $ne: null },
      $expr: { $lte: ["$quantity", "$threshold"] },
    }).select("name category unit quantity threshold");

    const list = await ensureActiveList(householdId);

    const normalize = (s) => String(s || "").trim().toLowerCase();
    const index = new Map();
    list.items.forEach((it) => index.set(`${normalize(it.name)}|${normalize(it.unit)}`, it));

    for (const x of inv) {
      const key = `${normalize(x.name)}|${normalize(x.unit)}`;
      const qty = Number(x.quantity ?? 0);
      const thr = Number(x.threshold ?? 0);
      const needed = Math.max(thr - qty, 1);

      const existing = index.get(key);
      if (existing) {
        existing.quantity = Math.max(Number(existing.quantity || 0), needed);
        existing.category = x.category || existing.category || "Other";
        if (existing.source !== "manual") existing.source = "lowStock";
      } else {
        list.items.push({
          name: x.name,
          category: x.category || "Other",
          quantity: needed,
          unit: x.unit || "pcs",
          checked: false,
          source: "lowStock",
        });
      }
    }

    list.generatedAt = new Date();
    await list.save();

    return res.json({ list, addedFromLowStock: inv.length });
  } catch (err) {
    next(err);
  }
}

async function completeCurrentList(req, res, next) {
  try {
    const householdId = await getHouseholdId(req);
    if (!householdId) return res.status(400).json({ error: "User has no household." });

    const current = await GroceryList.findOne({ householdId, status: "active" });
    if (!current) {
      const list = await ensureActiveList(householdId);
      return res.json({ completed: null, list });
    }

    current.status = "completed";
    current.completedAt = new Date();
    await current.save();

    const nextList = await GroceryList.create({
      householdId,
      status: "active",
      title: "Grocery List",
      items: [],
    });

    return res.json({ completed: current, list: nextList });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCurrentList,
  addListItem,
  updateListItem,
  deleteListItem,
  syncLowStockToList,
  completeCurrentList,
};
