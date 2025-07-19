const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ timestamp: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Create a new notification
router.post('/', auth, async (req, res) => {
  try {
    const { type, message, link } = req.body;
    const notification = await Notification.create({
      recipient: req.user.userId,
      type,
      message,
      link
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// Mark a notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

module.exports = router; 