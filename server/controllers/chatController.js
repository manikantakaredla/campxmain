const Message = require('../models/Message');
const User = require('../models/User');
const { resolveClassFaculty, resolveProctorFaculty } = require('../utils/assignmentResolver');
const ClassSectionAssignment = require('../models/ClassSectionAssignment');
const SubjectSectionAssignment = require('../models/SubjectSectionAssignment');
const notificationService = require('../services/notificationService');
const { getIO } = require('../config/socket');
const mongoose = require('mongoose');

const getShortBranch = (str) => {
  if (!str) return "UNKNOWN";
  const s = str.toUpperCase();
  if (s.includes('COMPUTER SCIENCE') || s.includes('CSE')) return 'CSE';
  if (s.includes('ELECTRONIC') || s.includes('ECE')) return 'ECE';
  if (s.includes('ELECTRICAL') || s.includes('EEE')) return 'EEE';
  if (s.includes('MECHANICAL') || s.includes('MECH')) return 'MECH';
  if (s.includes('CIVIL')) return 'CIVIL';
  if (s.includes('INFORMATION') || s.includes('IT')) return 'IT';
  if (s.includes('ARTIFICIAL') || s.includes('AIML') || s.includes('AI & ML')) return 'AIML';
  if (s.includes('DATA SCIENCE') || s.includes('DS')) return 'DS';
  if (s.includes('AGRICULTUR') || s.includes('AGRI')) return 'AGRI';
  if (s.includes('MINING')) return 'MINING';
  if (s.includes('PETROLEUM') || s.includes('PETRO')) return 'PETRO';
  return str.split(' ')[0].toUpperCase();
};

