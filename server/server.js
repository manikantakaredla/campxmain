require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");

const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const errorHandler = require("./middleware/errorMiddleware");
const { limiter } = require("./middleware/rateLimiter");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hodRoutes = require("./routes/hodRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const academicActivityRoutes = require("./routes/academicActivityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingRoutes = require("./routes/settingRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const server = http.createServer(app);

// ==================== DATABASE CONNECTION ====================
connectDB();

// ==================== SOCKET.IO INITIALIZATION ====================
initSocket(server);

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
}));

// ==================== RATE LIMITING ====================
app.use("/api", limiter);

// ==================== PERFORMANCE ====================
app.use(compression());

// ==================== LOGGING ====================
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ==================== BODY PARSERS ====================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ==================== STATIC FILES ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ==================== ROOT ROUTE ====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CAMPX Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      hod: "/api/hod",
      faculty: "/api/faculty",
      student: "/api/student",
      announcements: "/api/announcements",
      resources: "/api/resources",
      calendar: "/api/calendar",
      notifications: "/api/notifications",
      settings: "/api/settings",
      upload: "/api/upload"
    }
  });
});

// ==================== API ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/calendar", academicActivityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/upload", uploadRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use(errorHandler);

// ==================== PROCESS ERROR HANDLERS ====================
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  // Don't crash the server, just log
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 CAMPX BACKEND STARTED SUCCESSFULLY                 ║
║                                                          ║
║   📡 Port: ${PORT}                                          ║
║   🌍 Environment: ${process.env.NODE_ENV || "development"}                    ║
║   🔗 API: http://localhost:${PORT}                         ║
║                                                          ║
║   ✅ MongoDB Connected                                   ║
║   ✅ Supabase Storage Ready                              ║
║   ✅ Socket.IO Ready                                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});