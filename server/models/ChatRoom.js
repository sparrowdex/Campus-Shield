const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  participants: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema); 