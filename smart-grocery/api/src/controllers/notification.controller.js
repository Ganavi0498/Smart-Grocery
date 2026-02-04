const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const InventoryItem = require("../models/InventoryItem");
const User = require("../models/User");

function apiError(res, status, code, message, details) {
  return res.status(status).json({
    error: { code, message, ...(details ? { details } : {}) }
  });
}

function getUserId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

async function resolveHouseholdId(userId) {
  const u = await User.findById(userId).select("householdId");
  return u?.householdId || null;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

exports.getPrefs = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return apiError(res, 401, "UNAUTHORIZED", "Missing auth user");

  const prefs = await NotificationPreference.findOne({ userId }).lean();
  return res.json({ expiryWindows: prefs?.expiryWindows || [7, 3] });
};

exports.updatePrefs = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return apiError(res, 401, "UNAUTHORIZED", "Missing auth user");

  const { expiryWindows } = req.body || {};
  if (!Array.isArray(expiryWindows) || expiryWindows.length === 0) {
    return apiError(res, 400, "VALIDATION_ERROR", "expiryWindows must be a non-empty array of numbers");
  }

  const normalized = [...new Set(expiryWindows.map(Number))]
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 90)
    .sort((a, b) => b - a);

  if (normalized.length === 0) {
    return apiError(res, 400, "VALIDATION_ERROR", "expiryWindows must contain valid day numbers (1..90)");
  }

  const updated = await NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: { expiryWindows: normalized } },
    { upsert: true, new: true }
  ).lean();

  return res.json({ expiryWindows: updated.expiryWindows });
};

exports.listMyNotifications = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return apiError(res, 401, "UNAUTHORIZED", "Missing auth user");

  const items = await Notification.find({ userId, dismissedAt: null })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return res.json({ items });
};

exports.markRead = async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();

  if (!updated) return apiError(res, 404, "NOT_FOUND", "Notification not found");
  return res.json({ item: updated });
};

exports.dismiss = async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { dismissedAt: new Date() } },
    { new: true }
  ).lean();

  if (!updated) return apiError(res, 404, "NOT_FOUND", "Notification not found");
  return res.json({ item: updated });
};

/**
 * POST /api/notifications/generate-expiry
 * This is the “cron target” endpoint. You can trigger it manually or via a scheduler.
 */
exports.generateExpiryNotifications = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return apiError(res, 401, "UNAUTHORIZED", "Missing auth user");

  const householdId = await resolveHouseholdId(userId);
  if (!householdId) return apiError(res, 400, "VALIDATION_ERROR", "User is not in a household");

  // determine windows: use stored prefs unless request overrides
  const prefs = await NotificationPreference.findOne({ userId }).lean();
  const fallback = prefs?.expiryWindows || [7, 3];

  const windows = Array.isArray(req.body?.expiryWindows) && req.body.expiryWindows.length
    ? req.body.expiryWindows
    : fallback;

  const normalized = [...new Set(windows.map(Number))]
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 90)
    .sort((a, b) => b - a);

  if (normalized.length === 0) {
    return apiError(res, 400, "VALIDATION_ERROR", "No valid expiryWindows provided");
  }

  // find household members (MVP assumption: user.householdId exists)
  const members = await User.find({ householdId }).select("_id").lean();
  if (!members.length) return res.json({ created: 0, note: "No household members found" });

  const now = new Date();
  const today = startOfDay(now);

  let created = 0;

  // For each reminder window, generate notifications for items expiring within that window
  for (const windowDays of normalized) {
    const end = addDays(today, windowDays);

    const expiringItems = await InventoryItem.find({
      householdId,
      expiryDate: { $ne: null, $gte: today, $lte: end }
    })
      .select("_id name expiryDate")
      .lean();

    for (const item of expiringItems) {
      const expiry = new Date(item.expiryDate);
      const daysLeft = Math.ceil((startOfDay(expiry) - today) / (1000 * 60 * 60 * 24));

      // Generate per-user notifications so read/dismiss is personal
      for (const m of members) {
        const dedupeKey = `EXPIRY:${String(m._id)}:${String(item._id)}:${windowDays}:${startOfDay(expiry).toISOString()}`;

        try {
          await Notification.create({
            householdId,
            userId: m._id,
            type: "EXPIRY",
            inventoryItemId: item._id,
            windowDays,
            dedupeKey,
            title: `Expiring in ${daysLeft} day(s)`,
            message: `${item.name} expires on ${expiry.toISOString().slice(0, 10)}`
          });
          created += 1;
        } catch (e) {
          // Ignore duplicate key errors (dedupe doing its job)
          if (e?.code !== 11000) throw e;
        }
      }
    }
  }

  return res.json({ created, windows: normalized });
};
