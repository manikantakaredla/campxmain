const Message = require('../models/Message');
const User = require('../models/User');
const { resolveClassFaculty, resolveProctorFaculty } = require('../utils/assignmentResolver');
const ClassSectionAssignment = require('../models/ClassSectionAssignment');
const SubjectSectionAssignment = require('../models/SubjectSectionAssignment');

// ==================== GET CONVERSATIONS ====================
exports.getConversations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Fetch Users from past messages (Direct Messages)
    const messages = await Message.find({
      $or: [{ sender: user._id }, { receiver: user._id }],
      groupId: { $exists: false }
    }).sort({ createdAt: -1 }).populate('sender receiver', 'name profilePicture role department branch currentYear section');

    const directUsersMap = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === user._id.toString() ? msg.receiver : msg.sender;
      if (otherUser && !directUsersMap.has(otherUser._id.toString())) {
        directUsersMap.set(otherUser._id.toString(), {
          _id: otherUser._id,
          name: otherUser.name,
          profilePicture: otherUser.profilePicture,
          role: otherUser.role,
          department: otherUser.department || otherUser.branch,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0 // Will calculate below
        });
      }
    });

    // 2. Fetch Unread Counts for Direct Messages
    const unreadMsgs = await Message.find({
      receiver: user._id,
      groupId: { $exists: false },
      readBy: { $ne: user._id }
    });
    
    unreadMsgs.forEach(msg => {
      const senderId = msg.sender.toString();
      if (directUsersMap.has(senderId)) {
        directUsersMap.get(senderId).unreadCount += 1;
      }
    });

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
            ...classResult.faculty,
            label: 'Class Teacher'
          });
        }
      }
      if (proctorResult?.faculty) {
        if (!directUsersMap.has(proctorResult.faculty._id.toString())) {
          defaultContacts.push({
            ...proctorResult.faculty,
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

    // Prepare group unread counts & last message
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const lastMsg = await Message.findOne({ groupId: g._id }).sort({ createdAt: -1 });
      if (lastMsg) {
        g.lastMessage = lastMsg.content;
        g.lastMessageTime = lastMsg.createdAt;
      }
      
      const unreadCount = await Message.countDocuments({ 
        groupId: g._id, 
        sender: { $ne: user._id }, 
        readBy: { $ne: user._id } 
      });
      g.unreadCount = unreadCount;
    }

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
    const { receiverId, groupId, content } = req.body;
    
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
      readBy: [req.user.id] // sender has read it
    });

    await newMessage.save();

    await newMessage.populate('sender', 'name profilePicture role');

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

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
