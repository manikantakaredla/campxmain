const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const SavedOpportunity = require('../models/SavedOpportunity');
const AcademicActivity = require('../models/AcademicActivity');
const Announcement = require('../models/Announcement');
const notificationService = require('../services/notificationService');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.getOpportunities = async (req, res, next) => {
  try {
    const { type, status, priority, visibility, search, page = 1, limit = 10 } = req.query;
    let query = { isDeleted: false };
    
    if (req.user.role === 'student') {
      query.visibility = 'Public';
      // Ideally, more logic for eligibility filtering can go here if needed to strict-hide.
      // But standard is showing all public, marking "Not Eligible" on UI.
    }
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (visibility && req.user.role !== 'student') query.visibility = visibility;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const startIndex = (page - 1) * limit;
    const total = await Opportunity.countDocuments(query);
    const opportunities = await Opportunity.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .skip(startIndex)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .lean();
      
    res.status(200).json({ success: true, count: opportunities.length, pagination: { page: Number(page), limit: Number(limit), total }, data: opportunities });
  } catch (error) { next(error); }
};

exports.getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate('createdBy', 'name email');
    if (!opportunity || opportunity.isDeleted) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    
    opportunity.viewCount += 1;
    await opportunity.save();
    
    let isSaved = false;
    let applicationStatus = null;
    
    if (req.user.role === 'student') {
      const saved = await SavedOpportunity.findOne({ studentId: req.user.id, opportunityId: opportunity._id });
      isSaved = !!saved;
      const app = await Application.findOne({ studentId: req.user.id, opportunityId: opportunity._id });
      if (app) applicationStatus = app.status;
    }
    res.status(200).json({ success: true, data: { ...opportunity.toObject(), isSaved, applicationStatus } });
  } catch (error) { next(error); }
};

exports.createOpportunity = async (req, res, next) => {
  try {
    const newOp = { ...req.body, createdBy: req.user.id };
    const opportunity = await Opportunity.create(newOp);
    
    // 1. Create Calendar Event
    if (opportunity.eventDate) {
      const calendarEvent = await AcademicActivity.create({
        title: opportunity.title,
        description: opportunity.description,
        type: "Placement Drive",
        startDate: opportunity.eventDate,
        endDate: opportunity.eventDate,
        venue: opportunity.location || "TBD",
        status: "upcoming",
        createdBy: req.user.id,
        inheritedAudience: { audienceType: opportunity.visibility === 'Public' ? 'all' : 'students' }
      });
      opportunity.calendarEventId = calendarEvent._id;
    }
    
    // 2. Create Announcement
    if (!opportunity.announcementGenerated) {
      const announcement = await Announcement.create({
        title: `New Opportunity: ${opportunity.title} at ${opportunity.companyName}`,
        description: opportunity.description || `A new ${opportunity.type} has been posted.`,
        type: "placement",
        priority: opportunity.priority === 'Critical' ? 'urgent' : 'medium',
        audience: "students",
        createdBy: req.user.id,
        eventDate: opportunity.eventDate,
        registrationDeadline: opportunity.registrationDeadline
      });
      opportunity.announcementId = announcement._id;
      opportunity.announcementGenerated = true;
    }
    
    await opportunity.save();
    
    // 3. Smart Notifications (Milestone 9)
    if (opportunity.eligibility) {
      let userQuery = { role: 'student', isActive: true };
      
      if (opportunity.eligibility.branches && opportunity.eligibility.branches.length > 0) {
        userQuery.branch = { $in: opportunity.eligibility.branches };
      }
      if (opportunity.eligibility.departments && opportunity.eligibility.departments.length > 0) {
        userQuery.department = { $in: opportunity.eligibility.departments };
      }
      if (opportunity.eligibility.sections && opportunity.eligibility.sections.length > 0) {
        userQuery.section = { $in: opportunity.eligibility.sections };
      }
      if (opportunity.eligibility.years && opportunity.eligibility.years.length > 0) {
        userQuery.currentYear = { $in: opportunity.eligibility.years };
      }
      // Note: Ignoring CGPA for now as User model doesn't have it explicitly as requested.
      
      const eligibleUsers = await User.find(userQuery).select('_id');
      const targetUserIds = eligibleUsers.map(u => u._id);
      
      if (targetUserIds.length > 0) {
        await notificationService.createNotification({
          title: `New Opportunity: ${opportunity.title}`,
          message: `A new ${opportunity.type} by ${opportunity.companyName} matches your profile.`,
          type: 'announcement',
          category: 'opportunity',
          relatedId: opportunity._id,
          targetUsers: targetUserIds,
          createdBy: req.user.id
        });
      }
    }
    
    await ActivityLog.create({ userId: req.user.id, action: 'Created Opportunity', module: 'Opportunities', entityId: opportunity._id });
    res.status(201).json({ success: true, data: opportunity });
  } catch (error) { next(error); }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity || opportunity.isDeleted) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    
    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    // Sync Calendar
    if (opportunity.calendarEventId) {
      await AcademicActivity.findByIdAndUpdate(opportunity.calendarEventId, {
        title: opportunity.title,
        description: opportunity.description,
        startDate: opportunity.eventDate,
        endDate: opportunity.eventDate,
        venue: opportunity.location
      });
    }
    
    // Sync Announcement
    if (opportunity.announcementId) {
      await Announcement.findByIdAndUpdate(opportunity.announcementId, {
        title: `Updated: ${opportunity.title} at ${opportunity.companyName}`,
        description: opportunity.description,
        eventDate: opportunity.eventDate,
        registrationDeadline: opportunity.registrationDeadline
      });
    }
    
    await ActivityLog.create({ userId: req.user.id, action: 'Updated Opportunity', module: 'Opportunities', entityId: opportunity._id });
    res.status(200).json({ success: true, data: opportunity });
  } catch (error) { next(error); }
};

exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity || opportunity.isDeleted) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    
    opportunity.isDeleted = true;
    opportunity.deletedAt = new Date();
    opportunity.deletedBy = req.user.id;
    await opportunity.save();
    
    // Delete/Archive Calendar Event
    if (opportunity.calendarEventId) {
      await AcademicActivity.findByIdAndDelete(opportunity.calendarEventId);
    }
    
    // Archive Announcement
    if (opportunity.announcementId) {
      await Announcement.findByIdAndUpdate(opportunity.announcementId, { status: 'expired' });
    }
    
    await ActivityLog.create({ userId: req.user.id, action: 'Deleted Opportunity', module: 'Opportunities', entityId: opportunity._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

exports.restoreOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity || !opportunity.isDeleted) return res.status(404).json({ success: false, message: 'Opportunity not found or not deleted' });
    
    opportunity.isDeleted = false;
    opportunity.deletedAt = undefined;
    opportunity.deletedBy = undefined;
    await opportunity.save();
    
    // Restore Calendar (Re-create since it was hard deleted, or in a real app soft delete Calendar too. Since we hard deleted it above, we recreate)
    if (opportunity.eventDate) {
      const calendarEvent = await AcademicActivity.create({
        title: opportunity.title,
        description: opportunity.description,
        type: "Placement Drive",
        startDate: opportunity.eventDate,
        endDate: opportunity.eventDate,
        venue: opportunity.location || "TBD",
        status: "upcoming",
        createdBy: req.user.id
      });
      opportunity.calendarEventId = calendarEvent._id;
      await opportunity.save();
    }
    
    // Restore Announcement
    if (opportunity.announcementId) {
      await Announcement.findByIdAndUpdate(opportunity.announcementId, { status: 'active' });
    }
    
    await ActivityLog.create({ userId: req.user.id, action: 'Restored Opportunity', module: 'Opportunities', entityId: opportunity._id });
    res.status(200).json({ success: true, data: opportunity });
  } catch (error) { next(error); }
};

// Application Tracking
exports.applyForOpportunity = async (req, res, next) => {
  try {
    const opportunityId = req.params.id;
    const studentId = req.user.id;
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity || opportunity.isDeleted || opportunity.status === 'Closed') return res.status(400).json({ success: false, message: 'Opportunity is not available' });
    
    const existing = await Application.findOne({ opportunityId, studentId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied' });
    
    const application = await Application.create({ opportunityId, studentId, status: 'Applied' });
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'You have already applied' });
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(req.params.appId, { status, updatedAt: new Date() }, { new: true });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    
    await ActivityLog.create({ userId: req.user.id, action: `Application ${status}`, module: 'Applications', entityId: application._id });
    res.status(200).json({ success: true, data: application });
  } catch (error) { next(error); }
};

// Saved Opportunities
exports.saveOpportunity = async (req, res, next) => {
  try {
    const existing = await SavedOpportunity.findOne({ opportunityId: req.params.id, studentId: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already saved' });
    
    await SavedOpportunity.create({ opportunityId: req.params.id, studentId: req.user.id });
    res.status(201).json({ success: true, message: 'Opportunity saved' });
  } catch (error) { next(error); }
};

exports.removeSavedOpportunity = async (req, res, next) => {
  try {
    await SavedOpportunity.findOneAndDelete({ opportunityId: req.params.id, studentId: req.user.id });
    res.status(200).json({ success: true, message: 'Saved opportunity removed' });
  } catch (error) { next(error); }
};

// Analytics
exports.getOpportunityAnalytics = async (req, res, next) => {
  try {
    const opportunityId = req.params.id;
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Not found' });
    
    const totalSaves = await SavedOpportunity.countDocuments({ opportunityId });
    const totalApplications = await Application.countDocuments({ opportunityId });
    const selectedCount = await Application.countDocuments({ opportunityId, status: 'Selected' });
    
    let selectionRatio = 0;
    if (totalApplications > 0) selectionRatio = ((selectedCount / totalApplications) * 100).toFixed(2);
    
    res.status(200).json({
      success: true,
      data: { views: opportunity.viewCount, saves: totalSaves, applications: totalApplications, selected: selectedCount, selectionRatio: `${selectionRatio}%` }
    });
  } catch (error) { next(error); }
};
