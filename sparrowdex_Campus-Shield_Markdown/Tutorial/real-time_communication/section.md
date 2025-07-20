# Real-time Communication

# Real-time Communication Tutorial for CampusShield

This tutorial will guide you through implementing real-time communication features in the CampusShield project. We'll focus on setting up Socket.IO for real-time messaging and notifications.

<artifact ArtifactUUID="b2cb79f8-050f-4274-b831-0b9a591fa4e7">Socket.IO Setup</artifact>

1. Install Socket.IO in the server:

```bash
npm install socket.io
```

2. Initialize Socket.IO in `server/index.js`:

```javascript
const socketIo = require('socket.io');
const { initializeSocket } = require('./services/socketService');

// After creating the HTTP server:
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

initializeSocket(io);
```

<artifact ArtifactUUID="8e2e96af-4dbe-4693-b0b5-c2bb34999ca1">Authentication Middleware</artifact>

In `server/services/socketService.js`, implement authentication middleware:

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

  // ... rest of the socket initialization
}
```

<artifact ArtifactUUID="7f965778-6b50-4a11-8d07-987b9fa66442">Real-time Chat Implementation</artifact>

1. Create a ChatRoom model in `server/models/ChatRoom.js`:

```javascript
const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
```

2. Create a Message model in `server/models/Message.js`:

```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
```

3. Implement chat functionality in `server/services/socketService.js`:

```javascript
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.anonymousId}`);

  socket.join(`user_${socket.user.userId}`);

  if (socket.user.role === 'admin') {
    socket.join('admin_room');
  }

  socket.on('join_chat_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.anonymousId} joined room: ${roomId}`);
  });

  socket.on('leave_chat_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.user.anonymousId} left room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    const { roomId, message } = data;
    
    io.to(roomId).emit('new_message', {
      id: Date.now().toString(),
      senderId: socket.user.userId,
      senderRole: socket.user.role,
      message,
      timestamp: new Date(),
      isAnonymous: socket.user.isAnonymous
    });

    if (socket.user.role === 'user') {
      io.to('admin_room').emit('user_message', {
        roomId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        timestamp: new Date()
      });
    }
  });

  // ... other event handlers
});
```

<artifact ArtifactUUID="5f1a44ce-6970-4661-9c75-ae15b495a0be">Client-side Integration</artifact>

In `client/src/pages/Chat.tsx`, implement the client-side Socket.IO connection:

```typescript
import { io, Socket } from 'socket.io-client';

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket && newMessage.trim() && selectedRoom) {
      socket.emit('send_message', {
        roomId: selectedRoom,
        message: newMessage
      });
      setNewMessage('');
    }
  };

  // ... rest of the component
};
```

<artifact>Notifications</artifact>

1. Create a Notification model in `server/models/Notification.js`:

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
```

2. Implement notification creation in `server/routes/notifications.js`:

```javascript
const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { type, message } = req.body;
    const notification = new Notification({
      userId: req.user.userId,
      type,
      message
    });
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ... other notification routes

module.exports = router;
```

3. Implement real-time notifications in `server/services/socketService.js`:

```javascript
socket.on('report_status_update', (data) => {
  const { reportId, status, message } = data;
  
  io.to(`user_${socket.user.userId}`).emit('report_updated', {
    reportId,
    status,
    message,
    timestamp: new Date()
  });
});
```

4. Create a NotificationContext in `client/src/contexts/NotificationContext.tsx`:

```typescript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification: Notification) => {
        setNotifications(prev => [...prev, notification]);
      });
    }
  }, [socket]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
```

This comprehensive tutorial covers the implementation of real-time communication features in the CampusShield project, including Socket.IO setup, authentication, chat functionality, and notifications. The code snippets provided are based on the existing project structure and can be integrated into the respective files.
## References:

