const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },

    // Optional preferences for later suggestions
    preferences: {
      dietary: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
    },

    // We'll add household membership later (next component)
    householdId: { type: mongoose.Schema.Types.ObjectId, ref: "Household", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
