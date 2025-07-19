const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'admin', 'moderator'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isAnonymous: { type: Boolean, default: true }
});

module.exports = mongoose.model('Message', MessageSchema); 