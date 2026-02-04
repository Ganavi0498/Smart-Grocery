const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: { type: String, enum: ["EXPIRY"], required: true, index: true },

    // What item triggered this notification
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // e.g., 7-day reminder vs 3-day reminder
    windowDays: { type: Number, required: true },

    // Used to dedupe notifications (so cron doesn't spam duplicates)
    dedupeKey: { type: String, required: true, unique: true, index: true },

    readAt: { type: Date, default: null },
    dismissedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
