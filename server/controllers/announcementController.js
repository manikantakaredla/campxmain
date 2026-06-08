const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const AcademicActivity = require("../models/AcademicActivity");
const User = require("../models/User");
const { getIO } = require("../config/socket");
const supabase = require("../config/supabase");

// Types that should create calendar events
const CALENDAR_TYPES = [
  "exam", "workshop", "internship", "hackathon", 
  "placement", "crt", "sports", "event"
];

// Helper function to create calendar event from announcement
async function createCalendarEventFromAnnouncement(announcement) {
  try {
    // Map announcement type to activity type
    const typeMapping = {
      exam: "Exam Notice",
      workshop: "Workshop",
      internship: "Internship",
      hackathon: "Hackathon",
      placement: "Placement Drive",
      crt: "CRT Program",
      sports: "Sports",
      event: "Event"
    };

    const activityType = typeMapping[announcement.type] || "Workshop";
    
    // Use eventDate if available, otherwise startDate
    const eventStartDate = announcement.eventDate || announcement.startDate;

    const activity = await AcademicActivity.create({
      title: announcement.title,
      description: announcement.description,
      type: activityType,
      startDate: eventStartDate,
      endDate: announcement.expiryDate || null,
      venue: announcement.eventVenue || announcement.location || null,
      status: "upcoming",
      createdBy: announcement.createdBy,
      sourceAnnouncementId: announcement._id
    });

    // Mark announcement as having calendar event created
    announcement.calendarEventCreated = true;
    await announcement.save();

    console.log(`✅ Calendar event created for announcement: ${announcement.title}`);
    return activity;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return null;
  }
}

