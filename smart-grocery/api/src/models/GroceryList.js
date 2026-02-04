// api/src/models/GroceryList.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const GroceryItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Other", trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: "pcs", trim: true },
    checked: { type: Boolean, default: false },

    // track why the item exists (helps later for "AI suggestions")
    source: {
      type: String,
      enum: ["manual", "lowStock", "recipe", "ocr"],
      default: "manual",
    },

    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const GroceryListSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    title: { type: String, default: "Grocery List" },
    items: { type: [GroceryItemSchema], default: [] },
    generatedAt: { type: Date },
    completedAt: { type: Date }, // your controller sets this, so store it
  },
  { timestamps: true }
);

// One ACTIVE list per household (clean constraint)
GroceryListSchema.index(
  { householdId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

module.exports = mongoose.model("GroceryList", GroceryListSchema);
