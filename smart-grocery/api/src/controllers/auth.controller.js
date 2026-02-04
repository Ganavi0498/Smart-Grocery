const bcrypt = require("bcrypt");
const { z } = require("zod");
const User = require("../models/User");
const { signAccessToken } = require("../utils/jwt");

const registerSchema = z.object({
  name: z.string().trim().min(1).max(50).optional().or(z.literal("")),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      err.details = parsed.error.flatten();
      throw err;
    }

    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      err.code = "CONFLICT";
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name || "", email, passwordHash });

    const token = signAccessToken({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.code = "VALIDATION_ERROR";
      err.details = parsed.error.flatten();
      throw err;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      err.code = "UNAUTHORIZED";
      throw err;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      err.code = "UNAUTHORIZED";
      throw err;
    }

    const token = signAccessToken({ userId: user._id.toString(), email: user.email });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, householdId: user.householdId },
      token,
    });
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select("_id name email householdId preferences createdAt");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      err.code = "NOT_FOUND";
      throw err;
    }
    res.json({ user });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, me };