const resolveGroupUsers = async (groupId) => {
  let targetUsers = [];
  try {
    if (groupId.startsWith('class_')) {
      const parts = groupId.split('_');
      if (parts.length === 4) {
        const dept = parts[1];
        const year = parseInt(parts[2]);
        const sec = parts[3];
        targetUsers = await User.find({ 
          role: 'student', 
          currentYear: year,
          section: sec,
          isActive: true 
        }).select('_id branch');
        
        targetUsers = targetUsers.filter(u => getShortBranch(u.branch) === dept);
      }
    } else if (groupId.startsWith('subjectGroup_')) {
      const parts = groupId.split('_');
      if (parts.length === 4) {
        const facId = parts[1];
        const subId = parts[2];
        const yr = parseInt(parts[3]);
        
        const assignments = await SubjectSectionAssignment.find({
          facultyId: facId,
          subjectId: subId,
          year: yr,
          isActive: true
        });
        
        const validDepts = [...new Set(assignments.map(a => a.department.toUpperCase()))];
        const validSecs = [...new Set(assignments.map(a => a.section.toUpperCase()))];
        
        targetUsers = await User.find({
          role: 'student',
          currentYear: yr,
          isActive: true
        }).select('_id branch section');
        
        targetUsers = targetUsers.filter(u => {
           const uBranch = getShortBranch(u.branch).toUpperCase();
           return validDepts.some(d => getShortBranch(d).toUpperCase() === uBranch) && validSecs.includes(u.section.toUpperCase());
        });
      }
    } else if (groupId.startsWith('proctor_')) {
      const facultyId = groupId.replace('proctor_', '');
      const ProctorStudentAssignment = require('../models/ProctorStudentAssignment');
      const assignments = await ProctorStudentAssignment.find({ facultyId }).select('studentId');
      targetUsers = assignments.map(a => a.studentId).filter(s => s);
    }
    
    const uniqueIds = [...new Set(targetUsers.map(u => (u._id || u).toString()))];
    return uniqueIds;
  } catch (err) {
    console.error("Error resolving group users:", err);
    return [];
  }
};

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
      .select('name profilePicture role department branch rollNumber')
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
             rollNumber: info.rollNumber,
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
             rollNumber: info.rollNumber,
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
        const branch = getShortBranch(user.branch);
        groups.push({
          _id: `class_${branch}_${user.currentYear}_${user.section}`,
          name: `Class Group (${branch} - ${user.currentYear} Yr - Sec ${user.section})`,
          type: 'class'
        });
        
        // Add Subject Groups
        const studentSubjectAssignments = await SubjectSectionAssignment.find({
          department: new RegExp(branch, 'i'), 
          year: user.currentYear, 
          section: user.section, 
          isActive: true
        }).populate('subjectId facultyId');
        
        studentSubjectAssignments.forEach(sa => {
          if (sa.subjectId && sa.facultyId) {
            const id = `subjectGroup_${sa.facultyId._id}_${sa.subjectId._id}_${sa.year}`;
            if (!groups.find(g => g._id === id)) {
              groups.push({
                _id: id,
                name: `${sa.year} Yr ${sa.subjectId.name} (${sa.facultyId.name})`,
                type: 'class'
              });
            }
          }
        });
      }
      if (proctorResult?.faculty) {
        groups.push({
          _id: `proctor_${proctorResult.faculty._id}`,
          name: `Proctor Group (${proctorResult.faculty.name})`,
          type: 'proctor'
        });
      }

    } else if (['faculty', 'hod', 'dean', 'principal'].includes(user.role)) {
      // Add Groups for Faculty
      const classAssignments = await ClassSectionAssignment.find({ facultyId: user._id, isActive: true });
      classAssignments.forEach(ca => {
        const dept = getShortBranch(ca.department);
        groups.push({
          _id: `class_${dept}_${ca.year}_${ca.section}`,
          name: `Class Group (${dept} - ${ca.year} Yr - Sec ${ca.section})`,
          type: 'class'
        });
      });

      const subjectAssignments = await SubjectSectionAssignment.find({ facultyId: user._id, isActive: true }).populate('subjectId');
      subjectAssignments.forEach(sa => {
        if (sa.subjectId) {
          const id = `subjectGroup_${user._id}_${sa.subjectId._id}_${sa.year}`;
          if (!groups.find(g => g._id === id)) {
            groups.push({
              _id: id,
              name: `${sa.year} Yr ${sa.subjectId.name}`,
              type: 'class'
            });
          }
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
      .populate('sender', 'name profilePicture role rollNumber')
      .populate({
        path: 'replyTo',
        select: 'content sender isDeleted',
        populate: { path: 'sender', select: 'name rollNumber' }
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
    const { receiverId, groupId, content, replyTo, isPoll, pollQuestion, pollOptions } = req.body;
    
    if (!content && !isPoll) {
      return res.status(400).json({ success: false, message: 'Message content or poll is required' });
    }

    if (!receiverId && !groupId) {
      return res.status(400).json({ success: false, message: 'Provide receiverId or groupId' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId || undefined,
      groupId: groupId || undefined,
      content: content || "Poll",
      replyTo: replyTo || undefined,
      readBy: [req.user.id], // sender has read it
      isPoll: isPoll || false,
      pollQuestion: pollQuestion || undefined,
      pollOptions: pollOptions || []
    });

    await newMessage.save();

    await newMessage.populate('sender', 'name profilePicture role rollNumber');
    if (replyTo) {
      await newMessage.populate({
        path: 'replyTo',
        select: 'content sender isDeleted',
        populate: { path: 'sender', select: 'name rollNumber' }
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

    // Create Notification
    try {
      if (receiverId) {
        await notificationService.createNotification({
          title: `New Message`,
          message: `You have a new message from ${req.user.name}`,
          type: 'message',
          category: 'message',
          relatedId: req.user.id, // the sender, so clicking redirects to chat with sender
          targetUsers: [receiverId],
          createdBy: req.user.id
        });
      } else if (groupId) {
        const targetIds = await resolveGroupUsers(groupId);
        // Remove sender from notification recipients
        const recipients = targetIds.filter(id => id.toString() !== req.user.id.toString());
        
        if (recipients.length > 0) {
          let groupName = "your group";
          if (groupId.startsWith('class_')) groupName = "your class";
          else if (groupId.startsWith('subjectGroup_')) groupName = "your subject group";
          else if (groupId.startsWith('proctor_')) groupName = "your proctor group";

          await notificationService.createNotification({
            title: `New Message in ${groupName}`,
            message: `${req.user.name}: ${content ? content.substring(0, 100) : 'Sent a poll'}`,
            type: 'message',
            category: 'message',
            relatedId: groupId, 
            targetUsers: recipients,
            createdBy: req.user.id
          });
        }
      }
    } catch (err) {
      console.error('Failed to create notification for message:', err);
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

// ==================== GLOBAL SOCKET ROOM HELPER ====================
exports.getUserGroupIds = async (userId) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return [];
    
    const groupIds = [];
    if (user.role === 'student') {
      if (user.branch && user.currentYear && user.section) {
         const branch = getShortBranch(user.branch);
         groupIds.push(`class_${branch}_${user.currentYear}_${user.section}`);
         
         const sa = await SubjectSectionAssignment.find({
            department: new RegExp(branch, 'i'),
            year: user.currentYear,
            section: user.section,
            isActive: true
         });
         sa.forEach(a => groupIds.push(`subjectGroup_${a.facultyId}_${a.subjectId}_${a.year}`));
      }
      const proctorResult = await resolveProctorFaculty(user);
      if (proctorResult?.faculty) groupIds.push(`proctor_${proctorResult.faculty._id}`);
    } else if (['faculty', 'hod', 'dean', 'principal'].includes(user.role)) {
      const classAssignments = await ClassSectionAssignment.find({ facultyId: user._id, isActive: true });
      classAssignments.forEach(ca => groupIds.push(`class_${getShortBranch(ca.department)}_${ca.year}_${ca.section}`));
      
      const subjectAssignments = await SubjectSectionAssignment.find({ facultyId: user._id, isActive: true });
      subjectAssignments.forEach(sa => {
         groupIds.push(`subjectGroup_${user._id}_${sa.subjectId}_${sa.year}`);
      });
      
      groupIds.push(`proctor_${user._id}`);
    }
    return [...new Set(groupIds)];
  } catch (err) {
    console.error('Error getting user group ids:', err);
    return [];
  }
};

// ==================== VOTE ON POLL ====================
exports.votePoll = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message || !message.isPoll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (optionIndex < 0 || optionIndex >= message.pollOptions.length) {
      return res.status(400).json({ success: false, message: 'Invalid option index' });
    }

    // Remove user's previous vote from all options
    message.pollOptions.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId.toString());
    });

    // Add vote to the new option
    message.pollOptions[optionIndex].votes.push(userId);

    await message.save();
    
    await message.populate('sender', 'name profilePicture role rollNumber');
    if (message.replyTo) {
      await message.populate({
        path: 'replyTo',
        select: 'content sender isDeleted',
        populate: { path: 'sender', select: 'name rollNumber' }
      });
    }

    // Emit socket event to update clients with the new poll state
    try {
      const io = getIO();
      if (message.groupId) {
        io.to(message.groupId).emit('messageUpdated', message);
      } else {
        if (message.receiver) {
          io.to(message.receiver.toString()).emit('messageUpdated', message);
        }
        io.to(userId).emit('messageUpdated', message);
      }
    } catch (err) {
      console.error('Socket emit failed:', err.message);
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error('votePoll error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET POLL STATS ====================
exports.getPollStats = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findById(messageId).populate('pollOptions.votes', 'name profilePicture rollNumber email');
    
    if (!message || !message.isPoll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Collect all users who have voted
    let votedUsers = [];
    message.pollOptions.forEach(opt => {
      opt.votes.forEach(v => {
        votedUsers.push(v);
      });
    });

    // Resolve users in the group to find pending
    let targetUsers = [];
    if (message.groupId) {
      if (message.groupId.startsWith('class_')) {
        // e.g., class_CSE_2_A
        const parts = message.groupId.split('_');
        if (parts.length === 4) {
          const dept = parts[1];
          const year = parseInt(parts[2]);
          const sec = parts[3];
          targetUsers = await User.find({ 
            role: 'student', 
            currentYear: year,
            section: sec,
            isActive: true 
          }).select('_id name profilePicture rollNumber email');
          
          // Basic branch matching
          targetUsers = targetUsers.filter(u => getShortBranch(u.branch) === dept);
        }
      } else if (message.groupId.startsWith('subjectGroup_')) {
        // subjectGroup_facultyId_subjectId_year
        const parts = message.groupId.split('_');
        if (parts.length === 4) {
          const facId = parts[1];
          const subId = parts[2];
          const yr = parseInt(parts[3]);
          
          const assignments = await SubjectSectionAssignment.find({
            facultyId: facId,
            subjectId: subId,
            year: yr,
            isActive: true
          });
          
          const validDepts = [...new Set(assignments.map(a => a.department.toUpperCase()))];
          const validSecs = [...new Set(assignments.map(a => a.section.toUpperCase()))];
          
          targetUsers = await User.find({
            role: 'student',
            currentYear: yr,
            isActive: true
          }).select('_id name profilePicture rollNumber email branch section');
          
          targetUsers = targetUsers.filter(u => {
             const uBranch = getShortBranch(u.branch).toUpperCase();
             return validDepts.some(d => getShortBranch(d).toUpperCase() === uBranch) && validSecs.includes(u.section.toUpperCase());
          });
        }
      } else if (message.groupId.startsWith('proctor_')) {
        const facultyId = message.groupId.replace('proctor_', '');
        const ProctorStudentAssignment = require('../models/ProctorStudentAssignment');
        const assignments = await ProctorStudentAssignment.find({ facultyId }).populate('studentId', 'name profilePicture rollNumber email');
        targetUsers = assignments.map(a => a.studentId).filter(s => s);
      }
    }

    const votedIds = votedUsers.map(u => u._id.toString());
    const uniqueTargetUsers = [];
    const seenMap = new Map();
    for (const u of targetUsers) {
      if (u && !seenMap.has(u._id.toString())) {
        seenMap.set(u._id.toString(), true);
        uniqueTargetUsers.push(u);
      }
    }

    const pendingUsers = uniqueTargetUsers.filter(u => !votedIds.includes(u._id.toString()));

    res.status(200).json({
      success: true,
      data: {
        message,
        votedUsers,
        pendingUsers
      }
    });
  } catch (error) {
    console.error('getPollStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

