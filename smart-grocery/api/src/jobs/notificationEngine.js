// api/src/jobs/notificationEngine.js
const cron = require("node-cron");

const Notification = require("../models/Notification");
const Household = require("../models/Household");
const InventoryItem = require("../models/InventoryItem");

// Detect schema field names safely (prevents “wrong field” headaches)
function pickField(schema, candidates, fallback) {
  for (const c of candidates) {
    if (schema.path(c)) return c;
  }
  return fallback;
}

function toDateOnlyKey(d) {
  // YYYY-MM-DD in local time is good enough for MVP dedupe
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function daysBetween(a, b) {
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function upsertNotification(doc) {
  // Only create once. Never overwrite “read” status.
  await Notification.updateOne(
    { householdId: doc.householdId, dedupeKey: doc.dedupeKey },
    { $setOnInsert: doc },
    { upsert: true }
  );
}

async function runForHousehold(household, opts = {}) {
  const now = new Date();

  const invSchema = InventoryItem.schema;

  const householdField = pickField(invSchema, ["householdId", "household"], "householdId");
  const expiryField = pickField(invSchema, ["expiryDate", "expiresAt", "expiry", "expDate"], "expiryDate");
  const qtyField = pickField(invSchema, ["quantity", "qty", "stock", "count"], "quantity");
  const thresholdField = pickField(invSchema, ["threshold", "minQty", "minQuantity", "lowStockThreshold"], "threshold");
  const nameField = pickField(invSchema, ["name", "title", "itemName"], "name");

  const leadDays = Number(process.env.DEFAULT_EXPIRY_LEAD_DAYS || 7);

  // Pull inventory for household (MVP approach: fetch and compute in JS for robustness)
  const items = await InventoryItem.find({ [householdField]: household._id }).lean();

  let created = 0;
  let scanned = items.length;

  for (const it of items) {
    const itemName = it[nameField] || "Item";

    // -------- Expiry notifications --------
    const exp = it[expiryField] ? new Date(it[expiryField]) : null;
    if (exp && !Number.isNaN(exp.getTime())) {
      const daysLeft = daysBetween(now, exp);
      if (daysLeft >= 0 && daysLeft <= leadDays) {
        const key = `EXPIRY_SOON:${household._id}:${it._id}:${toDateOnlyKey(now)}`;

        await upsertNotification({
          householdId: household._id,
          userId: null,
          type: "EXPIRY_SOON",
          title: `${itemName} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
          message: `Heads-up: ${itemName} is expiring soon. Consider using it or adding it to your plan.`,
          status: "unread",
          entity: { kind: "InventoryItem", id: it._id },
          meta: { daysLeft, expiryAt: exp.toISOString() },
          dedupeKey: key,
          createdBy: opts.createdBy || null,
        });

        created += 1;
      }
    }

    // -------- Low stock notifications --------
    const qty = Number(it[qtyField]);
    const thr = Number(it[thresholdField]);

    if (!Number.isNaN(qty) && !Number.isNaN(thr) && thr > 0 && qty <= thr) {
      const key = `LOW_STOCK:${household._id}:${it._id}:${toDateOnlyKey(now)}`;

      await upsertNotification({
        householdId: household._id,
        userId: null,
        type: "LOW_STOCK",
        title: `${itemName} is low`,
        message: `${itemName} is at ${qty}. Your threshold is ${thr}. Add it to your grocery list when ready.`,
        status: "unread",
        entity: { kind: "InventoryItem", id: it._id },
        meta: { qty, threshold: thr },
        dedupeKey: key,
        createdBy: opts.createdBy || null,
      });

      created += 1;
    }
  }

  return { householdId: household._id.toString(), scanned, created };
}

async function runNotificationEngine(opts = {}) {
  // Ensure indexes exist (unique dedupeKey index matters)
  try {
    await Notification.syncIndexes();
  } catch (_) {
    // ignore index sync issues in MVP; log in production
  }

  const households = opts.householdId
    ? await Household.find({ _id: opts.householdId }).lean()
    : await Household.find({}).lean();

  const results = [];
  for (const h of households) {
    results.push(await runForHousehold(h, opts));
  }
  return results;
}

let started = false;

function startNotificationEngine() {
  if (started) return;
  started = true;

  const schedule = process.env.NOTIFICATION_CRON || "0 * * * *"; // hourly by default
  // Example daily at 09:00: "0 9 * * *"

  cron.schedule(schedule, async () => {
    try {
      await runNotificationEngine();
      // optional: console.log("Notification engine ran");
    } catch (e) {
      console.error("Notification engine failed:", e);
    }
  });

  // Run once at startup (optional, but useful in dev)
  if (process.env.NOTIFICATION_RUN_ON_STARTUP === "true") {
    runNotificationEngine().catch((e) => console.error("Notification engine startup run failed:", e));
  }
}

module.exports = { startNotificationEngine, runNotificationEngine };