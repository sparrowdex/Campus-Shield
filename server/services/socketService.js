const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = {
        userId: user._id,
        anonymousId: user.anonymousId,
        role: user.role,
        isAnonymous: user.isAnonymous
      };

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.anonymousId}`);

    // Join user to their personal room
    socket.join(`user_${socket.user.userId}`);

    // Join admin to admin room if admin
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    // Join chat room
    socket.on('join_chat_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.anonymousId} joined room: ${roomId}`);
    });

    // Leave chat room
    socket.on('leave_chat_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.anonymousId} left room: ${roomId}`);
    });

    // Send message
    socket.on('send_message', (data) => {
      const { roomId, message } = data;
      
      // Emit to room
      io.to(roomId).emit('new_message', {
        id: Date.now().toString(),
        senderId: socket.user.userId,
        senderRole: socket.user.role,
        message,
        timestamp: new Date(),
        isAnonymous: socket.user.isAnonymous
      });

      // Notify admins if message is from user
      if (socket.user.role === 'user') {
        io.to('admin_room').emit('user_message', {
          roomId,
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          timestamp: new Date()
        });
      }
    });

    // Report status updates
    socket.on('report_status_update', (data) => {
      const { reportId, status, message } = data;
      
      // Notify user about their report update
      io.to(`user_${socket.user.userId}`).emit('report_updated', {
        reportId,
        status,
        message,
        timestamp: new Date()
      });
    });

    // Location-based alerts
    socket.on('location_update', (data) => {
      const { latitude, longitude } = data;
      
      // In a real implementation, you would check for nearby incidents
      // and send alerts to users in high-report areas
      console.log(`User ${socket.user.anonymousId} location: ${latitude}, ${longitude}`);
    });

    // Typing indicators
    socket.on('typing_start', (roomId) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (roomId) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user.userId,
        isTyping: false
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.anonymousId}`);
    });
  });

  // Global error handler
  io.on('error', (error) => {
    console.error('Socket.io error:', error);
  });
};

module.exports = { initializeSocket }; 