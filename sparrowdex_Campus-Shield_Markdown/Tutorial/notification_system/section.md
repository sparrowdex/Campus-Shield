# Notification System

# Comprehensive Tutorial: Implementing the Notification System in CampusShield

This tutorial provides a step-by-step guide to implement the Notification System in the CampusShield project. The system allows real-time notifications for users and administrators.

<artifact ArtifactUUID="9634316c-a160-4b20-b159-9bdb253d1668">1. Setting up the Notification Model</artifact>

First, we'll create the Notification model in `server/models/Notification.js`:

```javascript
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['chat', 'status', 'other'], default: 'other' },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
```

<artifact>2. Implementing the Notification Context</artifact>

Create `client/src/contexts/NotificationContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export interface Notification {
  id: string;
  type: 'chat' | 'status' | 'other';
  message: string;
  link?: string;
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`);
      if (res.data.success) {
        setNotifications(
          res.data.notifications.map((n: any) => ({
            id: n._id,
            type: n.type,
            message: n.message,
            link: n.link,
            read: n.read,
            timestamp: n.timestamp,
          }))
        );
      }
    } catch (err) {
      // Handle error
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const addNotification = async (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications`, notif);
      if (res.data.success) {
        const n = res.data.notification;
        const newNotif: Notification = {
          id: n._id,
          type: n.type,
          message: n.message,
          link: n.link,
          read: n.read,
          timestamp: n.timestamp,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        toast.info(newNotif.message, { autoClose: 5000 });
      }
    } catch (err) {
      // Handle error
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      // Handle error
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearNotifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
```

<artifact>3. Creating the Notification API Routes</artifact>

In `server/routes/notifications.js`:

```javascript
const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ timestamp: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

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
```

<artifact>4. Integrating Socket.IO for Real-time Notifications</artifact>

Update `server/services/socketService.js`:

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

    socket.on('report_status_update', (data) => {
      const { reportId, status, message } = data;
      
      io.to(`user_${socket.user.userId}`).emit('report_updated', {
        reportId,
        status,
        message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.anonymousId}`);
    });
  });
};

module.exports = { initializeSocket };
```

<artifact ArtifactUUID="37f4c347-9b70-48d7-9905-77dbfee4a088">5. Implementing the Notification Bar Component</artifact>

Create `client/src/components/common/NotificationBar.tsx`:

```typescript
import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBar: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="notification-bar">
      {unreadNotifications.map(notification => (
        <div key={notification.id} className="notification-item">
          <Link to={notification.link || '#'} onClick={() => markAsRead(notification.id)}>
            {notification.message}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NotificationBar;
```

<artifact>6. Integrating Notifications in the Chat Component</artifact>

Update `client/src/pages/Chat.tsx`:

```typescript
import { useNotifications } from '../contexts/NotificationContext';

// Inside the Chat component
const { notifications, markAsRead } = useNotifications();

useEffect(() => {
  if (selectedRoom) {
    notifications
      .filter(n => n.link === `/chat?roomId=${selectedRoom}` && !n.read)
      .forEach(n => markAsRead(n.id));
  }
}, [selectedRoom, notifications, markAsRead]);
```

<artifact ArtifactUUID="b02da2e3-8066-4974-bb9a-d5f172654b8e">7. Updating the Main App Component</artifact>

Update `client/src/App.tsx`:

```typescript
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationBar from './components/common/NotificationBar';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <NotificationBar />
            <main className="container mx-auto px-4 py-8">
              {/* Routes */}
            </main>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};
```

<artifact ArtifactUUID="aec5a19f-cfae-47be-9341-bb0ab114c7c7">8. Configuring the Server</artifact>

Update `server/index.js`:

```javascript
const notificationsRoutes = require('./routes/notifications');

// Add this line to your middleware setup
app.use('/api/notifications', notificationsRoutes);

// Initialize Socket.io
initializeSocket(io);
```

This comprehensive tutorial covers the implementation of the Notification System in CampusShield. It includes setting up the Notification model, creating the Notification context for state management, implementing API routes for notifications, integrating Socket.IO for real-time updates, creating a NotificationBar component, and updating the Chat component and main App component to use notifications.
## References:

<document-code-reference tutorial-step="notification-system">
{"files": [
  {
    "name": "Campus-Shield/client/src/contexts/NotificationContext.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts/NotificationContext.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts"
  },
  {
    "name": "Campus-Shield/server/routes/notifications.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/notifications.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/client/src/components/common/NotificationBar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/common/NotificationBar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/common"
  },
  {
    "name": "Campus-Shield/server/models/Notification.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Notification.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
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
<code-reference uuid='6561fb10-096b-4c95-afd0-45b847fd72ef'>[{"file_name": "Campus-Shield/server/index.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js", "markdown_link": "- [Campus-Shield/server/index.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js)\n", "code_chunk": "const express = require('express');\nconst http = require('http');\nconst socketIo = require('socket.io');\nconst cors = require('cors');\nconst helmet = require('helmet');\nconst compression = require('compression');\nconst morgan = require('morgan');\nconst rateLimit = require('express-rate-limit');\nconst path = require('path');\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\n\n// Debug environment variables\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nconst connectDB = require('./config/database');\nconst authRoutes = require('./routes/auth');\nconst reportRoutes = require('./routes/reports');\nconst chatRoutes = require('./routes/chat');\nconst adminRoutes = require('./routes/admin');\nconst notificationsRoutes = require('./routes/notifications');\nconst { initializeSocket } = require('./services/socketService');\nconst { errorHandler } = require('./middleware/errorHandler');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server, {\n  cors: {\n    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",\n    methods: [\"GET\", \"POST\"]\n  }\n});\n\n// Connect to MongoDB (non-blocking)\nconnectDB().catch(err => {\n  console.error('Failed to connect to database:', err);\n  // Don't exit the process, let it continue\n});\n\n// Initialize Socket.io\ninitializeSocket(io);\n\n// Security middleware\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      scriptSrc: [\"'self'\"],\n      imgSrc: [\"'self'\", \"[REMOVED_DATA_URI]\n      connectSrc: [\"'self'\", \"ws:\", \"wss:\"]\n    }\n  }\n}));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes\n  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,\n  message: 'Too many requests from this IP, please try again later.',\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use('/api/', limiter);\n\n// Middleware\napp.use(compression());\napp.use(morgan('combined'));\n// Apply CORS globally before all routes\nconst allowedOrigins = process.env.CORS_ORIGIN\n  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())\n  : [\"http://localhost:3000\"];\nconsole.log('Allowed CORS origins:', allowedOrigins);\n\napp.use(cors({\n  origin: function(origin, callback) {\n    if (!origin) return callback(null, true);\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    return callback(new Error('Not allowed by CORS'));\n  },\n  credentials: true\n}));\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true, limit: '10mb' }));\n\n// Serve uploaded files\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  const health = {\n    status: 'OK',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n    environment: process.env.NODE_ENV || 'development',\n    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'\n  };\n  \n  res.status(200).json(health);\n});\n\n// API Routes\napp.use('/api/auth', authRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/chat', chatRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/notifications', notificationsRoutes);\n\n// Error handling middleware\napp.use(errorHandler);\n\n// 404 handler\napp.use('*', (req, res) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n});\n\nconst PORT = process.env.PORT || 5000;"}, {"file_name": "Campus-Shield/server/routes/reports.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js", "markdown_link": "- [Campus-Shield/server/routes/reports.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js)\n", "code_chunk": "const express = require('express');\nconst multer = require('multer');\nconst path = require('path');\nconst { body, validationResult, query } = require('express-validator');\nconst Report = require('../models/Report');\nconst auth = require('../middleware/auth');\nconst { categorizeReport, analyzeSentiment } = require('../services/aiService');\nconst memoryStore = require('../services/memoryStore');\n\nconst router = express.Router();\n\n// Check if MongoDB is connected\nconst isMongoConnected = () => {\n  return Report.db && Report.db.readyState === 1;\n};\n\n// Configure multer for file uploads\nconst storage = multer.diskStorage({\n  destination: (req, file, cb) => {\n    cb(null, 'uploads/');\n  },\n  filename: (req, file, cb) => {\n    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);\n    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));\n  }\n});\n\nconst upload = multer({\n  storage: storage,\n  limits: {\n    fileSize: 10 * 1024 * 1024, // 10MB limit\n  },\n  fileFilter: (req, file, cb) => {\n    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wav|mp3|pdf/;\n    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());\n    const mimetype = allowedTypes.test(file.mimetype);\n    \n    if (mimetype && extname) {\n      return cb(null, true);\n    } else {\n      cb(new Error('Only image, video, audio, and PDF files are allowed'));\n    }\n  }\n});\n\n// @route   POST /api/reports\n// @desc    Submit a new incident report\n// @access  Private\nrouter.post('/', auth, upload.array('attachments', 5), [\n  body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),\n  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),\n  body('category').isIn([\n    'harassment', 'assault', 'theft', 'vandalism', 'suspicious_activity',\n    'emergency', 'safety_hazard', 'discrimination', 'bullying', 'other'\n  ]).withMessage('Invalid category'),\n  // Add a custom sanitizer for coordinates\n  body('location.coordinates').customSanitizer(value => {\n    if (typeof value === 'string') {\n      try {\n        return JSON.parse(value);\n      } catch {\n        return value;\n      }\n    }\n    return value;\n  }),\n  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),\n  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),\n  body('incidentTime').optional().isISO8601().withMessage('Invalid date format')\n], async (req, res) => {\n  try {\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const {\n      title,\n      description,\n      category,\n      location,\n      incidentTime\n    } = req.body;\n\n    // Get user info\n    const user = req.user;\n\n    // Process attachments\n    const attachments = req.files ? req.files.map(file => ({\n      filename: file.filename,\n      originalName: file.originalname,\n      mimetype: file.mimetype,\n      size: file.size,\n      path: file.path\n    })) : [];\n\n    // Parse coordinates if sent as a string\n    let coordinates = location.coordinates;\n    if (typeof coordinates === 'string') {\n      try {\n        coordinates = JSON.parse(coordinates);\n      } catch (e) {\n        coordinates = undefined;\n      }\n    }\n\n    // Create report data\n    const reportData = {\n      reporterId: user.userId,\n      title,\n      description,\n      category,\n      location: {\n        type: 'Point',\n        coordinates: coordinates || location.coordinates,\n        address: location.address || '',\n        building: location.building || '',\n        floor: location.floor || ''\n      },\n      incidentTime: incidentTime || new Date(),\n      attachments,\n      isAnonymous: user.isAnonymous || true,\n      ipAddress: req.ip,\n      userAgent: req.get('User-Agent')\n    };"}, {"file_name": "Campus-Shield/SETUP_GUIDE.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md", "markdown_link": "- [Campus-Shield/SETUP_GUIDE.md](https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md)\n", "code_chunk": "# \ud83d\udee1\ufe0f CampusShield Setup Guide for Beginners\n\n## \ud83d\udccb Table of Contents\n1. [What is CampusShield?](#what-is-campusshield)\n2. [Cloning from GitHub](#cloning-from-github)\n3. [Prerequisites](#prerequisites)\n4. [Installation Steps](#installation-steps)\n5. [Running the Application](#running-the-application)\n6. [Understanding the Project Structure](#understanding-the-project-structure)\n7. [Common Issues & Solutions](#common-issues--solutions)\n8. [Development Workflow](#development-workflow)\n9. [Testing the Features](#testing-the-features)\n10. [Contributing](#contributing)\n\n---\n\n## \ud83c\udfaf What is CampusShield?\n\nCampusShield is a **privacy-first campus safety platform** that allows students to:\n- **Report incidents anonymously** with location tracking\n- **Chat securely** with campus authorities\n- **Track report status** and updates\n- **View safety analytics** and heatmaps\n\n---\n\n## \ud83d\ude80 Cloning from GitHub\n\nIf you are starting from the GitHub repository:\n```bash\ngit clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd CampusShield\n```\n\n---\n\n## \ud83d\udccb Prerequisites\n\nBefore you start, make sure you have these installed:\n\n### **Required Software:**\n- \u2705 **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)\n- \u2705 **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)\n- \u2705 **Git** (optional) - [Download here](https://git-scm.com/)\n\n### **How to Check if Installed:**\nOpen Command Prompt and type:\n```bash\nnode --version\nnpm --version\nmongod --version\n```\n\n---\n\n## \ud83d\ude80 Installation Steps\n\n### **Step 1: Download the Project**\n1. **Download** the CampusShield project files (or clone from GitHub)\n2. **Extract** to a folder (e.g., `C:\\CampusShield`)\n3. **Open Command Prompt** in that folder\n\n### **Step 2: Install Dependencies**\n```bash\n# Install backend dependencies\ncd server\nnpm install\n\n# Install frontend dependencies\ncd ../client\nnpm install\n```\n\n### **Step 3: Set Up MongoDB**\n1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)\n2. **Install with default settings** (Complete installation)\n3. **MongoDB will run as a Windows Service** (starts automatically)\n\n### **Step 4: Create Environment File**\n1. **Navigate to server folder**: `cd server`\n2. **Copy `.env.example` to `.env`**:\n   ```bash\n   copy .env.example .env\n   # Or manually create .env and copy the contents from .env.example\n   ```\n3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)\n\n### **Step 5: (Optional) Seed Admin/Moderator Accounts**\nIf you want demo admin/moderator accounts, run:\n```bash\ncd server\nnode seedAdmins.js\n```\n\n---\n\n## \ud83c\udfc3\u200d\u2642\ufe0f Running the Application\n\n### **You Need 2 Command Prompt Windows:**\n\n#### **Window 1: Backend Server**\n```bash\ncd server\nnpm run dev\n```\n**Expected Output:**\n```\n\ud83d\udce6 MongoDB Connected: localhost\n\ud83d\ude80 CampusShield server running on port 5000\n\ud83d\udcca Health check: http://localhost:5000/health\n\ud83d\udd12 Environment: development\n```\n\n#### **Window 2: Frontend Server**\n```bash\ncd client\nnpm start\n```\n**Expected Output:**\n```\nCompiled successfully!\n\nYou can now view campus-shield in the browser.\n\n  Local:            http://localhost:3000\n  On Your Network:  http://192.168.x.x:3000\n```\n\n### **Access the Application:**\n- **Frontend**: http://localhost:3000\n- **Backend API**: http://localhost:5000\n- **Health Check**: http://localhost:5000/health\n\n---\n\n## \ud83d\udcf1 Mobile Responsiveness\nCampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.\n\n---\n\n## \ud83d\udcc1 Understanding the Project Structure"}, {"file_name": "Campus-Shield/client/src/components/layout/Navbar.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx", "markdown_link": "- [Campus-Shield/client/src/components/layout/Navbar.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx)\n", "code_chunk": "{/* Slide-in Notification Panel */}\n      {notifOpen && (\n        <div className=\"fixed inset-0 z-50 flex justify-end md:justify-end\">\n          {/* Overlay */}\n          <div\n            className=\"fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300\"\n            onClick={() => setNotifOpen(false)}\n          />\n          {/* Panel */}\n          <div className=\"relative w-full max-w-md md:max-w-md h-full bg-white shadow-xl border-l border-gray-200 flex flex-col animate-slide-in-right md:rounded-none md:h-full md:w-full sm:max-w-full sm:w-full\">\n            <div className=\"flex items-center justify-between px-6 py-4 border-b\">\n              <span className=\"text-lg font-semibold text-gray-800\">Notifications</span>\n              <button onClick={() => setNotifOpen(false)} className=\"p-2 rounded hover:bg-gray-100 md:p-1\">\n                <XMarkIcon className=\"h-7 w-7 text-gray-500 md:h-6 md:w-6\" />\n              </button>\n            </div>\n            <div className=\"flex-1 overflow-y-auto p-4 space-y-3\">\n              {unread.length === 0 ? (\n                <div className=\"text-gray-500 text-sm text-center mt-12\">No unread notifications</div>\n              ) : (\n                unread.map(n => (\n                  <div\n                    key={n.id}\n                    className=\"flex items-start justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:bg-primary-50 transition cursor-pointer group\"\n                  >\n                    <div className=\"flex-1 pr-2 text-sm text-gray-800\" onClick={async () => {\n                      await markAsRead(n.id);\n                      setNotifOpen(false);\n                      if (n.link) navigate(n.link);\n                    }}>\n                      {n.message}\n                    </div>\n                    <button\n                      className=\"ml-2 text-xs px-3 py-2 rounded bg-primary-100 text-primary-700 hover:bg-primary-200 font-medium transition group-hover:bg-primary-200 md:px-2 md:py-1\"\n                      onClick={async () => await markAsRead(n.id)}\n                    >\n                      Mark as read\n                    </button>\n                  </div>\n                ))\n              )}\n            </div>\n          </div>\n        </div>\n      )}\n    </nav>\n  );\n};\n\nexport default Navbar;"}, {"file_name": "Campus-Shield/server/models/Report.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js", "markdown_link": "- [Campus-Shield/server/models/Report.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js)\n", "code_chunk": "const mongoose = require('mongoose');\n\nconst reportSchema = new mongoose.Schema({\n  // Anonymous reporter identification\n  reporterId: {\n    type: String,\n    required: true,\n    index: true\n  },\n  \n  // Report content\n  title: {\n    type: String,\n    required: true,\n    maxlength: 200,\n    trim: true\n  },\n  \n  description: {\n    type: String,\n    required: true,\n    maxlength: 2000,\n    trim: true\n  },\n  \n  // Incident categorization\n  category: {\n    type: String,\n    required: true,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  // AI-generated fields\n  aiCategory: {\n    type: String,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  priority: {\n    type: String,\n    enum: ['low', 'medium', 'high', 'critical'],\n    default: 'medium'\n  },\n  \n  sentiment: {\n    type: String,\n    enum: ['positive', 'neutral', 'negative', 'distressed'],\n    default: 'neutral'\n  },\n  \n  // Location data (generalized for privacy)\n  location: {\n    type: {\n      type: String,\n      enum: ['Point'],\n      default: 'Point'\n    },\n    coordinates: {\n      type: [Number], // [longitude, latitude]\n      required: true,\n      index: '2dsphere'\n    },\n    address: {\n      type: String,\n      maxlength: 200\n    },\n    building: {\n      type: String,\n      maxlength: 100\n    },\n    floor: {\n      type: String,\n      maxlength: 20\n    }\n  },\n  \n  // Timestamp\n  incidentTime: {\n    type: Date,\n    required: true,\n    default: Date.now\n  },\n  \n  // Media attachments\n  attachments: [{\n    filename: String,\n    originalName: String,\n    mimetype: String,\n    size: Number,\n    path: String,\n    uploadedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Report status and handling\n  status: {\n    type: String,\n    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed'],\n    default: 'pending'\n  },\n  \n  assignedTo: {\n    type: mongoose.Schema.Types.ObjectId,\n    ref: 'User'\n  },\n  \n  // Admin notes (private)\n  adminNotes: [{\n    note: String,\n    addedBy: {\n      type: mongoose.Schema.Types.ObjectId,\n      ref: 'User'\n    },\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Public updates for reporter\n  publicUpdates: [{\n    message: String,\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Privacy and data retention\n  isAnonymous: {\n    type: Boolean,\n    default: true\n  },\n  \n  dataRetentionDate: {\n    type: Date,\n    default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years\n  },\n  \n  // Metadata\n  ipAddress: {\n    type: String,\n    required: false // Hashed for privacy\n  },\n  \n  userAgent: {\n    type: String,\n    required: false\n  },\n  \n  createdAt: {\n    type: Date,\n    default: Date.now,\n    index: true\n  },\n  \n  updatedAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Indexes for performance\nreportSchema.index({ createdAt: -1 });\nreportSchema.index({ status: 1, createdAt: -1 });\nreportSchema.index({ category: 1, createdAt: -1 });\nreportSchema.index({ priority: 1, status: 1 });\nreportSchema.index({ 'location.coordinates': '2dsphere' });\nreportSchema.index({ dataRetentionDate: 1 });\n\n// Pre-save middleware\nreportSchema.pre('save', function(next) {\n  this.updatedAt = Date.now();\n  next();\n});\n\n// Method to add admin note\nreportSchema.methods.addAdminNote = function(note, adminId) {\n  this.adminNotes.push({\n    note,\n    addedBy: adminId\n  });\n  return this.save();\n};\n\n// Method to add public update\nreportSchema.methods.addPublicUpdate = function(message) {\n  this.publicUpdates.push({\n    message\n  });\n  return this.save();\n};"}, {"file_name": "Campus-Shield/server/routes/notifications.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/notifications.js", "markdown_link": "- [Campus-Shield/server/routes/notifications.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/notifications.js)\n", "code_chunk": "const express = require('express');\nconst auth = require('../middleware/auth');\nconst Notification = require('../models/Notification');\n\nconst router = express.Router();\n\n// Get all notifications for the logged-in user\nrouter.get('/', auth, async (req, res) => {\n  try {\n    const notifications = await Notification.find({ recipient: req.user.userId }).sort({ timestamp: -1 });\n    res.json({ success: true, notifications });\n  } catch (error) {\n    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });\n  }\n});\n\n// Create a new notification\nrouter.post('/', auth, async (req, res) => {\n  try {\n    const { type, message, link } = req.body;\n    const notification = await Notification.create({\n      recipient: req.user.userId,\n      type,\n      message,\n      link\n    });\n    res.status(201).json({ success: true, notification });\n  } catch (error) {\n    res.status(500).json({ success: false, message: 'Failed to create notification' });\n  }\n});\n\n// Mark a notification as read\nrouter.patch('/:id/read', auth, async (req, res) => {\n  try {\n    const notification = await Notification.findOneAndUpdate(\n      { _id: req.params.id, recipient: req.user.userId },\n      { read: true },\n      { new: true }\n    );\n    if (!notification) {\n      return res.status(404).json({ success: false, message: 'Notification not found' });\n    }\n    res.json({ success: true, notification });\n  } catch (error) {\n    res.status(500).json({ success: false, message: 'Failed to update notification' });\n  }\n});\n\nmodule.exports = router;"}, {"file_name": "Campus-Shield/server/services/socketService.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/socketService.js", "markdown_link": "- [Campus-Shield/server/services/socketService.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/socketService.js)\n", "code_chunk": "const jwt = require('jsonwebtoken');\nconst User = require('../models/User');\n\nconst initializeSocket = (io) => {\n  // Authentication middleware\n  io.use(async (socket, next) => {\n    try {\n      const token = socket.handshake.auth.token;\n      \n      if (!token) {\n        return next(new Error('Authentication error'));\n      }\n\n      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');\n      const user = await User.findById(decoded.userId);\n      \n      if (!user || !user.isActive) {\n        return next(new Error('User not found or inactive'));\n      }\n\n      socket.user = {\n        userId: user._id,\n        anonymousId: user.anonymousId,\n        role: user.role,\n        isAnonymous: user.isAnonymous\n      };\n\n      next();\n    } catch (error) {\n      next(new Error('Authentication error'));\n    }\n  });\n\n  io.on('connection', (socket) => {\n    console.log(`User connected: ${socket.user.anonymousId}`);\n\n    // Join user to their personal room\n    socket.join(`user_${socket.user.userId}`);\n\n    // Join admin to admin room if admin\n    if (socket.user.role === 'admin') {\n      socket.join('admin_room');\n    }\n\n    // Join chat room\n    socket.on('join_chat_room', (roomId) => {\n      socket.join(roomId);\n      console.log(`User ${socket.user.anonymousId} joined room: ${roomId}`);\n    });\n\n    // Leave chat room\n    socket.on('leave_chat_room', (roomId) => {\n      socket.leave(roomId);\n      console.log(`User ${socket.user.anonymousId} left room: ${roomId}`);\n    });\n\n    // Send message\n    socket.on('send_message', (data) => {\n      const { roomId, message } = data;\n      \n      // Emit to room\n      io.to(roomId).emit('new_message', {\n        id: Date.now().toString(),\n        senderId: socket.user.userId,\n        senderRole: socket.user.role,\n        message,\n        timestamp: new Date(),\n        isAnonymous: socket.user.isAnonymous\n      });\n\n      // Notify admins if message is from user\n      if (socket.user.role === 'user') {\n        io.to('admin_room').emit('user_message', {\n          roomId,\n          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),\n          timestamp: new Date()\n        });\n      }\n    });\n\n    // Report status updates\n    socket.on('report_status_update', (data) => {\n      const { reportId, status, message } = data;\n      \n      // Notify user about their report update\n      io.to(`user_${socket.user.userId}`).emit('report_updated', {\n        reportId,\n        status,\n        message,\n        timestamp: new Date()\n      });\n    });\n\n    // Location-based alerts\n    socket.on('location_update', (data) => {\n      const { latitude, longitude } = data;\n      \n      // In a real implementation, you would check for nearby incidents\n      // and send alerts to users in high-report areas\n      console.log(`User ${socket.user.anonymousId} location: ${latitude}, ${longitude}`);\n    });\n\n    // Typing indicators\n    socket.on('typing_start', (roomId) => {\n      socket.to(roomId).emit('user_typing', {\n        userId: socket.user.userId,\n        isTyping: true\n      });\n    });\n\n    socket.on('typing_stop', (roomId) => {\n      socket.to(roomId).emit('user_typing', {\n        userId: socket.user.userId,\n        isTyping: false\n      });\n    });\n\n    // Disconnect\n    socket.on('disconnect', () => {\n      console.log(`User disconnected: ${socket.user.anonymousId}`);\n    });\n  });\n\n  // Global error handler\n  io.on('error', (error) => {\n    console.error('Socket.io error:', error);\n  });\n};\n\nmodule.exports = { initializeSocket };"}, {"file_name": "Campus-Shield/client/src/App.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/App.tsx", "markdown_link": "- [Campus-Shield/client/src/App.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/App.tsx)\n", "code_chunk": "import React from 'react';\nimport { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';\nimport { AuthProvider, useAuth } from './contexts/AuthContext';\nimport Navbar from './components/layout/Navbar';\nimport Home from './pages/Home';\nimport Login from './pages/Login';\nimport Register from './pages/Register';\nimport AdminLogin from './pages/AdminLogin';\nimport RequestAdmin from './pages/RequestAdmin';\nimport AdminRequests from './pages/AdminRequests';\nimport ReportIncident from './pages/ReportIncident';\nimport MyReports from './pages/MyReports';\nimport AdminDashboard from './pages/AdminDashboard';\nimport Chat from './pages/Chat';\nimport LoadingSpinner from './components/common/LoadingSpinner';\nimport ModeratorDashboard from './pages/ModeratorDashboard';\nimport { NotificationProvider } from './contexts/NotificationContext';\nimport NotificationBar from './components/common/NotificationBar';\nimport { ToastContainer } from 'react-toastify';\nimport 'react-toastify/dist/ReactToastify.css';\n\n// Protected Route Component\nconst ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; moderatorOnly?: boolean }> = ({\n  children,\n  adminOnly = false,\n  moderatorOnly = false\n}) => {\n  const { user, loading } = useAuth();\n\n  if (loading) return <LoadingSpinner />;\n  if (!user) return <Navigate to=\"/login\" replace />;\n  if (adminOnly && user.role !== 'admin') return <Navigate to=\"/\" replace />;\n  if (moderatorOnly && user.role !== 'moderator') return <Navigate to=\"/\" replace />;\n  return <>{children}</>;\n};\n\n// Main App Component\nconst AppContent: React.FC = () => {\n  const { user } = useAuth();\n\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <Navbar />\n      <main className=\"container mx-auto px-4 py-8\">\n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/login\" element={!user ? <Login /> : <Navigate to=\"/\" replace />} />\n          <Route path=\"/register\" element={!user ? <Register /> : <Navigate to=\"/\" replace />} />\n          <Route path=\"/admin-login\" element={!user ? <AdminLogin /> : <Navigate to=\"/admin\" replace />} />\n          <Route\n            path=\"/request-admin\"\n            element={\n              <ProtectedRoute>\n                <RequestAdmin />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/report\"\n            element={\n              <ProtectedRoute>\n                <ReportIncident />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/my-reports\"\n            element={\n              <ProtectedRoute>\n                <MyReports />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/chat\"\n            element={\n              <ProtectedRoute>\n                <Chat />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/admin\"\n            element={\n              <ProtectedRoute adminOnly>\n                <AdminDashboard />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/admin/requests\"\n            element={\n              <ProtectedRoute moderatorOnly>\n                <AdminRequests />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/moderator\"\n            element={\n              <ProtectedRoute moderatorOnly>\n                <ModeratorDashboard />\n              </ProtectedRoute>\n            }\n          />\n          <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n        </Routes>\n      </main>\n    </div>\n  );\n};"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// In-memory data store for testing when MongoDB is not available\nclass MemoryStore {\n  constructor() {\n    this.users = new Map();\n    this.reports = new Map();\n    this.chatRooms = new Map();\n    this.messages = new Map();\n    this.adminRequests = new Map();\n    this.nextUserId = 1;\n    this.nextReportId = 1;\n    this.nextRoomId = 1;\n    this.nextMessageId = 1;\n    this.nextRequestId = 1;\n\n    // Initialize with pre-existing admin users\n    this.initializeAdminUsers();\n  }\n\n  initializeAdminUsers() {\n    // Pre-existing admin users - these should be provided by campus IT\n    const adminUsers = [\n      {\n        id: 'admin-001',\n        email: 'admin@campus.edu',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"password\"\n        role: 'admin',\n        anonymousId: 'admin-anon-001',\n        isAnonymous: false,\n        campusId: 'ADMIN001',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-002',\n        email: 'security@campus.edu',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"password\"\n        role: 'admin',\n        anonymousId: 'admin-anon-002',\n        isAnonymous: false,\n        campusId: 'ADMIN002',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-003',\n        email: 'normal@admin.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"admin\" (same hash as \"password\")\n        role: 'admin',\n        anonymousId: 'admin-anon-003',\n        isAnonymous: false,\n        campusId: 'ADMIN003',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-004',\n        email: 'Iapprove@admin.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"approve\" (same hash as \"password\")\n        role: 'moderator',\n        anonymousId: 'moderator-anon-001',\n        isAnonymous: false,\n        campusId: 'MOD001',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'moderator-001',\n        email: 'moderator1@example.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"moderatorpassword1\"\n        role: 'moderator',\n        anonymousId: 'moderator-anon-002',\n        isAnonymous: false,\n        campusId: 'MOD002',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      }\n    ];\n\n    adminUsers.forEach(user => {\n      this.users.set(user.id, user);\n    });\n  }\n\n  // User operations\n  createUser(userData) {\n    const user = {\n      id: this.nextUserId.toString(),\n      ...userData,\n      role: 'user', // Default role is user, not admin\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString()\n    };\n    this.users.set(user.id, user);\n    this.nextUserId++;\n    return user;\n  }\n\n  findUserByEmail(email) {\n    for (const user of this.users.values()) {\n      if (user.email === email) {\n        return user;\n      }\n    }\n    return null;\n  }\n\n  findUserById(id) {\n    return this.users.get(id) || null;\n  }\n\n  updateUser(id, updates) {\n    const user = this.users.get(id);\n    if (user) {\n      Object.assign(user, updates, { updatedAt: new Date().toISOString() });\n      this.users.set(id, user);\n      return user;\n    }\n    return null;\n  }"}, {"file_name": "Campus-Shield/server/models/Notification.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Notification.js", "markdown_link": "- [Campus-Shield/server/models/Notification.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Notification.js)\n", "code_chunk": "const mongoose = require('mongoose');\n\nconst NotificationSchema = new mongoose.Schema({\n  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },\n  type: { type: String, enum: ['chat', 'status', 'other'], default: 'other' },\n  message: { type: String, required: true },\n  link: { type: String },\n  read: { type: Boolean, default: false },\n  timestamp: { type: Date, default: Date.now }\n});\n\nmodule.exports = mongoose.model('Notification', NotificationSchema);"}, {"file_name": "Campus-Shield/env.example", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/env.example", "markdown_link": "- [Campus-Shield/env.example](https://github.com/sparrowdex/Campus-Shield/blob/main/env.example)\n", "code_chunk": "# CampusShield Environment Configuration\n\n# Server Configuration\nNODE_ENV=development\nPORT=5000\nCORS_ORIGIN=http://localhost:3000\n\n# Database Configuration\nMONGODB_URI=mongodb://localhost:27017/campusshield\n\n# JWT Configuration\nJWT_SECRET=your-super-secret-jwt-key-change-this-in-production\n\n# Rate Limiting\nRATE_LIMIT_WINDOW=900000\nRATE_LIMIT_MAX_REQUESTS=100\n\n# File Upload Configuration\nMAX_FILE_SIZE=10485760\nUPLOAD_PATH=uploads\n\n# Security Configuration\nBCRYPT_ROUNDS=12\n\n# AI/ML Service Configuration (for future integration)\nAI_SERVICE_URL=\nAI_SERVICE_KEY=\n\n# Notification Services (for future integration)\nFIREBASE_PROJECT_ID=\nFIREBASE_PRIVATE_KEY=\nFIREBASE_CLIENT_EMAIL=\n\nTWILIO_ACCOUNT_SID=\nTWILIO_AUTH_TOKEN=\nTWILIO_PHONE_NUMBER=\n\nSENDGRID_API_KEY=\nSENDGRID_FROM_EMAIL=\n\n# Maps Configuration\nGOOGLE_MAPS_API_KEY=\nMAPBOX_ACCESS_TOKEN=\n\n# File Storage (for future integration)\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nAWS_REGION=\nAWS_S3_BUCKET=\n\n# Logging Configuration\nLOG_LEVEL=info\nLOG_FILE=logs/app.log\n\n# Data Retention (in days)\nUSER_DATA_RETENTION_DAYS=365\nREPORT_DATA_RETENTION_DAYS=730"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "return (\n    <div className=\"min-h-screen\">\n      {/* Hero Section */}\n      <section className=\"bg-gradient-to-br from-primary-600 to-primary-800 text-white\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24\">\n          <div className=\"text-center\">\n            <div className=\"flex justify-center mb-8\">\n              <ShieldCheckIcon className=\"h-16 w-16 text-white\" />\n            </div>\n            <h1 className=\"text-4xl md:text-6xl font-bold mb-6\">\n              {user?.role === 'admin' && 'Welcome, Admin! '}\n              {user?.role === 'moderator' && 'Welcome, Moderator! '}\n              Campus Safety,{' '}\n              <span className=\"text-primary-200\">Privacy First</span>\n            </h1>\n            <p className=\"text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto\">\n              Report campus safety incidents anonymously. Stay informed with real-time alerts. \n              Help create a safer campus community.\n            </p>\n            <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n              {user?.role === 'user' && (\n                <>\n                  <Link to=\"/report\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Report Incident\n                  </Link>\n                  <Link to=\"/my-reports\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    View My Reports\n                  </Link>\n                </>\n              )}\n              {user?.role === 'admin' && (\n                <>\n                  <Link to=\"/admin\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Dashboard\n                  </Link>\n                  <Link to=\"/chat\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Chat\n                  </Link>\n                </>\n              )}\n              {user?.role === 'moderator' && (\n                <>\n                  <Link to=\"/admin/requests\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Requests\n                  </Link>\n                </>\n              )}\n              {!user && (\n                <>\n                  <Link to=\"/register\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Get Started\n                  </Link>\n                  <Link to=\"/login\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Login\n                  </Link>\n                </>\n              )}\n            </div>\n          </div>\n        </div>\n      </section>\n\n      {/* Stats Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"grid grid-cols-2 md:grid-cols-4 gap-8\">\n            {stats.map((stat, index) => (\n              <div key={index} className=\"text-center\">\n                <div className=\"text-3xl md:text-4xl font-bold text-primary-600 mb-2\">\n                  {stat.value}\n                </div>\n                <div className=\"text-sm md:text-base text-gray-600\">\n                  {stat.label}\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>"}, {"file_name": "Campus-Shield/client/src/contexts/NotificationContext.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts/NotificationContext.tsx", "markdown_link": "- [Campus-Shield/client/src/contexts/NotificationContext.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts/NotificationContext.tsx)\n", "code_chunk": "import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';\nimport { toast } from 'react-toastify';\nimport axios from 'axios';\n\nexport interface Notification {\n  id: string;\n  type: 'chat' | 'status' | 'other';\n  message: string;\n  link?: string;\n  read: boolean;\n  timestamp: string;\n}\n\ninterface NotificationContextType {\n  notifications: Notification[];\n  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => Promise<void>;\n  markAsRead: (id: string) => Promise<void>;\n  clearNotifications: () => void;\n  fetchNotifications: () => Promise<void>;\n}\n\nconst NotificationContext = createContext<NotificationContextType | undefined>(undefined);\n\nexport const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {\n  const [notifications, setNotifications] = useState<Notification[]>([]);\n\n  // Fetch notifications from backend\n  const fetchNotifications = async () => {\n    try {\n      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications`);\n      if (res.data.success) {\n        setNotifications(\n          res.data.notifications.map((n: any) => ({\n            id: n._id,\n            type: n.type,\n            message: n.message,\n            link: n.link,\n            read: n.read,\n            timestamp: n.timestamp,\n          }))\n        );\n      }\n    } catch (err) {\n      // Optionally handle error\n    }\n  };\n\n  useEffect(() => {\n    fetchNotifications();\n  }, []);\n\n  // Add notification (persist to backend)\n  const addNotification = async (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {\n    try {\n      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications`, notif);\n      if (res.data.success) {\n        const n = res.data.notification;\n        const newNotif: Notification = {\n          id: n._id,\n          type: n.type,\n          message: n.message,\n          link: n.link,\n          read: n.read,\n          timestamp: n.timestamp,\n        };\n        setNotifications((prev) => [newNotif, ...prev]);\n        toast.info(newNotif.message, { autoClose: 5000 });\n      }\n    } catch (err) {\n      // Optionally handle error\n    }\n  };\n\n  // Mark notification as read (persist to backend)\n  const markAsRead = async (id: string) => {\n    try {\n      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/notifications/${id}/read`);\n      if (res.data.success) {\n        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));\n      }\n    } catch (err) {\n      // Optionally handle error\n    }\n  };\n\n  const clearNotifications = () => {\n    setNotifications([]);\n  };\n\n  return (\n    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearNotifications, fetchNotifications }}>\n      {children}\n    </NotificationContext.Provider>\n  );\n};\n\nexport const useNotifications = () => {\n  const ctx = useContext(NotificationContext);\n  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');\n  return ctx;\n};"}, {"file_name": "Campus-Shield/server/start.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/start.js", "markdown_link": "- [Campus-Shield/server/start.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/start.js)\n", "code_chunk": "#!/usr/bin/env node\n\n// Simple startup script for deployment\nconsole.log('\ud83d\ude80 Starting CampusShield Server...');\nconsole.log('\ud83d\udcca Environment:', process.env.NODE_ENV || 'development');\nconsole.log('\ud83d\udd17 Port:', process.env.PORT || 5000);\n\n// Check if MongoDB URI is set\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nif (!process.env.MONGODB_URI) {\n  console.warn('\u26a0\ufe0f  MONGODB_URI not set. Database features will not work.');\n  console.log('\ud83d\udca1 Please check your environment variables');\n  console.log('\ud83d\udca1 Make sure you added MONGODB_URI in the Variables tab');\n} else {\n  console.log('\u2705 MONGODB_URI is configured');\n  console.log('\ud83d\udd17 URI starts with:', process.env.MONGODB_URI.substring(0, 30) + '...');\n}\n\n// Start the server\nrequire('./index.js');"}, {"file_name": "Campus-Shield/server/routes/auth.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js", "markdown_link": "- [Campus-Shield/server/routes/auth.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js)\n", "code_chunk": "const user = memoryStore.createUser(userData);\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.status(201).json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }\n\n  } catch (error) {\n    console.error('Anonymous auth error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error during anonymous authentication'\n    });\n  }\n});\n\n// Enhanced /admin-login route with detailed logging\nrouter.post('/admin-login', [\n  body('email').isEmail().withMessage('Please enter a valid email'),\n  body('password').exists().withMessage('Password is required')\n], async (req, res) => {\n  try {\n    console.log('Admin login attempt:', req.body);\n\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      console.error('Validation errors:', errors.array());\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const { email, password } = req.body;\n\n    if (isMongoConnected()) {\n      const user = await User.findOne({ email });\n      if (!user) {\n        console.error('Admin user not found for email:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (user not found)'\n        });\n      }\n\n      const isMatch = await user.comparePassword(password);\n      if (!isMatch) {\n        console.error('Admin password mismatch for user:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (password mismatch)'\n        });\n      }\n\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        console.error('User does not have admin/moderator role:', email, user.role);\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      const token = generateToken(user._id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user._id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    } else {\n      // Use memory store\n      const user = memoryStore.findUserByEmail(email);\n      if (!user || !user.password) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Check password (with special handling for new admin accounts)\n      let isMatch = false;\n      if (user.email === 'normal@admin.com' && password === 'admin') {\n        isMatch = true;\n      } else if (user.email === 'Iapprove@admin.com' && password === 'approve') {\n        isMatch = true;\n      } else {\n        isMatch = await bcrypt.compare(password, user.password);\n      }\n      \n      if (!isMatch) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Only allow existing admins or moderators to login\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }"}]</code-reference>