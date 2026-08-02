const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      minPoolSize: 5,   // Pre-open connections to eliminate cold-query delays on first login
      maxPoolSize: 30,  // Scale cleanly under high concurrency
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Proactive Database Warmup: Pre-load Mongoose schemas, model prototypes, and database cache
    setTimeout(async () => {
      try {
        const User = require("../models/User");
        const OTP = require("../models/OTP");
        const FeedbackStudent = require("../feedback/models/FeedbackStudent");
        const FeedbackConfig = require("../feedback/models/FeedbackConfig");
        const FeedbackOTP = require("../feedback/models/FeedbackOTP");

        await Promise.all([
          User.findOne().select('_id').lean().exec(),
          OTP.findOne().select('_id').lean().exec(),
          FeedbackStudent.findOne().select('_id').lean().exec(),
          FeedbackConfig.findOne().select('_id').lean().exec(),
          FeedbackOTP.findOne().select('_id').lean().exec()
        ]);
        console.log("🔥 Database pools and Mongoose query caches warmed up successfully!");
      } catch (err) {
        // Silent catch for initial warmup
      }
    }, 300);
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;