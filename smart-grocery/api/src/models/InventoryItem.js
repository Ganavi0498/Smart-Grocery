const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", required: true, index: true },

    name: { type: String, trim: true, required: true, maxlength: 80 },
    category: { type: String, trim: true, default: "Other", maxlength: 40 },

    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, trim: true, default: "pcs", maxlength: 16 },

    threshold: { type: Number, default: 0, min: 0 }, // low-stock trigger
    expiryDate: { type: Date, default: null },

    location: { type: String, trim: true, default: "", maxlength: 40 }, // pantry/fridge etc.

    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Helpful index for expiringSoon queries
inventoryItemSchema.index({ householdId: 1, expiryDate: 1 });

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
