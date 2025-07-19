// Usage: node server/scripts/deduplicateChatParticipants.js

const mongoose = require('mongoose');
const ChatRoom = require('../models/ChatRoom');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/campusshield'); // Use your actual connection string
    const rooms = await ChatRoom.find();
    let updatedCount = 0;
    for (const room of rooms) {
      const originalLength = room.participants.length;
      room.participants = Array.from(new Set(room.participants));
      if (room.participants.length !== originalLength) {
        await room.save();
        updatedCount++;
        console.log(`Deduplicated participants for room ${room._id}`);
      }
    }
    console.log(`Done. Updated ${updatedCount} chat rooms.`);
    process.exit(0);
  } catch (err) {
    console.error('Error deduplicating chat room participants:', err);
    process.exit(1);
  }
})(); 