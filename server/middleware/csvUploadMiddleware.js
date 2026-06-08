const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();

// NO file filter - allow all file types for CSV uploads
const csvUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

module.exports = csvUpload;