// Helper function to create notifications
async function createNotificationsForAnnouncement(announcement) {
  try {
    let targetUsers = [];

    // Get target users based on audience
    if (announcement.audience === "all") {
      targetUsers = await User.find({ isActive: true }).select("_id");
    } else if (announcement.audience === "students") {
      let query = { role: "student", isActive: true };
      
      // Apply department filter if specified
      if (announcement.targetDepartment) {
        query.branch = announcement.targetDepartment;
      }
      // Apply year filter if specified
      if (announcement.targetYear) {
        query.currentYear = announcement.targetYear;
      }
      // Apply section filter if specified
      if (announcement.targetSection) {
        query.section = announcement.targetSection;
      }
      
      targetUsers = await User.find(query).select("_id");
    } else if (announcement.audience === "faculty") {
      let query = { role: { $in: ["faculty", "hod", "deputyhod", "dean", "principal"] }, isActive: true };
      
      if (announcement.targetDepartment) {
        query.department = announcement.targetDepartment;
      }
      
      targetUsers = await User.find(query).select("_id");
    }

    if (targetUsers.length > 0 && targetUsers.length < 5000) {
      const notifications = targetUsers.map(user => ({
        title: `New ${announcement.type.toUpperCase()}: ${announcement.title}`,
        message: announcement.description.substring(0, 200),
        type: "announcement",
        relatedId: announcement._id,
        targetUsers: [user._id],
        createdBy: announcement.createdBy._id || announcement.createdBy
      }));

      await Notification.insertMany(notifications);

      // Emit realtime notifications
      const io = getIO();
      targetUsers.forEach(user => {
        io.to(user._id.toString()).emit("new-notification", {
          title: `New Announcement: ${announcement.title}`,
          message: announcement.description.substring(0, 100),
          type: announcement.type
        });
      });
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
}

// ==================== CREATE ANNOUNCEMENT ====================
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      audience,
      contacts,
      location,
      startDate,
      expiryDate,
      tags,
      targetDepartment,
      targetYear,
      targetSection,
      feeAmount,
      feeLastDate,
      eventDate,
      eventVenue,
      registrationLink
    } = req.body;

    let attachment = null;
    let attachmentType = null;

    // Upload attachment to Supabase if exists
    if (req.file) {
      const fileName = `announcements/${Date.now()}-${req.file.originalname}`;
      const { error } = await supabase.storage
        .from("campx-files")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload attachment: " + error.message
        });
      }

      const { data: publicUrl } = supabase.storage
        .from("campx-files")
        .getPublicUrl(fileName);

      attachment = publicUrl.publicUrl;
      attachmentType = req.file.mimetype.startsWith("image/") ? "image" : "pdf";
    }

    // Parse contacts if sent as string
    let parsedContacts = contacts;
    if (typeof contacts === "string") {
      parsedContacts = JSON.parse(contacts);
    }

    // Build announcement data
    const announcementData = {
      title,
      description,
      type: type || "general",
      priority: priority || "medium",
      audience: audience || "all",
      attachment,
      attachmentType,
      contacts: parsedContacts || [],
      location: location || null,
      startDate: startDate || new Date(),
      expiryDate: expiryDate || null,
      tags: tags || [],
      createdBy: req.user.id,
      status: "active",
      targetDepartment: targetDepartment || null,
      targetYear: targetYear ? parseInt(targetYear) : null,
      targetSection: targetSection || null
    };

    // Add fee-specific fields
    if (type === "fee") {
      announcementData.feeAmount = feeAmount ? parseFloat(feeAmount) : null;
      announcementData.feeLastDate = feeLastDate || null;
    }

    // Add event-specific fields
    if (["exam", "workshop", "internship", "hackathon", "placement", "crt", "sports", "event"].includes(type)) {
      announcementData.eventDate = eventDate || startDate || new Date();
      announcementData.eventVenue = eventVenue || location || null;
      announcementData.registrationLink = registrationLink || null;
    }

    const announcement = await Announcement.create(announcementData);
    await announcement.populate("createdBy", "name email role");

    // Auto-create calendar event if type is calendar-related
    if (CALENDAR_TYPES.includes(announcement.type)) {
      await createCalendarEventFromAnnouncement(announcement);
    }

    // Create notifications for target users
    await createNotificationsForAnnouncement(announcement);

    // Emit realtime event
    const io = getIO();
    io.emit("new-announcement", announcement);

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ALL ANNOUNCEMENTS ====================
exports.getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, search, status = "active", type } = req.query;
    
    let query = { status };
    
    if (priority && priority !== "all") {
      query.priority = priority;
    }
    
    if (type && type !== "all") {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    // Filter by user role
    if (req.user.role === "student") {
      const user = await User.findById(req.user.id);
      query.$and = [
        {
          $or: [
            { audience: "all" },
            { audience: "students" }
          ]
        }
      ];
      
      if (user.branch) {
        query.$or = [
          { targetDepartment: { $exists: false } },
          { targetDepartment: null },
          { targetDepartment: user.branch }
        ];
      }
      
      if (user.currentYear) {
        query.$or = [
          { targetYear: { $exists: false } },
          { targetYear: null },
          { targetYear: user.currentYear }
        ];
      }
    }
    
    if (req.user.role !== "student" && req.user.role !== "admin") {
      query.$or = [
        { audience: "all" },
        { audience: "faculty" }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const announcements = await Announcement.find(query)
      .populate("createdBy", "name email role profilePicture")
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Announcement.countDocuments(query);
    
    res.status(200).json({
      success: true,
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET MY ANNOUNCEMENTS ====================
exports.getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ createdBy: req.user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    console.error("Get my announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ANNOUNCEMENT BY ID ====================
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("createdBy", "name email role profilePicture");
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE ANNOUNCEMENT ====================
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    // Check ownership
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this announcement"
      });
    }
    
    const {
      title,
      description,
      type,
      priority,
      audience,
      contacts,
      location,
      expiryDate,
      tags,
      status,
      targetDepartment,
      targetYear,
      targetSection,
      feeAmount,
      feeLastDate,
      eventDate,
      eventVenue,
      registrationLink
    } = req.body;
    
    // Handle new attachment if uploaded
    if (req.file) {
      const fileName = `announcements/${Date.now()}-${req.file.originalname}`;
      const { error } = await supabase.storage
        .from("campx-files")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });
      
      if (!error) {
        const { data: publicUrl } = supabase.storage
          .from("campx-files")
          .getPublicUrl(fileName);
        
        req.body.attachment = publicUrl.publicUrl;
        req.body.attachmentType = req.file.mimetype.startsWith("image/") ? "image" : "pdf";
      }
    }
    
    let parsedContacts = contacts;
    if (typeof contacts === "string") {
      parsedContacts = JSON.parse(contacts);
    }
    
    const updateData = {
      title,
      description,
      type,
      priority,
      audience,
      contacts: parsedContacts,
      location,
      expiryDate,
      tags,
      status,
      targetDepartment,
      targetYear: targetYear ? parseInt(targetYear) : null,
      targetSection
    };
    
    if (type === "fee") {
      updateData.feeAmount = feeAmount ? parseFloat(feeAmount) : null;
      updateData.feeLastDate = feeLastDate || null;
    }
    
    if (CALENDAR_TYPES.includes(type)) {
      updateData.eventDate = eventDate || new Date();
      updateData.eventVenue = eventVenue || location || null;
      updateData.registrationLink = registrationLink || null;
    }
    
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");
    
    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE ANNOUNCEMENT ====================
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }
    
    // Check ownership
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this announcement"
      });
    }
    
    // Also delete associated calendar event if exists
    if (announcement.calendarEventCreated) {
      await AcademicActivity.deleteOne({ sourceAnnouncementId: announcement._id });
    }
    
    await announcement.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully"
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ANNOUNCEMENT TYPES ====================
exports.getAnnouncementTypes = async (req, res) => {
  try {
    const types = [
      { value: "exam", label: "📚 Exam", color: "bg-red-100 text-red-700" },
      { value: "workshop", label: "🔧 Workshop", color: "bg-blue-100 text-blue-700" },
      { value: "internship", label: "💼 Internship", color: "bg-purple-100 text-purple-700" },
      { value: "hackathon", label: "💻 Hackathon", color: "bg-pink-100 text-pink-700" },
      { value: "placement", label: "🎯 Placement", color: "bg-green-100 text-green-700" },
      { value: "crt", label: "📝 CRT", color: "bg-indigo-100 text-indigo-700" },
      { value: "sports", label: "🏆 Sports", color: "bg-orange-100 text-orange-700" },
      { value: "fee", label: "💰 Fee", color: "bg-yellow-100 text-yellow-700" },
      { value: "lab", label: "🔬 Lab", color: "bg-cyan-100 text-cyan-700" },
      { value: "academic", label: "📖 Academic", color: "bg-emerald-100 text-emerald-700" },
      { value: "event", label: "🎉 Event", color: "bg-rose-100 text-rose-700" },
      { value: "general", label: "📢 General", color: "bg-gray-100 text-gray-700" },
      { value: "holiday", label: "🎊 Holiday", color: "bg-teal-100 text-teal-700" },
      { value: "result", label: "📊 Result", color: "bg-violet-100 text-violet-700" }
    ];
    
    res.status(200).json({
      success: true,
      types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};