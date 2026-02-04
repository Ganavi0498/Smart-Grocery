const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "https://smart-grocery-ganavi.netlify.app" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.send("API is running. Try /health"));
app.get("/health", (req, res) => res.json({ ok: true, service: "api", time: new Date().toISOString() }));

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);
const householdRoutes = require("./routes/household.routes");
app.use("/api/households", householdRoutes);
const inventoryRoutes = require("./routes/inventory.routes");
app.use("/api/inventory", inventoryRoutes);
const listRoutes = require("./routes/list.routes");
app.use("/api/lists", listRoutes);
// api/src/index.js (add near other routes)
const notificationRoutes = require("./routes/notification.routes");
app.use("/api/notifications", notificationRoutes);


const { startNotificationEngine } = require("./jobs/notificationEngine");
startNotificationEngine();

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err.message);
    process.exit(1);
});
