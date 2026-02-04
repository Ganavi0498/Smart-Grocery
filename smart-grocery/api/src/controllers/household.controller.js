const { z } = require("zod");
const Household = require("../models/Household");
const User = require("../models/User");

const createSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

const joinSchema = z.object({
  inviteCode: z.string().trim().min(6).max(16),
});

function makeInviteCode(length = 8) {
  // human-friendly: uppercase letters + digits, no weird chars
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function generateUniqueInviteCode() {
  // avoid collisions (rare, but we handle it cleanly)
  for (let i = 0; i < 10; i++) {
    const code = makeInviteCode(8);
    const exists = await Household.findOne({ inviteCode: code }).select("_id");
    if (!exists) return code;
  }
  const err = new Error("Failed to generate invite code. Try again.");
  err.statusCode = 500;
  err.code = "SERVER_ERROR";
  throw err;
}

async function createHousehold(req, res, next) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      err.details = parsed.error.flatten();
      throw err;
    }

    const userId = req.user.userId;

    // MVP rule: one household per user (simple + safe)
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }
    if (user.householdId) {
      const err = new Error("User already belongs to a household");
      err.statusCode = 409;
      err.code = "CONFLICT";
      throw err;
    }

    const inviteCode = await generateUniqueInviteCode();

    const household = await Household.create({
      name: parsed.data.name,
      inviteCode,
      createdBy: user._id,
      members: [{ userId: user._id, role: "owner" }],
    });

    user.householdId = household._id;
    await user.save();

    res.status(201).json({
      household: {
        id: household._id,
        name: household.name,
        inviteCode: household.inviteCode,
        membersCount: household.members.length,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function joinHousehold(req, res, next) {
  try {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      err.details = parsed.error.flatten();
      throw err;
    }

    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }
    if (user.householdId) {
      const err = new Error("User already belongs to a household");
      err.statusCode = 409;
      err.code = "CONFLICT";
      throw err;
    }

    const code = parsed.data.inviteCode.toUpperCase();
    const household = await Household.findOne({ inviteCode: code });

    if (!household) {
      const err = new Error("Invalid invite code");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }

    // prevent duplicate membership (safe)
    const alreadyMember = household.members.some((m) => m.userId.toString() === user._id.toString());
    if (!alreadyMember) {
      household.members.push({ userId: user._id, role: "member" });
      await household.save();
    }

    user.householdId = household._id;
    await user.save();

    res.json({
      household: {
        id: household._id,
        name: household.name,
        inviteCode: household.inviteCode,
        membersCount: household.members.length,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function getCurrentHousehold(req, res, next) {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("householdId");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }
    if (!user.householdId) {
      return res.json({ household: null });
    }

    const household = await Household.findById(user.householdId).select("_id name inviteCode members createdAt");
    if (!household) {
      // If household was deleted, heal the user record
      user.householdId = null;
      await user.save();
      return res.json({ household: null });
    }

    res.json({
      household: {
        id: household._id,
        name: household.name,
        inviteCode: household.inviteCode,
        membersCount: household.members.length,
        createdAt: household.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { createHousehold, joinHousehold, getCurrentHousehold };
