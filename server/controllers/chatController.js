const Message = require('../models/Message');
const User = require('../models/User');
const { resolveClassFaculty, resolveProctorFaculty } = require('../utils/assignmentResolver');
const ClassSectionAssignment = require('../models/ClassSectionAssignment');
const SubjectSectionAssignment = require('../models/SubjectSectionAssignment');
const { getIO } = require('../config/socket');
const mongoose = require('mongoose');

// ==================== GET CONVERSATIONS ====================
exports.getConversations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { userId } = req.query;

    // 1. Fetch Users from past messages (Direct Messages) using Aggregation
    const userIdObj = user._id;
    const messagesAgg = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userIdObj }, { receiver: userIdObj }],
          groupId: { $exists: false }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userIdObj] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$receiver", userIdObj] },
                    { $not: { $in: [userIdObj, { $ifNull: ["$readBy", []] }] } }
                  ] 
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const contactIds = messagesAgg.map(m => m._id).filter(id => id);
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      if (!contactIds.some(id => id.toString() === userId.toString())) {
        contactIds.push(new mongoose.Types.ObjectId(userId));
      }
    }

    const contactsInfo = await User.find({ _id: { $in: contactIds } })
      .select('name profilePicture role department branch')
      .lean();
    
    const contactsInfoMap = new Map();
    contactsInfo.forEach(c => contactsInfoMap.set(c._id.toString(), c));

    const directUsersMap = new Map();
    messagesAgg.forEach(m => {
       const info = contactsInfoMap.get(m._id?.toString());
       if (info) {
          directUsersMap.set(info._id.toString(), {
             _id: info._id,
             name: info.name,
             profilePicture: info.profilePicture,
             role: info.role,
             department: info.department || info.branch,
             lastMessage: m.lastMessage,
             lastMessageTime: m.lastMessageTime,
             unreadCount: m.unreadCount
          });
       }
    });

    if (userId && !directUsersMap.has(userId)) {
       const info = contactsInfoMap.get(userId.toString());
       if (info) {
          directUsersMap.set(userId, {
             _id: info._id,
             name: info.name,
             profilePicture: info.profilePicture,
             role: info.role,
             department: info.department || info.branch,
             lastMessage: '',
             lastMessageTime: null,
             unreadCount: 0
          });
       }
    }

    // 3. Pre-populate default contacts & Groups based on role
    const groups = [];
    const defaultContacts = [];

    if (user.role === 'student') {
      // Get Assigned Faculty
      const classResult = await resolveClassFaculty(user);
      const proctorResult = await resolveProctorFaculty(user);

      if (classResult?.faculty) {
        if (!directUsersMap.has(classResult.faculty._id.toString())) {
          defaultContacts.push({
            ...(classResult.faculty.toObject ? classResult.faculty.toObject() : classResult.faculty),
            label: 'Class Teacher'
          });
        }
      }
      if (proctorResult?.faculty) {
        if (!directUsersMap.has(proctorResult.faculty._id.toString())) {
          defaultContacts.push({
            ...(proctorResult.faculty.toObject ? proctorResult.faculty.toObject() : proctorResult.faculty),
            label: 'Proctor'
          });
        }
      }

      // Add Groups
      if (user.branch && user.currentYear && user.section) {
        groups.push({
          _id: `class_${user.branch}_${user.currentYear}_${user.section}`,
          name: `Class Group (${user.branch} - ${user.currentYear} Yr - Sec ${user.section})`,
          type: 'class'
        });
      }
      if (proctorResult?.faculty) {
        groups.push({
          _id: `proctor_${proctorResult.faculty._id}`,
          name: `Proctor Group (${proctorResult.faculty.name})`,
          type: 'proctor'
        });
      }

    } else if (['faculty', 'hod', 'deputyhod', 'dean', 'principal'].includes(user.role)) {
      // Add Groups for Faculty
      const classAssignments = await ClassSectionAssignment.find({ facultyId: user._id, isActive: true });
      classAssignments.forEach(ca => {
        groups.push({
          _id: `class_${ca.department}_${ca.year}_${ca.section}`,
          name: `Class Group (${ca.department} - ${ca.year} Yr - Sec ${ca.section})`,
          type: 'class'
        });
      });

      const subjectAssignments = await SubjectSectionAssignment.find({ facultyId: user._id, isActive: true });
      subjectAssignments.forEach(sa => {
        const id = `class_${sa.department}_${sa.year}_${sa.section}`;
        if (!groups.find(g => g._id === id)) {
          groups.push({
            _id: id,
            name: `Subject Class (${sa.department} - ${sa.year} Yr - Sec ${sa.section})`,
            type: 'class'
          });
        }
      });

      groups.push({
        _id: `proctor_${user._id}`,
        name: `My Proctored Students`,
        type: 'proctor'
      });
    }

    // Prepare group unread counts & last message using Aggregation
    const groupIds = groups.map(g => g._id);
    const groupAgg = await Message.aggregate([
      {
        $match: {
          groupId: { $in: groupIds }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$groupId",
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $ne: ["$sender", userIdObj] },
                    { $not: { $in: [userIdObj, { $ifNull: ["$readBy", []] }] } }
                  ] 
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const groupAggMap = new Map();
    groupAgg.forEach(g => groupAggMap.set(g._id, g));

    groups.forEach(g => {
       const agg = groupAggMap.get(g._id);
       if (agg) {
          g.lastMessage = agg.lastMessage;
          g.lastMessageTime = agg.lastMessageTime;
          g.unreadCount = agg.unreadCount;
       } else {
          g.lastMessage = '';
          g.lastMessageTime = null;
          g.unreadCount = 0;
       }
    });

    res.status(200).json({
      success: true,
      data: {
        direct: Array.from(directUsersMap.values()),
        defaultContacts,
        groups
      }
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET MESSAGES ====================
exports.getMessages = async (req, res) => {
  try {
    const { userId, groupId } = req.query;
    
    let query = {};
    if (groupId) {
      query = { groupId };
    } else if (userId) {
      query = {
        $or: [
          { sender: req.user.id, receiver: userId },
          { sender: userId, receiver: req.user.id }
        ],
        groupId: { $exists: false }
      };
    } else {
      return res.status(400).json({ success: false, message: 'Provide userId or groupId' });
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate('sender', 'name profilePicture role')
      .populate({
        path: 'replyTo',
        select: 'content sender isDeleted',
        populate: { path: 'sender', select: 'name' }
      })
      .lean();

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SEND MESSAGE ====================
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, groupId, content, replyTo } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    if (!receiverId && !groupId) {
      return res.status(400).json({ success: false, message: 'Provide receiverId or groupId' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId || undefined,
      groupId: groupId || undefined,
      content,
      replyTo: replyTo || undefined,
      readBy: [req.user.id] // sender has read it
    });

    await newMessage.save();

    await newMessage.populate('sender', 'name profilePicture role');
    if (replyTo) {
      await newMessage.populate({
        path: 'replyTo',
        select: 'content sender isDeleted',
        populate: { path: 'sender', select: 'name' }
      });
    }

    // Emit via Socket.io
    try {
      const io = getIO();
      if (groupId) {
        io.to(groupId).emit('newMessage', newMessage);
      } else {
        io.to(receiverId).emit('newMessage', newMessage);
        io.to(req.user.id).emit('newMessage', newMessage); // emit to self
      }
    } catch (err) {
      console.error('Socket emit failed:', err.message);
    }

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MARK AS READ ====================
exports.markAsRead = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    let query = {
      readBy: { $ne: req.user.id }
    };

    if (groupId) {
      query.groupId = groupId;
    } else if (userId) {
      query.sender = userId;
      query.receiver = req.user.id;
      query.groupId = { $exists: false };
    } else {
      return res.status(400).json({ success: false, message: 'Provide userId or groupId' });
    }

    await Message.updateMany(query, {
      $addToSet: { readBy: req.user.id }
    });

    try {
      const io = getIO();
      if (groupId) {
        io.to(groupId).emit('messageRead', { groupId, readBy: req.user.id });
      } else if (userId) {
        io.to(userId).emit('messageRead', { userId: req.user.id, readBy: req.user.id });
      }
    } catch (err) {
      console.error('Socket emit failed:', err.message);
    }

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE MESSAGE ====================
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }

    message.isDeleted = true;
    message.content = "This message was deleted";
    await message.save();

    // Emit socket event to update clients
    try {
      const io = getIO();
      if (message.groupId) {
        io.to(message.groupId).emit('messageDeleted', { messageId });
      } else {
        if (message.receiver) {
          io.to(message.receiver.toString()).emit('messageDeleted', { messageId });
        }
        io.to(req.user.id).emit('messageDeleted', { messageId });
      }
    } catch (err) {
      console.error('Socket emit failed:', err.message);
    }

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('deleteMessage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE DIRECT CONVERSATION ====================
exports.deleteConversation = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const userId = req.user.id;

    // Hard delete all direct messages between these two users
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ],
      groupId: { $exists: false }
    });

    res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

// ==================== DELETE GROUP CONVERSATION ====================
exports.deleteGroupConversation = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role === 'student') {
      return res.status(403).json({ success: false, message: 'Students cannot delete group chats' });
    }

    // Hard delete all messages in the group
    await Message.deleteMany({ groupId });

    res.status(200).json({ success: true, message: 'Group conversation deleted successfully' });
  } catch (error) {
    console.error('Delete group conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete group conversation' });
  }
};
