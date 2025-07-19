const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const router = express.Router();

// @route   POST /api/chat/room
// @desc    Create or join a chat room
// @access  Private
router.post('/room', auth, async (req, res) => {
  try {
    const { reportId } = req.body;
    if (!reportId) {
      return res.status(400).json({ success: false, message: 'reportId is required' });
    }
    let room = await ChatRoom.findOne({ reportId });
    if (!room) {
      room = await ChatRoom.create({ reportId, participants: [req.user.userId] });
    } else if (!room.participants.includes(req.user.userId)) {
      room.participants.push(req.user.userId);
      // Deduplicate participants
      room.participants = Array.from(new Set(room.participants));
      await room.save();
    }
    res.json({ success: true, room });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ success: false, message: 'Server error creating chat room' });
  }
});

// @route   GET /api/chat/room/:roomId/messages
// @desc    Get chat messages
// @access  Private
router.get('/room/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const user = req.user;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }
    if (!room.participants.includes(user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const messages = await Message.find({ roomId: room._id }).sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/chat/room/:roomId/message
// @desc    Send a message
// @access  Private
router.post('/room/:roomId/message', auth, [
  body('message').isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { roomId } = req.params;
    const { message } = req.body;
    const user = req.user;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }
    if (!room.participants.includes(user.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    // Check if the associated report is resolved or closed
    const report = await Report.findOne({ id: room.reportId });
    if (report && (report.status === 'resolved' || report.status === 'closed')) {
      return res.status(403).json({ success: false, message: 'Chat is closed for this report.' });
    }
    console.log('Saving message:', {
      roomId: room._id,
      senderId: user.userId,
      senderRole: user.role,
      message,
      isAnonymous: user.isAnonymous || true
    });
    const newMessage = await Message.create({
      roomId: room._id,
      senderId: user.userId,
      senderRole: user.role,
      message,
      isAnonymous: user.isAnonymous || true
    });
    console.log('Saved message:', newMessage);
    // Notify other participants (except sender)
    const senderId = String(user.userId);
    const recipientIds = room.participants.filter(pid => String(pid) !== senderId);
    if (recipientIds.length > 0) {
      for (const recipientId of recipientIds) {
        await Notification.create({
          recipient: recipientId,
          type: 'chat',
          message: `New message from ${user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderator' : 'User'}: ${message.substring(0, 100)}`,
          link: `/chat?roomId=${room._id}`
        });
      }
    }
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/chat/rooms
// @desc    Get user's chat rooms
// @access  Private
router.get('/rooms', auth, async (req, res) => {
  try {
    const user = req.user;
    const rooms = await ChatRoom.find({ participants: user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 