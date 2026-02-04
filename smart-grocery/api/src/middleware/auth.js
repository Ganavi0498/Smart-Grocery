const { verifyAccessToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; 
    return next();
  } catch (e) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
}

module.exports = { requireAuth };
