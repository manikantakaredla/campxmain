const SuccessStory = require('../models/SuccessStory');
const ActivityLog = require('../models/ActivityLog');

exports.getStories = async (req, res, next) => {
  try {
    const stories = await SuccessStory.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.status(200).json({ success: true, count: stories.length, data: stories });
  } catch (error) { next(error); }
};

exports.getStoryById = async (req, res, next) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: story });
  } catch (error) { next(error); }
};

exports.createStory = async (req, res, next) => {
  try {
    const story = await SuccessStory.create({ ...req.body, createdBy: req.user._id });
    await ActivityLog.create({ userId: req.user._id, action: 'Created Success Story', module: 'SuccessStories', entityId: story._id });
    res.status(201).json({ success: true, data: story });
  } catch (error) { next(error); }
};

exports.updateStory = async (req, res, next) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!story) return res.status(404).json({ success: false, message: 'Not found' });
    await ActivityLog.create({ userId: req.user._id, action: 'Updated Success Story', module: 'SuccessStories', entityId: story._id });
    res.status(200).json({ success: true, data: story });
  } catch (error) { next(error); }
};

exports.deleteStory = async (req, res, next) => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Not found' });
    await ActivityLog.create({ userId: req.user._id, action: 'Deleted Success Story', module: 'SuccessStories', entityId: story._id });
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