<document-code-reference tutorial-step="real-time-communication">
{"files": [
  {
    "name": "Campus-Shield/server/index.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server"
  },
  {
    "name": "Campus-Shield/client/src/index.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/index.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src"
  }
]}
</document-code-reference>
### Code:
<code-reference uuid='d6f5ad1a-ae0b-480a-b15d-e05b5c203f3d'>[{"file_name": "Campus-Shield/server/index.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js", "markdown_link": "- [Campus-Shield/server/index.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js)\n", "code_chunk": "const express = require('express');\nconst http = require('http');\nconst socketIo = require('socket.io');\nconst cors = require('cors');\nconst helmet = require('helmet');\nconst compression = require('compression');\nconst morgan = require('morgan');\nconst rateLimit = require('express-rate-limit');\nconst path = require('path');\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\n\n// Debug environment variables\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nconst connectDB = require('./config/database');\nconst authRoutes = require('./routes/auth');\nconst reportRoutes = require('./routes/reports');\nconst chatRoutes = require('./routes/chat');\nconst adminRoutes = require('./routes/admin');\nconst notificationsRoutes = require('./routes/notifications');\nconst { initializeSocket } = require('./services/socketService');\nconst { errorHandler } = require('./middleware/errorHandler');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server, {\n  cors: {\n    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",\n    methods: [\"GET\", \"POST\"]\n  }\n});\n\n// Connect to MongoDB (non-blocking)\nconnectDB().catch(err => {\n  console.error('Failed to connect to database:', err);\n  // Don't exit the process, let it continue\n});\n\n// Initialize Socket.io\ninitializeSocket(io);\n\n// Security middleware\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      scriptSrc: [\"'self'\"],\n      imgSrc: [\"'self'\", \"[REMOVED_DATA_URI]\n      connectSrc: [\"'self'\", \"ws:\", \"wss:\"]\n    }\n  }\n}));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes\n  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,\n  message: 'Too many requests from this IP, please try again later.',\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use('/api/', limiter);\n\n// Middleware\napp.use(compression());\napp.use(morgan('combined'));\n// Apply CORS globally before all routes\nconst allowedOrigins = process.env.CORS_ORIGIN\n  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())\n  : [\"http://localhost:3000\"];\nconsole.log('Allowed CORS origins:', allowedOrigins);\n\napp.use(cors({\n  origin: function(origin, callback) {\n    if (!origin) return callback(null, true);\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    return callback(new Error('Not allowed by CORS'));\n  },\n  credentials: true\n}));\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true, limit: '10mb' }));\n\n// Serve uploaded files\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  const health = {\n    status: 'OK',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n    environment: process.env.NODE_ENV || 'development',\n    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'\n  };\n  \n  res.status(200).json(health);\n});\n\n// API Routes\napp.use('/api/auth', authRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/chat', chatRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/notifications', notificationsRoutes);\n\n// Error handling middleware\napp.use(errorHandler);\n\n// 404 handler\napp.use('*', (req, res) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n});\n\nconst PORT = process.env.PORT || 5000;"}, {"file_name": "Campus-Shield/SETUP_GUIDE.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md", "markdown_link": "- [Campus-Shield/SETUP_GUIDE.md](https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md)\n", "code_chunk": "# \ud83d\udee1\ufe0f CampusShield Setup Guide for Beginners\n\n## \ud83d\udccb Table of Contents\n1. [What is CampusShield?](#what-is-campusshield)\n2. [Cloning from GitHub](#cloning-from-github)\n3. [Prerequisites](#prerequisites)\n4. [Installation Steps](#installation-steps)\n5. [Running the Application](#running-the-application)\n6. [Understanding the Project Structure](#understanding-the-project-structure)\n7. [Common Issues & Solutions](#common-issues--solutions)\n8. [Development Workflow](#development-workflow)\n9. [Testing the Features](#testing-the-features)\n10. [Contributing](#contributing)\n\n---\n\n## \ud83c\udfaf What is CampusShield?\n\nCampusShield is a **privacy-first campus safety platform** that allows students to:\n- **Report incidents anonymously** with location tracking\n- **Chat securely** with campus authorities\n- **Track report status** and updates\n- **View safety analytics** and heatmaps\n\n---\n\n## \ud83d\ude80 Cloning from GitHub\n\nIf you are starting from the GitHub repository:\n```bash\ngit clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd CampusShield\n```\n\n---\n\n## \ud83d\udccb Prerequisites\n\nBefore you start, make sure you have these installed:\n\n### **Required Software:**\n- \u2705 **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)\n- \u2705 **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)\n- \u2705 **Git** (optional) - [Download here](https://git-scm.com/)\n\n### **How to Check if Installed:**\nOpen Command Prompt and type:\n```bash\nnode --version\nnpm --version\nmongod --version\n```\n\n---\n\n## \ud83d\ude80 Installation Steps\n\n### **Step 1: Download the Project**\n1. **Download** the CampusShield project files (or clone from GitHub)\n2. **Extract** to a folder (e.g., `C:\\CampusShield`)\n3. **Open Command Prompt** in that folder\n\n### **Step 2: Install Dependencies**\n```bash\n# Install backend dependencies\ncd server\nnpm install\n\n# Install frontend dependencies\ncd ../client\nnpm install\n```\n\n### **Step 3: Set Up MongoDB**\n1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)\n2. **Install with default settings** (Complete installation)\n3. **MongoDB will run as a Windows Service** (starts automatically)\n\n### **Step 4: Create Environment File**\n1. **Navigate to server folder**: `cd server`\n2. **Copy `.env.example` to `.env`**:\n   ```bash\n   copy .env.example .env\n   # Or manually create .env and copy the contents from .env.example\n   ```\n3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)\n\n### **Step 5: (Optional) Seed Admin/Moderator Accounts**\nIf you want demo admin/moderator accounts, run:\n```bash\ncd server\nnode seedAdmins.js\n```\n\n---\n\n## \ud83c\udfc3\u200d\u2642\ufe0f Running the Application\n\n### **You Need 2 Command Prompt Windows:**\n\n#### **Window 1: Backend Server**\n```bash\ncd server\nnpm run dev\n```\n**Expected Output:**\n```\n\ud83d\udce6 MongoDB Connected: localhost\n\ud83d\ude80 CampusShield server running on port 5000\n\ud83d\udcca Health check: http://localhost:5000/health\n\ud83d\udd12 Environment: development\n```\n\n#### **Window 2: Frontend Server**\n```bash\ncd client\nnpm start\n```\n**Expected Output:**\n```\nCompiled successfully!\n\nYou can now view campus-shield in the browser.\n\n  Local:            http://localhost:3000\n  On Your Network:  http://192.168.x.x:3000\n```\n\n### **Access the Application:**\n- **Frontend**: http://localhost:3000\n- **Backend API**: http://localhost:5000\n- **Health Check**: http://localhost:5000/health\n\n---\n\n## \ud83d\udcf1 Mobile Responsiveness\nCampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.\n\n---\n\n## \ud83d\udcc1 Understanding the Project Structure"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "{/* CTA Section */}\n      <section className=\"bg-primary-600 text-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">\n          <h2 className=\"text-3xl md:text-4xl font-bold mb-4\">\n            Ready to Make Campus Safer?\n          </h2>\n          <p className=\"text-xl text-primary-100 mb-8 max-w-2xl mx-auto\">\n            Join thousands of students who are already using CampusShield to report \n            safety concerns and stay informed.\n          </p>\n          {user ? (\n            <>\n              {user?.role === 'user' && (\n                <Link to=\"/report\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                  Report an Incident\n                </Link>\n              )}\n              {user?.role === 'admin' && (\n                <>\n                  <Link to=\"/admin\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Dashboard\n                  </Link>\n                  <Link to=\"/chat\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Chat\n                  </Link>\n                </>\n              )}\n              {user?.role === 'moderator' && (\n                <>\n                  <Link to=\"/admin/requests\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Requests\n                  </Link>\n                </>\n              )}\n              {!user && (\n                <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n                  <Link to=\"/register\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Get Started Now\n                  </Link>\n                  <Link to=\"/login\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Login\n                  </Link>\n                </div>\n              )}\n            </>\n          ) : (\n            <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n              <Link to=\"/register\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                Get Started Now\n              </Link>\n              <Link to=\"/login\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                Login\n              </Link>\n            </div>\n          )}\n        </div>\n      </section>\n\n      {/* Emergency Notice */}\n      <div className=\"bg-danger-50 border-l-4 border-danger-400 p-4\">\n        <div className=\"flex\">\n          <ExclamationTriangleIcon className=\"h-5 w-5 text-danger-400\" />\n          <div className=\"ml-3\">\n            <p className=\"text-sm text-danger-700\">\n              <strong>Emergency?</strong> If you're in immediate danger, call campus security or 911 immediately. \n              CampusShield is for non-emergency safety reporting.\n            </p>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Home;"}, {"file_name": "Campus-Shield/server/models/Report.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js", "markdown_link": "- [Campus-Shield/server/models/Report.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js)\n", "code_chunk": "const mongoose = require('mongoose');\n\nconst reportSchema = new mongoose.Schema({\n  // Anonymous reporter identification\n  reporterId: {\n    type: String,\n    required: true,\n    index: true\n  },\n  \n  // Report content\n  title: {\n    type: String,\n    required: true,\n    maxlength: 200,\n    trim: true\n  },\n  \n  description: {\n    type: String,\n    required: true,\n    maxlength: 2000,\n    trim: true\n  },\n  \n  // Incident categorization\n  category: {\n    type: String,\n    required: true,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  // AI-generated fields\n  aiCategory: {\n    type: String,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  priority: {\n    type: String,\n    enum: ['low', 'medium', 'high', 'critical'],\n    default: 'medium'\n  },\n  \n  sentiment: {\n    type: String,\n    enum: ['positive', 'neutral', 'negative', 'distressed'],\n    default: 'neutral'\n  },\n  \n  // Location data (generalized for privacy)\n  location: {\n    type: {\n      type: String,\n      enum: ['Point'],\n      default: 'Point'\n    },\n    coordinates: {\n      type: [Number], // [longitude, latitude]\n      required: true,\n      index: '2dsphere'\n    },\n    address: {\n      type: String,\n      maxlength: 200\n    },\n    building: {\n      type: String,\n      maxlength: 100\n    },\n    floor: {\n      type: String,\n      maxlength: 20\n    }\n  },\n  \n  // Timestamp\n  incidentTime: {\n    type: Date,\n    required: true,\n    default: Date.now\n  },\n  \n  // Media attachments\n  attachments: [{\n    filename: String,\n    originalName: String,\n    mimetype: String,\n    size: Number,\n    path: String,\n    uploadedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Report status and handling\n  status: {\n    type: String,\n    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed'],\n    default: 'pending'\n  },\n  \n  assignedTo: {\n    type: mongoose.Schema.Types.ObjectId,\n    ref: 'User'\n  },\n  \n  // Admin notes (private)\n  adminNotes: [{\n    note: String,\n    addedBy: {\n      type: mongoose.Schema.Types.ObjectId,\n      ref: 'User'\n    },\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Public updates for reporter\n  publicUpdates: [{\n    message: String,\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Privacy and data retention\n  isAnonymous: {\n    type: Boolean,\n    default: true\n  },\n  \n  dataRetentionDate: {\n    type: Date,\n    default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years\n  },\n  \n  // Metadata\n  ipAddress: {\n    type: String,\n    required: false // Hashed for privacy\n  },\n  \n  userAgent: {\n    type: String,\n    required: false\n  },\n  \n  createdAt: {\n    type: Date,\n    default: Date.now,\n    index: true\n  },\n  \n  updatedAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Indexes for performance\nreportSchema.index({ createdAt: -1 });\nreportSchema.index({ status: 1, createdAt: -1 });\nreportSchema.index({ category: 1, createdAt: -1 });\nreportSchema.index({ priority: 1, status: 1 });\nreportSchema.index({ 'location.coordinates': '2dsphere' });\nreportSchema.index({ dataRetentionDate: 1 });\n\n// Pre-save middleware\nreportSchema.pre('save', function(next) {\n  this.updatedAt = Date.now();\n  next();\n});\n\n// Method to add admin note\nreportSchema.methods.addAdminNote = function(note, adminId) {\n  this.adminNotes.push({\n    note,\n    addedBy: adminId\n  });\n  return this.save();\n};\n\n// Method to add public update\nreportSchema.methods.addPublicUpdate = function(message) {\n  this.publicUpdates.push({\n    message\n  });\n  return this.save();\n};"}, {"file_name": "Campus-Shield/client/src/pages/Chat.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Chat.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Chat.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Chat.tsx)\n", "code_chunk": "useEffect(() => {\n    if (selectedRoom) {\n      fetchMessages(selectedRoom);\n      // Fetch report status for the selected chat room\n      const room = chatRooms.find(r => r._id === selectedRoom);\n      if (room && room.reportId) {\n        fetch(`${process.env.REACT_APP_API_URL}/api/reports/${room.reportId}`, {\n          headers: {\n            'Authorization': `Bearer ${localStorage.getItem('token')}`\n          }\n        })\n          .then(res => res.json())\n          .then(data => {\n            if (data.success && data.report) {\n              setReportStatus(data.report.status);\n            } else {\n              setReportStatus(null);\n            }\n          })\n          .catch(() => setReportStatus(null));\n      } else {\n        setReportStatus(null);\n      }\n    }\n  }, [selectedRoom, chatRooms]);\n\n  // Mark notifications as read when chat room is opened\n  useEffect(() => {\n    if (selectedRoom) {\n      notifications\n        .filter(n => n.link === `/chat?roomId=${selectedRoom}` && !n.read)\n        .forEach(n => markAsRead(n.id));\n    }\n  }, [selectedRoom, notifications, markAsRead]);\n\n  useEffect(() => {\n    scrollToBottom();\n  }, [messages]);\n\n  const scrollToBottom = () => {\n    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });\n  };\n\n  const fetchChatRooms = async () => {\n    try {\n      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/rooms`, {\n        headers: {\n          'Authorization': `Bearer ${localStorage.getItem('token')}`\n        }\n      });\n\n      if (!response.ok) {\n        throw new Error('Failed to fetch chat rooms');\n      }\n\n      const data = await response.json();\n      setChatRooms(data.rooms || []);\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const fetchMessages = async (roomId: string) => {\n    try {\n      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/room/${roomId}/messages`, {\n        headers: {\n          'Authorization': `Bearer ${localStorage.getItem('token')}`\n        }\n      });\n\n      if (!response.ok) {\n        throw new Error('Failed to fetch messages');\n      }\n\n      const data = await response.json();\n      setMessages(data.messages || []);\n    } catch (err: any) {\n      setError(err.message);\n    }\n  };\n\n  const sendMessage = async () => {\n    if (!newMessage.trim() || !selectedRoom) return;\n    setSending(true);\n    try {\n      // Save message via REST API for persistence\n      await fetch(`${process.env.REACT_APP_API_URL}/api/chat/room/${selectedRoom}/message`, {\n        method: 'POST',\n        headers: {\n          'Authorization': `Bearer ${localStorage.getItem('token')}`,\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify({ message: newMessage })\n      });\n      // Optionally, still emit via Socket.IO for real-time updates\n      socketRef.current?.emit('send_message', {\n        roomId: selectedRoom,\n        message: newMessage\n      });\n      setNewMessage('');\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setSending(false);\n    }\n  };\n\n  const handleKeyPress = (e: React.KeyboardEvent) => {\n    if (e.key === 'Enter' && !e.shiftKey) {\n      e.preventDefault();\n      sendMessage();\n    }\n  };\n\n  const formatTime = (timestamp: string) => {\n    return new Date(timestamp).toLocaleTimeString('en-US', {\n      hour: '2-digit',\n      minute: '2-digit'\n    });\n  };\n\n  const formatDate = (timestamp: string) => {\n    const date = new Date(timestamp);\n    const today = new Date();\n    const yesterday = new Date(today);\n    yesterday.setDate(yesterday.getDate() - 1);\n\n    if (date.toDateString() === today.toDateString()) {\n      return 'Today';\n    } else if (date.toDateString() === yesterday.toDateString()) {\n      return 'Yesterday';\n    } else {\n      return date.toLocaleDateString('en-US', {\n        month: 'short',\n        day: 'numeric'\n      });\n    }\n  };"}, {"file_name": "Campus-Shield/server/services/socketService.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/socketService.js", "markdown_link": "- [Campus-Shield/server/services/socketService.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/socketService.js)\n", "code_chunk": "const jwt = require('jsonwebtoken');\nconst User = require('../models/User');\n\nconst initializeSocket = (io) => {\n  // Authentication middleware\n  io.use(async (socket, next) => {\n    try {\n      const token = socket.handshake.auth.token;\n      \n      if (!token) {\n        return next(new Error('Authentication error'));\n      }\n\n      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');\n      const user = await User.findById(decoded.userId);\n      \n      if (!user || !user.isActive) {\n        return next(new Error('User not found or inactive'));\n      }\n\n      socket.user = {\n        userId: user._id,\n        anonymousId: user.anonymousId,\n        role: user.role,\n        isAnonymous: user.isAnonymous\n      };\n\n      next();\n    } catch (error) {\n      next(new Error('Authentication error'));\n    }\n  });\n\n  io.on('connection', (socket) => {\n    console.log(`User connected: ${socket.user.anonymousId}`);\n\n    // Join user to their personal room\n    socket.join(`user_${socket.user.userId}`);\n\n    // Join admin to admin room if admin\n    if (socket.user.role === 'admin') {\n      socket.join('admin_room');\n    }\n\n    // Join chat room\n    socket.on('join_chat_room', (roomId) => {\n      socket.join(roomId);\n      console.log(`User ${socket.user.anonymousId} joined room: ${roomId}`);\n    });\n\n    // Leave chat room\n    socket.on('leave_chat_room', (roomId) => {\n      socket.leave(roomId);\n      console.log(`User ${socket.user.anonymousId} left room: ${roomId}`);\n    });\n\n    // Send message\n    socket.on('send_message', (data) => {\n      const { roomId, message } = data;\n      \n      // Emit to room\n      io.to(roomId).emit('new_message', {\n        id: Date.now().toString(),\n        senderId: socket.user.userId,\n        senderRole: socket.user.role,\n        message,\n        timestamp: new Date(),\n        isAnonymous: socket.user.isAnonymous\n      });\n\n      // Notify admins if message is from user\n      if (socket.user.role === 'user') {\n        io.to('admin_room').emit('user_message', {\n          roomId,\n          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),\n          timestamp: new Date()\n        });\n      }\n    });\n\n    // Report status updates\n    socket.on('report_status_update', (data) => {\n      const { reportId, status, message } = data;\n      \n      // Notify user about their report update\n      io.to(`user_${socket.user.userId}`).emit('report_updated', {\n        reportId,\n        status,\n        message,\n        timestamp: new Date()\n      });\n    });\n\n    // Location-based alerts\n    socket.on('location_update', (data) => {\n      const { latitude, longitude } = data;\n      \n      // In a real implementation, you would check for nearby incidents\n      // and send alerts to users in high-report areas\n      console.log(`User ${socket.user.anonymousId} location: ${latitude}, ${longitude}`);\n    });\n\n    // Typing indicators\n    socket.on('typing_start', (roomId) => {\n      socket.to(roomId).emit('user_typing', {\n        userId: socket.user.userId,\n        isTyping: true\n      });\n    });\n\n    socket.on('typing_stop', (roomId) => {\n      socket.to(roomId).emit('user_typing', {\n        userId: socket.user.userId,\n        isTyping: false\n      });\n    });\n\n    // Disconnect\n    socket.on('disconnect', () => {\n      console.log(`User disconnected: ${socket.user.anonymousId}`);\n    });\n  });\n\n  // Global error handler\n  io.on('error', (error) => {\n    console.error('Socket.io error:', error);\n  });\n};\n\nmodule.exports = { initializeSocket };"}, {"file_name": "Campus-Shield/README.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/README.md", "markdown_link": "- [Campus-Shield/README.md](https://github.com/sparrowdex/Campus-Shield/blob/main/README.md)\n", "code_chunk": "# CampusShield\n\nCampusShield is a privacy-first campus safety platform for anonymous incident reporting, real-time chat, and admin management. Built for hackathons and real-world impact.\n\n---\n\n## \ud83d\ude80 Features\n\n- **Anonymous Incident Reporting**: Students can report safety incidents without revealing their identity.\n- **Real-time Chat**: Secure, role-based chat between users and campus security/admins.\n- **Role-based Access**: User, Admin, and Moderator roles with custom dashboards and permissions.\n- **Admin Dashboard**: Manage reports, view analytics, assign/resolve cases, and monitor campus safety.\n- **Incident Heatmap**: Visualize incident locations and patterns with Leaflet.js.\n- **AI-Powered Categorization**: Automatic classification and prioritization of reports.\n- **Notifications**: (Pluggable) Real-time in-app notifications for new messages, assignments, and status changes.\n- **Mobile Responsive**: Usable on desktop and mobile devices.\n- **Security & Privacy**: JWT authentication, minimal data collection, and strong privacy defaults.\n\n---\n\n## \ud83d\udee0\ufe0f Tech Stack\n\n- **Frontend**: React, TypeScript, Tailwind CSS\n- **Backend**: Node.js, Express.js\n- **Database**: MongoDB, Mongoose\n- **Real-time**: Socket.IO\n- **Maps**: Leaflet.js\n- **Authentication**: JWT (JSON Web Tokens)\n\n---\n\n## \ud83e\uddd1\u200d\ud83d\udcbb Demo/Test Accounts\n\n- **Admin**  \n  Email: `admin1@example.com`  \n  Password: `adminpassword1`\n\n- **Moderator**  \n  Email: `moderator1@example.com`  \n  Password: `moderatorpassword1`\n\n- **User**  \n  Register a new account or use anonymous login.\n  Email: `user@example.com`\n  Password: `userpassword`\n\n---\n\n## \u26a1 Quick Start\n\n1. **Clone the repo:**\n   ```bash\n   git clone https://github.com/yourusername/campus-shield.git\n   cd campus-shield\n   ```\n2. **Install dependencies:**\n   ```bash\n   cd server && npm install\n   cd ../client && npm install\n   ```\n3. **Set up environment variables:**\n   - Copy `.env.example` to `.env` in both `server/` and `client/` if needed.\n4. **Start MongoDB locally (or use Atlas).**\n5. **Start the backend:**\n   ```bash\n   cd server && npm start\n   ```\n6. **Start the frontend:**\n   ```bash\n   cd ../client && npm start\n   ```\n7. **Open [http://localhost:3000](http://localhost:3000) to view the app.**\n\n---\n\n## \ud83d\udcf1 Mobile & Responsiveness\n- The UI is responsive and works on mobile and desktop.\n- For best results, test in Chrome DevTools mobile view.\n\n---\n\n## \ud83d\udca1 Why We Built This (Impact)\n\n- **Problem:** Students often hesitate to report safety incidents due to privacy concerns and lack of trust.\n- **Solution:** CampusShield enables anonymous, secure reporting and real-time support, empowering students and improving campus safety.\n- **Impact:** More reports, faster admin response, and a safer, more connected campus community.\n\n---\n\n## \ud83d\udce3 Notifications (Pluggable)\n- In-app notification bar for new chat messages, assignments, and status changes (see below for integration instructions).\n- (Optional) Email notifications can be added with Nodemailer.\n\n---\n\n## \ud83d\udcc2 Project Structure\n\n```\n\u251c\u2500\u2500 client/          # React frontend\n\u251c\u2500\u2500 server/          # Node.js backend\n\u251c\u2500\u2500 docs/            # Documentation\n\u2514\u2500\u2500 scripts/         # Utility scripts\n```\n\n---\n\n---\n\n## Setup\n\nFor detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).\n\n---"}, {"file_name": "Campus-Shield/client/src/App.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/App.tsx", "markdown_link": "- [Campus-Shield/client/src/App.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/App.tsx)\n", "code_chunk": "import React from 'react';\nimport { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';\nimport { AuthProvider, useAuth } from './contexts/AuthContext';\nimport Navbar from './components/layout/Navbar';\nimport Home from './pages/Home';\nimport Login from './pages/Login';\nimport Register from './pages/Register';\nimport AdminLogin from './pages/AdminLogin';\nimport RequestAdmin from './pages/RequestAdmin';\nimport AdminRequests from './pages/AdminRequests';\nimport ReportIncident from './pages/ReportIncident';\nimport MyReports from './pages/MyReports';\nimport AdminDashboard from './pages/AdminDashboard';\nimport Chat from './pages/Chat';\nimport LoadingSpinner from './components/common/LoadingSpinner';\nimport ModeratorDashboard from './pages/ModeratorDashboard';\nimport { NotificationProvider } from './contexts/NotificationContext';\nimport NotificationBar from './components/common/NotificationBar';\nimport { ToastContainer } from 'react-toastify';\nimport 'react-toastify/dist/ReactToastify.css';\n\n// Protected Route Component\nconst ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; moderatorOnly?: boolean }> = ({\n  children,\n  adminOnly = false,\n  moderatorOnly = false\n}) => {\n  const { user, loading } = useAuth();\n\n  if (loading) return <LoadingSpinner />;\n  if (!user) return <Navigate to=\"/login\" replace />;\n  if (adminOnly && user.role !== 'admin') return <Navigate to=\"/\" replace />;\n  if (moderatorOnly && user.role !== 'moderator') return <Navigate to=\"/\" replace />;\n  return <>{children}</>;\n};\n\n// Main App Component\nconst AppContent: React.FC = () => {\n  const { user } = useAuth();\n\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <Navbar />\n      <main className=\"container mx-auto px-4 py-8\">\n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/login\" element={!user ? <Login /> : <Navigate to=\"/\" replace />} />\n          <Route path=\"/register\" element={!user ? <Register /> : <Navigate to=\"/\" replace />} />\n          <Route path=\"/admin-login\" element={!user ? <AdminLogin /> : <Navigate to=\"/admin\" replace />} />\n          <Route\n            path=\"/request-admin\"\n            element={\n              <ProtectedRoute>\n                <RequestAdmin />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/report\"\n            element={\n              <ProtectedRoute>\n                <ReportIncident />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/my-reports\"\n            element={\n              <ProtectedRoute>\n                <MyReports />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/chat\"\n            element={\n              <ProtectedRoute>\n                <Chat />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/admin\"\n            element={\n              <ProtectedRoute adminOnly>\n                <AdminDashboard />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/admin/requests\"\n            element={\n              <ProtectedRoute moderatorOnly>\n                <AdminRequests />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/moderator\"\n            element={\n              <ProtectedRoute moderatorOnly>\n                <ModeratorDashboard />\n              </ProtectedRoute>\n            }\n          />\n          <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n        </Routes>\n      </main>\n    </div>\n  );\n};"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// In-memory data store for testing when MongoDB is not available\nclass MemoryStore {\n  constructor() {\n    this.users = new Map();\n    this.reports = new Map();\n    this.chatRooms = new Map();\n    this.messages = new Map();\n    this.adminRequests = new Map();\n    this.nextUserId = 1;\n    this.nextReportId = 1;\n    this.nextRoomId = 1;\n    this.nextMessageId = 1;\n    this.nextRequestId = 1;\n\n    // Initialize with pre-existing admin users\n    this.initializeAdminUsers();\n  }\n\n  initializeAdminUsers() {\n    // Pre-existing admin users - these should be provided by campus IT\n    const adminUsers = [\n      {\n        id: 'admin-001',\n        email: 'admin@campus.edu',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"password\"\n        role: 'admin',\n        anonymousId: 'admin-anon-001',\n        isAnonymous: false,\n        campusId: 'ADMIN001',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-002',\n        email: 'security@campus.edu',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"password\"\n        role: 'admin',\n        anonymousId: 'admin-anon-002',\n        isAnonymous: false,\n        campusId: 'ADMIN002',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-003',\n        email: 'normal@admin.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"admin\" (same hash as \"password\")\n        role: 'admin',\n        anonymousId: 'admin-anon-003',\n        isAnonymous: false,\n        campusId: 'ADMIN003',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-004',\n        email: 'Iapprove@admin.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"approve\" (same hash as \"password\")\n        role: 'moderator',\n        anonymousId: 'moderator-anon-001',\n        isAnonymous: false,\n        campusId: 'MOD001',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'moderator-001',\n        email: 'moderator1@example.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"moderatorpassword1\"\n        role: 'moderator',\n        anonymousId: 'moderator-anon-002',\n        isAnonymous: false,\n        campusId: 'MOD002',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      }\n    ];\n\n    adminUsers.forEach(user => {\n      this.users.set(user.id, user);\n    });\n  }\n\n  // User operations\n  createUser(userData) {\n    const user = {\n      id: this.nextUserId.toString(),\n      ...userData,\n      role: 'user', // Default role is user, not admin\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString()\n    };\n    this.users.set(user.id, user);\n    this.nextUserId++;\n    return user;\n  }\n\n  findUserByEmail(email) {\n    for (const user of this.users.values()) {\n      if (user.email === email) {\n        return user;\n      }\n    }\n    return null;\n  }\n\n  findUserById(id) {\n    return this.users.get(id) || null;\n  }\n\n  updateUser(id, updates) {\n    const user = this.users.get(id);\n    if (user) {\n      Object.assign(user, updates, { updatedAt: new Date().toISOString() });\n      this.users.set(id, user);\n      return user;\n    }\n    return null;\n  }"}, {"file_name": "Campus-Shield/env.example", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/env.example", "markdown_link": "- [Campus-Shield/env.example](https://github.com/sparrowdex/Campus-Shield/blob/main/env.example)\n", "code_chunk": "# CampusShield Environment Configuration\n\n# Server Configuration\nNODE_ENV=development\nPORT=5000\nCORS_ORIGIN=http://localhost:3000\n\n# Database Configuration\nMONGODB_URI=mongodb://localhost:27017/campusshield\n\n# JWT Configuration\nJWT_SECRET=your-super-secret-jwt-key-change-this-in-production\n\n# Rate Limiting\nRATE_LIMIT_WINDOW=900000\nRATE_LIMIT_MAX_REQUESTS=100\n\n# File Upload Configuration\nMAX_FILE_SIZE=10485760\nUPLOAD_PATH=uploads\n\n# Security Configuration\nBCRYPT_ROUNDS=12\n\n# AI/ML Service Configuration (for future integration)\nAI_SERVICE_URL=\nAI_SERVICE_KEY=\n\n# Notification Services (for future integration)\nFIREBASE_PROJECT_ID=\nFIREBASE_PRIVATE_KEY=\nFIREBASE_CLIENT_EMAIL=\n\nTWILIO_ACCOUNT_SID=\nTWILIO_AUTH_TOKEN=\nTWILIO_PHONE_NUMBER=\n\nSENDGRID_API_KEY=\nSENDGRID_FROM_EMAIL=\n\n# Maps Configuration\nGOOGLE_MAPS_API_KEY=\nMAPBOX_ACCESS_TOKEN=\n\n# File Storage (for future integration)\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nAWS_REGION=\nAWS_S3_BUCKET=\n\n# Logging Configuration\nLOG_LEVEL=info\nLOG_FILE=logs/app.log\n\n# Data Retention (in days)\nUSER_DATA_RETENTION_DAYS=365\nREPORT_DATA_RETENTION_DAYS=730"}, {"file_name": "Campus-Shield/server/routes/auth.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js", "markdown_link": "- [Campus-Shield/server/routes/auth.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js)\n", "code_chunk": "const user = memoryStore.createUser(userData);\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.status(201).json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }\n\n  } catch (error) {\n    console.error('Anonymous auth error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error during anonymous authentication'\n    });\n  }\n});\n\n// Enhanced /admin-login route with detailed logging\nrouter.post('/admin-login', [\n  body('email').isEmail().withMessage('Please enter a valid email'),\n  body('password').exists().withMessage('Password is required')\n], async (req, res) => {\n  try {\n    console.log('Admin login attempt:', req.body);\n\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      console.error('Validation errors:', errors.array());\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const { email, password } = req.body;\n\n    if (isMongoConnected()) {\n      const user = await User.findOne({ email });\n      if (!user) {\n        console.error('Admin user not found for email:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (user not found)'\n        });\n      }\n\n      const isMatch = await user.comparePassword(password);\n      if (!isMatch) {\n        console.error('Admin password mismatch for user:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (password mismatch)'\n        });\n      }\n\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        console.error('User does not have admin/moderator role:', email, user.role);\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      const token = generateToken(user._id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user._id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    } else {\n      // Use memory store\n      const user = memoryStore.findUserByEmail(email);\n      if (!user || !user.password) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Check password (with special handling for new admin accounts)\n      let isMatch = false;\n      if (user.email === 'normal@admin.com' && password === 'admin') {\n        isMatch = true;\n      } else if (user.email === 'Iapprove@admin.com' && password === 'approve') {\n        isMatch = true;\n      } else {\n        isMatch = await bcrypt.compare(password, user.password);\n      }\n      \n      if (!isMatch) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Only allow existing admins or moderators to login\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }"}]</code-reference>