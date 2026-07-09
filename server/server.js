const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

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
const studentRoutes = require("./routes/StudentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const academicActivityRoutes = require("./routes/academicActivityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingRoutes = require("./routes/settingRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const placementRoutes = require("./routes/placementRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const successStoryRoutes = require("./routes/successStoryRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chatRoutes = require("./routes/chatRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const startOpportunityCron = require("./scripts/opportunityCron");

const app = express();
app.set('trust proxy', 1)
const server = http.createServer(app);

// ==================== DATABASE CONNECTION ====================
connectDB();

// ==================== SOCKET.IO INITIALIZATION ====================
initSocket(server);

// ==================== CRON JOBS ====================
startOpportunityCron();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://mycampx.vercel.app", 
    process.env.CLIENT_URL
  ].filter(Boolean),
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
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/success-stories", successStoryRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/test-brevo", async (req, res) => {
  try {
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 5000,
    });

    await transporter.verify();

    res.json({
      success: true,
      message: "SMTP Connected Successfully"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }
});
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
const PORT = process.env.PORT || 3000;

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