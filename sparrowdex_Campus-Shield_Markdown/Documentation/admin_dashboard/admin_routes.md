# Admin Routes

## Admin Routes Component

<document-code-reference section="Admin Routes Component">
{"files": [
  {
    "name": "Campus-Shield/server/routes/admin.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/client/src/pages/RequestAdmin.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/server/routes/reports.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
  }
]}
</document-code-reference>

The Admin Routes component in the Campus-Shield project handles administrative functionalities and access control for the campus safety reporting system. It encompasses both server-side and client-side implementations to manage admin-specific operations, authentication, and data flow.

<artifact ArtifactUUID="2fd005dc-27b9-40d7-995d-c454994c312a">Server-Side Admin Route Handling</artifact>

The server-side admin routes are defined in `server/routes/admin.js`. This file contains Express.js route handlers for various administrative operations:

```javascript
const router = express.Router();

router.get('/stats', auth, admin, async (req, res) => {
  // Fetch and return admin dashboard statistics
});

router.get('/dashboard', auth, admin, async (req, res) => {
  // Retrieve and send admin dashboard data
});

router.get('/reports', auth, admin, async (req, res) => {
  // Fetch all reports for admin view
});

router.post('/reports/:reportId/assign', auth, admin, async (req, res) => {
  // Assign a report to an admin
});
```

Key features:
- Use of `auth` and `admin` middleware for secure access
- Aggregation of statistics and report data
- Handling of report assignments

<artifact ArtifactUUID="ebcdaa57-8f32-4682-be5c-d5af9beb90d9">Admin Authentication and Authorization</artifact>

Authentication for admin routes is managed through multiple layers:

1. `server/middleware/auth.js`: Verifies the JWT token for all authenticated routes
2. `server/middleware/admin.js`: Ensures the authenticated user has admin privileges
3. `client/src/contexts/AuthContext.tsx`: Manages client-side authentication state

```javascript
// server/middleware/admin.js
const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
};
```

<artifact ArtifactUUID="10b7f18d-2c02-4390-95bd-36460b2b36b2">Admin Dashboard Implementation</artifact>

The admin dashboard (`client/src/pages/AdminDashboard.tsx`) serves as the central hub for administrative operations:

```typescript
const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch admin stats and reports
  };

  // Render dashboard components
};
```

Key functionalities:
- Fetching and displaying admin statistics
- Managing and filtering reports
- Updating report statuses
- Visualizing data with charts and heatmaps

## Admin Request Handling

