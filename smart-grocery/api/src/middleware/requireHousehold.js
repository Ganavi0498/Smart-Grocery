const User = require("../models/User");

async function requireHousehold(req, res, next) {
  try {
    const userId = req.user?.userId;
    const user = await User.findById(userId).select("householdId");
    if (!user) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }
    if (!user.householdId) {
      return res.status(403).json({
        error: { code: "NO_HOUSEHOLD", message: "User does not belong to a household" },
      });
    }
    req.householdId = user.householdId.toString();
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { requireHousehold };
