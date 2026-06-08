const supabase = require("../config/supabase");

// ==================== UPLOAD FILE ====================
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    // Validate file size (50MB max)
    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than 50MB"
      });
    }
    
    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Allowed: images, PDF, PPT, DOC, XLS"
      });
    }
    
    // Generate unique filename
    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `uploads/${req.user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Upload to Supabase
    const { error } = await supabase.storage
      .from("campx-files")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600"
      });
    
    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to upload file: " + error.message
      });
    }
    
    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from("campx-files")
      .getPublicUrl(fileName);
    
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: publicUrl.publicUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};