<document-code-reference section="Admin Request Handling">
{"files": [
  {
    "name": "Campus-Shield/server/routes/admin.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/client/src/pages/RequestAdmin.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
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

The system includes a process for users to request admin privileges:

1. Client-side form (`client/src/pages/RequestAdmin.tsx`)
2. Server-side processing (`server/routes/admin.js`)
3. Admin review interface (`client/src/pages/AdminRequests.tsx`)

```javascript
// server/routes/admin.js
router.post('/request-admin', auth, [
  // Validation middleware
], async (req, res) => {
  // Process admin request
});

router.get('/requests', auth, moderator, async (req, res) => {
  // Fetch admin requests for review
});

router.post('/requests/:requestId/approve', auth, moderator, async (req, res) => {
  // Approve an admin request
});
```

This multi-step process ensures proper vetting of admin privilege requests.

## Integration with Main Application

<document-code-reference section="Integration with Main Application">
{"files": [
  {
    "name": "Campus-Shield/server/routes/admin.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/client/src/pages/RequestAdmin.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
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

The admin routes are integrated into the main application flow:

1. `client/src/App.tsx`: Defines protected routes for admin pages
2. `server/index.js`: Mounts admin routes to the Express application

```typescript
// client/src/App.tsx
<Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/requests" element={<ProtectedRoute><AdminRequests /></ProtectedRoute>} />
```

## Error Handling and Security

<document-code-reference section="Error Handling and Security">
{"files": [
  {
    "name": "Campus-Shield/server/routes/admin.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/server/middleware/errorHandler.js",
    "description": "JavaScript/TypeScript implementation file containing request handlers and business logic",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/middleware/errorHandler.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/middleware"
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

The admin routes implement robust error handling and security measures:

- Input validation using express-validator
- Error middleware for consistent error responses
- Rate limiting to prevent abuse
- Secure storage of sensitive information (e.g., JWT secrets)

## Scalability and Performance

<document-code-reference section="Scalability and Performance">
{"files": [
  {
    "name": "Campus-Shield/server/routes/admin.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
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

The admin routes are designed with scalability in mind:

- Efficient database queries using aggregation pipelines
- Pagination for large datasets
- Caching strategies for frequently accessed data

By leveraging these techniques, the Admin Routes component provides a secure, efficient, and user-friendly interface for managing the Campus-Shield system.
## References:
### Code:
<code-reference uuid='e2a69226-a714-42a7-b72b-8718d9e081e3'>[{"file_name": "Campus-Shield/server/index.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js", "markdown_link": "- [Campus-Shield/server/index.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js)\n", "code_chunk": "const express = require('express');\nconst http = require('http');\nconst socketIo = require('socket.io');\nconst cors = require('cors');\nconst helmet = require('helmet');\nconst compression = require('compression');\nconst morgan = require('morgan');\nconst rateLimit = require('express-rate-limit');\nconst path = require('path');\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\n\n// Debug environment variables\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nconst connectDB = require('./config/database');\nconst authRoutes = require('./routes/auth');\nconst reportRoutes = require('./routes/reports');\nconst chatRoutes = require('./routes/chat');\nconst adminRoutes = require('./routes/admin');\nconst notificationsRoutes = require('./routes/notifications');\nconst { initializeSocket } = require('./services/socketService');\nconst { errorHandler } = require('./middleware/errorHandler');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server, {\n  cors: {\n    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",\n    methods: [\"GET\", \"POST\"]\n  }\n});\n\n// Connect to MongoDB (non-blocking)\nconnectDB().catch(err => {\n  console.error('Failed to connect to database:', err);\n  // Don't exit the process, let it continue\n});\n\n// Initialize Socket.io\ninitializeSocket(io);\n\n// Security middleware\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      scriptSrc: [\"'self'\"],\n      imgSrc: [\"'self'\", \"[REMOVED_DATA_URI]\n      connectSrc: [\"'self'\", \"ws:\", \"wss:\"]\n    }\n  }\n}));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes\n  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,\n  message: 'Too many requests from this IP, please try again later.',\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use('/api/', limiter);\n\n// Middleware\napp.use(compression());\napp.use(morgan('combined'));\n// Apply CORS globally before all routes\nconst allowedOrigins = process.env.CORS_ORIGIN\n  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())\n  : [\"http://localhost:3000\"];\nconsole.log('Allowed CORS origins:', allowedOrigins);\n\napp.use(cors({\n  origin: function(origin, callback) {\n    if (!origin) return callback(null, true);\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    return callback(new Error('Not allowed by CORS'));\n  },\n  credentials: true\n}));\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true, limit: '10mb' }));\n\n// Serve uploaded files\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  const health = {\n    status: 'OK',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n    environment: process.env.NODE_ENV || 'development',\n    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'\n  };\n  \n  res.status(200).json(health);\n});\n\n// API Routes\napp.use('/api/auth', authRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/chat', chatRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/notifications', notificationsRoutes);\n\n// Error handling middleware\napp.use(errorHandler);\n\n// 404 handler\napp.use('*', (req, res) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n});\n\nconst PORT = process.env.PORT || 5000;"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// Admin request operations\n  createAdminRequest(userId, requestData) {\n    const request = {\n      id: this.nextRequestId.toString(),\n      userId,\n      ...requestData,\n      status: 'pending', // pending, approved, rejected\n      createdAt: new Date().toISOString(),\n      reviewedBy: null,\n      reviewedAt: null,\n      reviewNotes: null\n    };\n    this.adminRequests.set(request.id, request);\n    this.nextRequestId++;\n    return request;\n  }\n\n  getAdminRequests(status = null) {\n    const requests = Array.from(this.adminRequests.values());\n    if (status) {\n      return requests.filter(req => req.status === status);\n    }\n    return requests;\n  }\n\n  updateAdminRequest(requestId, updates) {\n    const request = this.adminRequests.get(requestId);\n    if (request) {\n      Object.assign(request, updates, { \n        reviewedAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString()\n      });\n      this.adminRequests.set(requestId, request);\n      return request;\n    }\n    return null;\n  }\n\n  approveAdminRequest(requestId, approvedBy, notes = '') {\n    const request = this.updateAdminRequest(requestId, {\n      status: 'approved',\n      reviewedBy: approvedBy,\n      reviewNotes: notes\n    });\n\n    if (request) {\n      // Promote user to admin\n      this.updateUser(request.userId, { role: 'admin' });\n    }\n\n    return request;\n  }\n\n  rejectAdminRequest(requestId, rejectedBy, notes = '') {\n    return this.updateAdminRequest(requestId, {\n      status: 'rejected',\n      reviewedBy: rejectedBy,\n      reviewNotes: notes\n    });\n  }\n\n  // Report operations\n  createReport(reportData) {\n    const report = {\n      id: this.nextReportId.toString(),\n      ...reportData,\n      status: 'pending',\n      priority: 'medium',\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString(),\n      attachments: [],\n      publicUpdates: []\n    };\n    this.reports.set(report.id, report);\n    this.nextReportId++;\n    return report;\n  }\n\n  findReportsByUserId(userId) {\n    const userReports = [];\n    for (const report of this.reports.values()) {\n      if (report.userId === userId) {\n        userReports.push(report);\n      }\n    }\n    return userReports;\n  }\n\n  findReportById(id) {\n    return this.reports.get(id) || null;\n  }\n\n  updateReport(id, updates) {\n    const report = this.reports.get(id);\n    if (report) {\n      Object.assign(report, updates, { updatedAt: new Date().toISOString() });\n      this.reports.set(id, report);\n      return report;\n    }\n    return null;\n  }\n\n  // Chat operations\n  createChatRoom(roomData) {\n    const room = {\n      roomId: this.nextRoomId.toString(),\n      ...roomData,\n      createdAt: new Date().toISOString(),\n      lastMessage: null\n    };\n    this.chatRooms.set(room.roomId, room);\n    this.nextRoomId++;\n    return room;\n  }\n\n  findChatRoomByReportId(reportId) {\n    for (const room of this.chatRooms.values()) {\n      if (room.reportId === reportId) {\n        return room;\n      }\n    }\n    return null;\n  }\n\n  findChatRoomsByUserId(userId) {\n    const userRooms = [];\n    for (const room of this.chatRooms.values()) {\n      if (room.userId === userId) {\n        userRooms.push(room);\n      }\n    }\n    return userRooms;\n  }\n\n  createMessage(messageData) {\n    const message = {\n      id: this.nextMessageId.toString(),\n      ...messageData,\n      timestamp: new Date().toISOString()\n    };\n    this.messages.set(message.id, message);\n    this.nextMessageId++;\n    return message;\n  }\n\n  findMessagesByRoomId(roomId) {\n    const roomMessages = [];\n    for (const message of this.messages.values()) {\n      if (message.roomId === roomId) {\n        roomMessages.push(message);\n      }\n    }\n    return roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));\n  }\n\n  // Admin operations\n  getAllReports() {\n    return Array.from(this.reports.values());\n  }\n\n  getAllUsers() {\n    return Array.from(this.users.values());\n  }"}, {"file_name": "Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md", "markdown_link": "- [Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md](https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md)\n", "code_chunk": "# CampusShield Tech Stack and Workflow Documentation\n\n## Recommended Tech Stack\n\n| Layer                | Technology Options                                                                                                          | Notes                                                     |\n|----------------------|----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|\n| **Front-End**        | React.js, React Native (mobile), Flutter (mobile)                                                                          | For web/mobile apps; Flutter enables true cross-platform  |\n| **Back-End/API**     | Node.js (Express.js), Python (FastAPI or Django)                                                                           | Scalable REST APIs, real-time features                    |\n| **Database**         | MongoDB (NoSQL), PostgreSQL (SQL)                                                                                          | MongoDB for flexible data; PostgreSQL for relational data |\n| **Authentication**   | Firebase Auth, Auth0, or custom JWT-based auth                                                                             | Secure sign-in, supports anonymity and OAuth              |\n| **Notifications**    | Firebase Cloud Messaging (push), Twilio (SMS), SendGrid (email)                                                            | Real-time and multi-channel notifications                 |\n| **AI/ML Integration**| Python (scikit-learn, Hugging Face Transformers, spaCy) via an API microservice                                           | For categorization, sentiment analysis, NLP               |\n| **Chat/Real-Time**   | Socket.io (Node.js), WebSockets, or Firebase Realtime Database                                                             | For admin-user anonymous chat, group support              |\n| **Maps/Heatmaps**    | Google Maps API, Mapbox, Leaflet.js                                                                                        | For live incident heatmaps                                |\n| **File Storage**     | AWS S3, Google Cloud Storage, Firebase Storage                                                                             | For reports with photos, voice, or video                  |\n| **Admin Dashboard**  | React (web-based), Chart.js/D3.js for analytics and visualizations                                                         | Data visualization and report management                  |\n| **Hosting/Infra**    | AWS, Google Cloud Platform, Azure, Vercel, Heroku                                                                          | Scalable and easy deployment                              |\n| **Security**         | HTTPS/SSL, end-to-end encryption (Signal Protocol, custom), privacy libraries                                              | To ensure report privacy and anonymous chat               |\n| **Localization**     | i18next, Google Cloud Translation                                                                                          | For multilingual support                                  |\n\n## MVP Tech Stack (Phase 1)\n\nFor the initial MVP, we'll use a simplified but scalable stack:\n\n- **Frontend**: React.js with Tailwind CSS\n- **Backend**: Node.js with Express.js\n- **Database**: MongoDB (flexible schema for reports)\n- **Real-time**: Socket.io for chat and live updates\n- **Authentication**: JWT-based with anonymous options\n- **Maps**: Leaflet.js for heatmap visualization\n- **File Storage**: Local storage initially, cloud storage later\n- **AI/ML**: Basic text classification using natural language processing\n\n## Suggested Workflow\n\n### 1. User Onboarding & Authentication\n- Users sign up with minimal data, choose anonymity (no personal info required).\n- Optional: Offer OAuth (Google, college email) for added features with clear privacy messaging."}, {"file_name": "Campus-Shield/client/src/pages/RequestAdmin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/RequestAdmin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx)\n", "code_chunk": "<div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6\">\n          <div className=\"flex\">\n            <ShieldCheckIcon className=\"h-5 w-5 text-blue-400 mt-0.5\" />\n            <div className=\"ml-3\">\n              <h3 className=\"text-sm font-medium text-blue-800\">Important Information</h3>\n              <div className=\"mt-2 text-sm text-blue-700\">\n                <ul className=\"list-disc list-inside space-y-1\">\n                  <li>Admin access is granted only to authorized campus personnel</li>\n                  <li>Your request will be reviewed by existing administrators only</li>\n                  <li>Only pre-approved admins can approve new admin requests</li>\n                  <li>You will be notified of the decision via email</li>\n                  <li>Please provide a detailed reason for your request</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <form onSubmit={handleSubmit} className=\"space-y-6\">\n          {/* Personal Information */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Personal Information</h3>\n            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n              <div>\n                <label htmlFor=\"role\" className=\"form-label\">\n                  Your Role/Position *\n                </label>\n                <input\n                  id=\"role\"\n                  name=\"role\"\n                  type=\"text\"\n                  required\n                  value={formData.role}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Security Officer, IT Manager, Dean\"\n                />\n              </div>\n              <div>\n                <label htmlFor=\"department\" className=\"form-label\">\n                  Department/Unit *\n                </label>\n                <input\n                  id=\"department\"\n                  name=\"department\"\n                  type=\"text\"\n                  required\n                  value={formData.department}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Campus Security, IT Services, Student Affairs\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {/* Experience & Qualifications */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Experience & Qualifications</h3>\n            <div>\n              <label htmlFor=\"experience\" className=\"form-label\">\n                Relevant Experience *\n              </label>\n              <textarea\n                id=\"experience\"\n                name=\"experience\"\n                rows={3}\n                required\n                value={formData.experience}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your experience with campus safety, incident management, or administrative systems...\"\n              />\n            </div>\n          </div>\n\n          {/* Responsibilities */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Responsibilities & Duties</h3>\n            <div>\n              <label htmlFor=\"responsibilities\" className=\"form-label\">\n                Current Responsibilities *\n              </label>\n              <textarea\n                id=\"responsibilities\"\n                name=\"responsibilities\"\n                rows={3}\n                required\n                value={formData.responsibilities}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your current responsibilities that would benefit from admin access...\"\n              />\n            </div>\n          </div>"}, {"file_name": "Campus-Shield/client/src/pages/AdminDashboard.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminDashboard.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx)\n", "code_chunk": "const assignedToIdStr = assignedToId ? String(assignedToId) : null;\n  const currentUserIdStr = currentUserId ? String(currentUserId) : null;\n\n  console.log('currentUserId:', currentUserId);\n  console.log('assignedToId:', assignedToId);\n  console.log('selectedReport:', selectedReport);\n\n  return (\n    <div className=\"max-w-7xl mx-auto\">\n      <div className=\"card\">\n        <div className=\"flex items-center justify-between mb-6\">\n          <h1 className=\"text-2xl font-bold text-gray-900\">Admin Dashboard</h1>\n          <div className=\"flex items-center space-x-4\">\n            {user?.role === 'moderator' && (\n              <Link\n                to=\"/admin/requests\"\n                className=\"btn-primary\"\n              >\n                <ShieldCheckIcon className=\"h-4 w-4 mr-2\" />\n                Admin Requests\n              </Link>\n            )}\n            <div className=\"flex items-center space-x-2 text-sm text-gray-500\">\n              <ShieldCheckIcon className=\"h-5 w-5\" />\n              <span>Administrator Access</span>\n            </div>\n          </div>\n        </div>\n\n        {error && (\n          <div className=\"mb-6 bg-danger-50 border border-danger-200 rounded-md p-4\">\n            <p className=\"text-sm text-danger-700\">{error}</p>\n          </div>\n        )}\n\n        {/* Stats Cards */}\n        {stats && (\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8\">\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-primary-100 rounded-lg\">\n                  <UsersIcon className=\"h-6 w-6 text-primary-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Total Users</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.totalUsers}</p>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-warning-100 rounded-lg\">\n                  <ExclamationTriangleIcon className=\"h-6 w-6 text-warning-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Total Reports</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.totalReports}</p>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-danger-100 rounded-lg\">\n                  <ClockIcon className=\"h-6 w-6 text-danger-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Pending Reports</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.pendingReports}</p>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-success-100 rounded-lg\">\n                  <CheckCircleIcon className=\"h-6 w-6 text-success-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Resolution Rate</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.resolutionRate}%</p>\n                </div>\n              </div>\n            </div>\n          </div>\n        )}"}, {"file_name": "Campus-Shield/server/routes/admin.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js", "markdown_link": "- [Campus-Shield/server/routes/admin.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js)\n", "code_chunk": "res.json({\n        success: true,\n        requests: requestsWithUserInfo\n      });\n    }\n  } catch (error) {\n    console.error('Admin requests error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error while fetching admin requests'\n    });\n  }\n});\n\n// @route   POST /api/admin/requests/:requestId/approve\n// @desc    Approve an admin request\n// @access  Private (Moderator only)\nrouter.post('/requests/:requestId/approve', auth, moderator, async (req, res) => {\n  try {\n    const { requestId } = req.params;\n    const { notes } = req.body;\n    const adminUser = req.user;\n\n    if (isMongoConnected()) {\n      // Approve admin request in MongoDB\n      const request = await AdminRequest.findById(requestId);\n      if (!request) {\n        return res.status(404).json({ success: false, message: 'Admin request not found' });\n      }\n      request.status = 'approved';\n      request.reviewedBy = adminUser.userId;\n      request.reviewNotes = notes || '';\n      request.reviewedAt = new Date();\n      await request.save();\n      // Promote user to admin\n      await User.findByIdAndUpdate(request.userId, { role: 'admin' });\n      return res.json({\n        success: true,\n        message: 'Admin request approved successfully',\n        request\n      });\n    } else {\n      // Use memory store\n      const request = memoryStore.approveAdminRequest(requestId, adminUser.userId, notes || '');\n      \n      if (request) {\n        res.json({\n          success: true,\n          message: 'Admin request approved successfully',\n          request\n        });\n      } else {\n        res.status(404).json({\n          success: false,\n          message: 'Admin request not found'\n        });\n      }\n    }\n  } catch (error) {\n    console.error('Admin request approval error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error while approving admin request'\n    });\n  }\n});\n\n// @route   POST /api/admin/requests/:requestId/reject\n// @desc    Reject an admin request\n// @access  Private (Moderator only)\nrouter.post('/requests/:requestId/reject', auth, moderator, async (req, res) => {\n  try {\n    const { requestId } = req.params;\n    const { notes } = req.body;\n    const adminUser = req.user;\n\n    if (isMongoConnected()) {\n      // Reject admin request in MongoDB\n      const request = await AdminRequest.findById(requestId);\n      if (!request) {\n        return res.status(404).json({ success: false, message: 'Admin request not found' });\n      }\n      request.status = 'rejected';\n      request.reviewedBy = adminUser.userId;\n      request.reviewNotes = notes || '';\n      request.reviewedAt = new Date();\n      await request.save();\n      return res.json({\n        success: true,\n        message: 'Admin request rejected successfully',\n        request\n      });\n    } else {\n      // Use memory store\n      const request = memoryStore.rejectAdminRequest(requestId, adminUser.userId, notes || '');\n      \n      if (request) {\n        res.json({\n          success: true,\n          message: 'Admin request rejected successfully',\n          request\n        });\n      } else {\n        res.status(404).json({\n          success: false,\n          message: 'Admin request not found'\n        });\n      }\n    }\n  } catch (error) {\n    console.error('Admin request rejection error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error while rejecting admin request'\n    });\n  }\n});"}, {"file_name": "Campus-Shield/client/src/pages/AdminRequests.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminRequests.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx)\n", "code_chunk": "<div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Applicant Information</h3>\n                  <div className=\"grid grid-cols-2 gap-4\">\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Email:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.user?.email}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Role:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.role}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Department:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.department}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Urgency:</span>\n                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedRequest.urgency)}`}>\n                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}\n                      </span>\n                    </div>\n                  </div>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Experience</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.experience}</p>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Current Responsibilities</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.responsibilities}</p>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Reason for Admin Access</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.reason}</p>\n                </div>\n\n                {selectedRequest.contactInfo && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Additional Contact</h3>\n                    <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.contactInfo}</p>\n                  </div>\n                )}\n\n                {selectedRequest.status === 'pending' && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Review Notes</h3>\n                    <textarea\n                      value={reviewNotes}\n                      onChange={(e) => setReviewNotes(e.target.value)}\n                      className=\"input-field\"\n                      rows={3}\n                      placeholder=\"Add notes about your decision...\"\n                    />\n                  </div>\n                )}\n\n                {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Review Notes</h3>\n                    <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.reviewNotes}</p>\n                  </div>\n                )}"}, {"file_name": "Campus-Shield/server/routes/auth.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js", "markdown_link": "- [Campus-Shield/server/routes/auth.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js)\n", "code_chunk": "const user = memoryStore.createUser(userData);\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.status(201).json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }\n\n  } catch (error) {\n    console.error('Anonymous auth error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error during anonymous authentication'\n    });\n  }\n});\n\n// Enhanced /admin-login route with detailed logging\nrouter.post('/admin-login', [\n  body('email').isEmail().withMessage('Please enter a valid email'),\n  body('password').exists().withMessage('Password is required')\n], async (req, res) => {\n  try {\n    console.log('Admin login attempt:', req.body);\n\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      console.error('Validation errors:', errors.array());\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const { email, password } = req.body;\n\n    if (isMongoConnected()) {\n      const user = await User.findOne({ email });\n      if (!user) {\n        console.error('Admin user not found for email:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (user not found)'\n        });\n      }\n\n      const isMatch = await user.comparePassword(password);\n      if (!isMatch) {\n        console.error('Admin password mismatch for user:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (password mismatch)'\n        });\n      }\n\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        console.error('User does not have admin/moderator role:', email, user.role);\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      const token = generateToken(user._id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user._id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    } else {\n      // Use memory store\n      const user = memoryStore.findUserByEmail(email);\n      if (!user || !user.password) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Check password (with special handling for new admin accounts)\n      let isMatch = false;\n      if (user.email === 'normal@admin.com' && password === 'admin') {\n        isMatch = true;\n      } else if (user.email === 'Iapprove@admin.com' && password === 'approve') {\n        isMatch = true;\n      } else {\n        isMatch = await bcrypt.compare(password, user.password);\n      }\n      \n      if (!isMatch) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Only allow existing admins or moderators to login\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }"}]</code-reference>