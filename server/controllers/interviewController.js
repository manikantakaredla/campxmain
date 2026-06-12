const InterviewExperience = require('../models/InterviewExperience');
const ActivityLog = require('../models/ActivityLog');

exports.getExperiences = async (req, res, next) => {
  try {
    const { companyName, role, status, page = 1, limit = 10 } = req.query;
    
    // Students only see approved
    let query = { status: 'Approved' };
    
    // Admin can see all
    if (req.user.role !== 'student' && status) {
      query.status = status;
    }
    
    if (companyName) query.companyName = { $regex: companyName, $options: 'i' };
    if (role) query.role = { $regex: role, $options: 'i' };
    
    const startIndex = (page - 1) * limit;
    const total = await InterviewExperience.countDocuments(query);
    
    const experiences = await InterviewExperience.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(Number(limit));
      
    // Handle anonymity
    const sanitizedData = experiences.map(exp => {
      let data = exp.toObject();
      if (data.isAnonymous) {
        data.studentName = 'Anonymous Student';
        data.rollNumber = 'Hidden';
      }
      return data;
    });
      
    res.status(200).json({
      success: true,
      count: sanitizedData.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      },
      data: sanitizedData
    });
  } catch (error) {
    next(error);
  }
};

exports.getExperienceById = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Not found' });
    
    let data = experience.toObject();
    if (data.isAnonymous) {
      data.studentName = 'Anonymous Student';
      data.rollNumber = 'Hidden';
    }
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.submitExperience = async (req, res, next) => {
  try {
    const newExp = {
      ...req.body,
      createdBy: req.user._id,
      status: 'Pending' // Requires admin approval
    };
    
    const experience = await InterviewExperience.create(newExp);
    res.status(201).json({ success: true, data: experience, message: 'Submitted for approval' });
  } catch (error) {
    next(error);
  }
};

exports.approveExperience = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      approvedBy: req.user._id,
      approvedAt: new Date()
    }, { new: true });
    
    if (!experience) return res.status(404).json({ success: false, message: 'Not found' });
    
    await ActivityLog.create({
      userId: req.user._id,
      action: `Interview Experience ${req.body.status}`,
      module: 'Interviews',
      entityId: experience._id
    });
    
    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

exports.deleteExperience = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Not found' });
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
