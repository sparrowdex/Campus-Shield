# Incident Reporting System

# Incident Reporting System Tutorial

This tutorial guides you through implementing the Incident Reporting System for the CampusShield project. We'll focus on key components and their interactions.

<artifact ArtifactUUID="c58cfeff-319f-42e7-b71d-5781bc7b4457">1. Report Submission</artifact>

The core of incident reporting is handled by the `ReportIncident` component:

```typescript
// client/src/pages/ReportIncident.tsx

const ReportIncident: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    location: {
      coordinates: null,
      address: '',
      building: '',
      floor: ''
    },
    incidentTime: new Date().toISOString().slice(0, 16),
    attachments: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      // Append form data...

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  // Render form...
};
```

<artifact>2. Report Model</artifact>

The `Report` model defines the structure of incident reports:

```javascript
// server/models/Report.js

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'harassment',
      'assault',
      'theft',
      'vandalism',
      'suspicious_activity',
      'emergency',
      'safety_hazard',
      'discrimination',
      'bullying',
      'other'
    ]
  },
  // Other fields...
});
```

<artifact ArtifactUUID="e3c0ec13-dfad-42e6-a1b2-3fc28a9a2874">3. Report API Routes</artifact>

The server handles report submissions and retrieval:

```javascript
// server/routes/reports.js

router.post('/', auth, upload.array('attachments', 5), [
  // Validation middleware...
], async (req, res) => {
  try {
    // Create report...
    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      reportId: report._id
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    // Fetch reports...
    const reports = await Report.find({ reporterId: user.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      reports: reports.map(report => ({
        id: report._id,
        title: report.title,
        category: report.category,
        status: report.status,
        priority: report.priority,
        location: report.location,
        incidentTime: report.incidentTime,
        createdAt: report.createdAt,
        attachments: report.attachments || [],
        publicUpdates: report.publicUpdates || []
      }))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
```

<artifact ArtifactUUID="46f1d572-18c4-4388-8ce0-ee20e25ac6c3">4. Viewing Reports</artifact>

The `MyReports` component displays submitted reports:

```typescript
// client/src/pages/MyReports.tsx

const MyReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render reports...
};
```

<artifact ArtifactUUID="f0a5e10b-e223-4a69-8bd4-950729025d33">5. Incident Heatmap</artifact>

The `IncidentHeatMap` component visualizes incident locations:

```typescript
// client/src/components/IncidentHeatMap.tsx

const IncidentHeatMap: React.FC = () => {
  const [points, setPoints] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.reports)) {
          const pts = data.reports
            .filter((r: Report) => r.location && Array.isArray(r.location.coordinates))
            .map((r: Report) => [r.location.coordinates[1], r.location.coordinates[0]]);
          setPoints(pts);
        }
      } catch (err) {
        // Handle error
      }
    };
    fetchReports();
  }, []);

  // Render heatmap...
};
```

<artifact ArtifactUUID="4f4da99d-d924-41e1-b7b4-5f3cab95b42a">6. Authentication</artifact>

The `AuthContext` provides user authentication:

```typescript
// client/src/contexts/AuthContext.tsx

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context...
};
```

<artifact ArtifactUUID="e6794dff-6ce0-4e79-94b4-a81b379c01c8">7. Admin Dashboard</artifact>

The `AdminDashboard` component allows administrators to manage reports:

```typescript
// client/src/pages/AdminDashboard.tsx

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    // Fetch reports...
  };

  const fetchStats = async () => {
    // Fetch statistics...
  };

  // Render admin dashboard...
};
```

This tutorial covers the core components of the Incident Reporting System. Each section can be expanded for more detailed implementation.
## References:

<document-code-reference tutorial-step="incident-reporting-system">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/ReportIncident.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/components/IncidentHeatMap.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components"
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
<code-reference uuid='158bd647-4598-4ff1-9334-a9e9d1367498'>[{"file_name": "Campus-Shield/server/index.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js", "markdown_link": "- [Campus-Shield/server/index.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js)\n", "code_chunk": "const express = require('express');\nconst http = require('http');\nconst socketIo = require('socket.io');\nconst cors = require('cors');\nconst helmet = require('helmet');\nconst compression = require('compression');\nconst morgan = require('morgan');\nconst rateLimit = require('express-rate-limit');\nconst path = require('path');\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\n\n// Debug environment variables\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nconst connectDB = require('./config/database');\nconst authRoutes = require('./routes/auth');\nconst reportRoutes = require('./routes/reports');\nconst chatRoutes = require('./routes/chat');\nconst adminRoutes = require('./routes/admin');\nconst notificationsRoutes = require('./routes/notifications');\nconst { initializeSocket } = require('./services/socketService');\nconst { errorHandler } = require('./middleware/errorHandler');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server, {\n  cors: {\n    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",\n    methods: [\"GET\", \"POST\"]\n  }\n});\n\n// Connect to MongoDB (non-blocking)\nconnectDB().catch(err => {\n  console.error('Failed to connect to database:', err);\n  // Don't exit the process, let it continue\n});\n\n// Initialize Socket.io\ninitializeSocket(io);\n\n// Security middleware\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      scriptSrc: [\"'self'\"],\n      imgSrc: [\"'self'\", \"[REMOVED_DATA_URI]\n      connectSrc: [\"'self'\", \"ws:\", \"wss:\"]\n    }\n  }\n}));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes\n  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,\n  message: 'Too many requests from this IP, please try again later.',\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use('/api/', limiter);\n\n// Middleware\napp.use(compression());\napp.use(morgan('combined'));\n// Apply CORS globally before all routes\nconst allowedOrigins = process.env.CORS_ORIGIN\n  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())\n  : [\"http://localhost:3000\"];\nconsole.log('Allowed CORS origins:', allowedOrigins);\n\napp.use(cors({\n  origin: function(origin, callback) {\n    if (!origin) return callback(null, true);\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    return callback(new Error('Not allowed by CORS'));\n  },\n  credentials: true\n}));\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true, limit: '10mb' }));\n\n// Serve uploaded files\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  const health = {\n    status: 'OK',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n    environment: process.env.NODE_ENV || 'development',\n    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'\n  };\n  \n  res.status(200).json(health);\n});\n\n// API Routes\napp.use('/api/auth', authRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/chat', chatRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/notifications', notificationsRoutes);\n\n// Error handling middleware\napp.use(errorHandler);\n\n// 404 handler\napp.use('*', (req, res) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n});\n\nconst PORT = process.env.PORT || 5000;"}, {"file_name": "Campus-Shield/server/routes/reports.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js", "markdown_link": "- [Campus-Shield/server/routes/reports.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js)\n", "code_chunk": "const express = require('express');\nconst multer = require('multer');\nconst path = require('path');\nconst { body, validationResult, query } = require('express-validator');\nconst Report = require('../models/Report');\nconst auth = require('../middleware/auth');\nconst { categorizeReport, analyzeSentiment } = require('../services/aiService');\nconst memoryStore = require('../services/memoryStore');\n\nconst router = express.Router();\n\n// Check if MongoDB is connected\nconst isMongoConnected = () => {\n  return Report.db && Report.db.readyState === 1;\n};\n\n// Configure multer for file uploads\nconst storage = multer.diskStorage({\n  destination: (req, file, cb) => {\n    cb(null, 'uploads/');\n  },\n  filename: (req, file, cb) => {\n    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);\n    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));\n  }\n});\n\nconst upload = multer({\n  storage: storage,\n  limits: {\n    fileSize: 10 * 1024 * 1024, // 10MB limit\n  },\n  fileFilter: (req, file, cb) => {\n    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wav|mp3|pdf/;\n    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());\n    const mimetype = allowedTypes.test(file.mimetype);\n    \n    if (mimetype && extname) {\n      return cb(null, true);\n    } else {\n      cb(new Error('Only image, video, audio, and PDF files are allowed'));\n    }\n  }\n});\n\n// @route   POST /api/reports\n// @desc    Submit a new incident report\n// @access  Private\nrouter.post('/', auth, upload.array('attachments', 5), [\n  body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),\n  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),\n  body('category').isIn([\n    'harassment', 'assault', 'theft', 'vandalism', 'suspicious_activity',\n    'emergency', 'safety_hazard', 'discrimination', 'bullying', 'other'\n  ]).withMessage('Invalid category'),\n  // Add a custom sanitizer for coordinates\n  body('location.coordinates').customSanitizer(value => {\n    if (typeof value === 'string') {\n      try {\n        return JSON.parse(value);\n      } catch {\n        return value;\n      }\n    }\n    return value;\n  }),\n  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),\n  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),\n  body('incidentTime').optional().isISO8601().withMessage('Invalid date format')\n], async (req, res) => {\n  try {\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const {\n      title,\n      description,\n      category,\n      location,\n      incidentTime\n    } = req.body;\n\n    // Get user info\n    const user = req.user;\n\n    // Process attachments\n    const attachments = req.files ? req.files.map(file => ({\n      filename: file.filename,\n      originalName: file.originalname,\n      mimetype: file.mimetype,\n      size: file.size,\n      path: file.path\n    })) : [];\n\n    // Parse coordinates if sent as a string\n    let coordinates = location.coordinates;\n    if (typeof coordinates === 'string') {\n      try {\n        coordinates = JSON.parse(coordinates);\n      } catch (e) {\n        coordinates = undefined;\n      }\n    }\n\n    // Create report data\n    const reportData = {\n      reporterId: user.userId,\n      title,\n      description,\n      category,\n      location: {\n        type: 'Point',\n        coordinates: coordinates || location.coordinates,\n        address: location.address || '',\n        building: location.building || '',\n        floor: location.floor || ''\n      },\n      incidentTime: incidentTime || new Date(),\n      attachments,\n      isAnonymous: user.isAnonymous || true,\n      ipAddress: req.ip,\n      userAgent: req.get('User-Agent')\n    };"}, {"file_name": "Campus-Shield/client/src/pages/AdminDashboard.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminDashboard.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx)\n", "code_chunk": "{/* Heatmap Section */}\n        <div className=\"mt-8 bg-white p-6 rounded-lg border border-gray-200\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Incident Heatmap</h3>\n          <IncidentHeatMap />\n        </div>\n      </div>\n\n      {/* Report Detail Modal */}\n      {selectedReport && (\n        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50\">\n          <div className=\"bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-60\">\n            <div className=\"p-6\">\n              <div className=\"flex items-center justify-between mb-4\">\n                <h2 className=\"text-xl font-bold text-gray-900\">Report Details</h2>\n                <button\n                  onClick={() => setSelectedReport(null)}\n                  className=\"text-gray-400 hover:text-gray-600\"\n                >\n                  <XMarkIcon className=\"h-6 w-6\" />\n                </button>\n              </div>\n\n              <div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-semibold text-gray-900 mb-2\">{selectedReport.title}</h3>\n                  <div className=\"flex items-center space-x-3 mb-3\">\n                    <span className={`badge ${statusColors[selectedReport.status as keyof typeof statusColors]}`}>\n                      {selectedReport.status.replace('_', ' ').toUpperCase()}\n                    </span>\n                    <span className={`badge ${priorityColors[selectedReport.priority as keyof typeof priorityColors]}`}>\n                      {selectedReport.priority.toUpperCase()}\n                    </span>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Description</h4>\n                  <p className=\"text-gray-600\">{selectedReport.description}</p>\n                </div>\n\n                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Category</h4>\n                    <p className=\"text-gray-600 capitalize\">\n                      {categoryLabels[selectedReport.category as keyof typeof categoryLabels] || selectedReport.category}\n                    </p>\n                  </div>\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Incident Time</h4>\n                    <p className=\"text-gray-600\">{formatDate(selectedReport.incidentTime)}</p>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Location</h4>\n                  <div className=\"text-gray-600\">\n                    {selectedReport.location?.address && <p>{selectedReport.location.address}</p>}\n                    {selectedReport.location?.building && <p>Building: {selectedReport.location.building}</p>}\n                    {selectedReport.location?.floor && <p>Floor: {selectedReport.location.floor}</p>}\n                    {!selectedReport.location?.address && !selectedReport.location?.building && !selectedReport.location?.floor && (\n                      <p className=\"text-gray-500\">Location not specified</p>\n                    )}\n                  </div>\n                </div>"}, {"file_name": "Campus-Shield/SETUP_GUIDE.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md", "markdown_link": "- [Campus-Shield/SETUP_GUIDE.md](https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md)\n", "code_chunk": "# \ud83d\udee1\ufe0f CampusShield Setup Guide for Beginners\n\n## \ud83d\udccb Table of Contents\n1. [What is CampusShield?](#what-is-campusshield)\n2. [Cloning from GitHub](#cloning-from-github)\n3. [Prerequisites](#prerequisites)\n4. [Installation Steps](#installation-steps)\n5. [Running the Application](#running-the-application)\n6. [Understanding the Project Structure](#understanding-the-project-structure)\n7. [Common Issues & Solutions](#common-issues--solutions)\n8. [Development Workflow](#development-workflow)\n9. [Testing the Features](#testing-the-features)\n10. [Contributing](#contributing)\n\n---\n\n## \ud83c\udfaf What is CampusShield?\n\nCampusShield is a **privacy-first campus safety platform** that allows students to:\n- **Report incidents anonymously** with location tracking\n- **Chat securely** with campus authorities\n- **Track report status** and updates\n- **View safety analytics** and heatmaps\n\n---\n\n## \ud83d\ude80 Cloning from GitHub\n\nIf you are starting from the GitHub repository:\n```bash\ngit clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd CampusShield\n```\n\n---\n\n## \ud83d\udccb Prerequisites\n\nBefore you start, make sure you have these installed:\n\n### **Required Software:**\n- \u2705 **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)\n- \u2705 **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)\n- \u2705 **Git** (optional) - [Download here](https://git-scm.com/)\n\n### **How to Check if Installed:**\nOpen Command Prompt and type:\n```bash\nnode --version\nnpm --version\nmongod --version\n```\n\n---\n\n## \ud83d\ude80 Installation Steps\n\n### **Step 1: Download the Project**\n1. **Download** the CampusShield project files (or clone from GitHub)\n2. **Extract** to a folder (e.g., `C:\\CampusShield`)\n3. **Open Command Prompt** in that folder\n\n### **Step 2: Install Dependencies**\n```bash\n# Install backend dependencies\ncd server\nnpm install\n\n# Install frontend dependencies\ncd ../client\nnpm install\n```\n\n### **Step 3: Set Up MongoDB**\n1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)\n2. **Install with default settings** (Complete installation)\n3. **MongoDB will run as a Windows Service** (starts automatically)\n\n### **Step 4: Create Environment File**\n1. **Navigate to server folder**: `cd server`\n2. **Copy `.env.example` to `.env`**:\n   ```bash\n   copy .env.example .env\n   # Or manually create .env and copy the contents from .env.example\n   ```\n3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)\n\n### **Step 5: (Optional) Seed Admin/Moderator Accounts**\nIf you want demo admin/moderator accounts, run:\n```bash\ncd server\nnode seedAdmins.js\n```\n\n---\n\n## \ud83c\udfc3\u200d\u2642\ufe0f Running the Application\n\n### **You Need 2 Command Prompt Windows:**\n\n#### **Window 1: Backend Server**\n```bash\ncd server\nnpm run dev\n```\n**Expected Output:**\n```\n\ud83d\udce6 MongoDB Connected: localhost\n\ud83d\ude80 CampusShield server running on port 5000\n\ud83d\udcca Health check: http://localhost:5000/health\n\ud83d\udd12 Environment: development\n```\n\n#### **Window 2: Frontend Server**\n```bash\ncd client\nnpm start\n```\n**Expected Output:**\n```\nCompiled successfully!\n\nYou can now view campus-shield in the browser.\n\n  Local:            http://localhost:3000\n  On Your Network:  http://192.168.x.x:3000\n```\n\n### **Access the Application:**\n- **Frontend**: http://localhost:3000\n- **Backend API**: http://localhost:5000\n- **Health Check**: http://localhost:5000/health\n\n---\n\n## \ud83d\udcf1 Mobile Responsiveness\nCampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.\n\n---\n\n## \ud83d\udcc1 Understanding the Project Structure"}, {"file_name": "Campus-Shield/server/models/Report.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js", "markdown_link": "- [Campus-Shield/server/models/Report.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js)\n", "code_chunk": "const mongoose = require('mongoose');\n\nconst reportSchema = new mongoose.Schema({\n  // Anonymous reporter identification\n  reporterId: {\n    type: String,\n    required: true,\n    index: true\n  },\n  \n  // Report content\n  title: {\n    type: String,\n    required: true,\n    maxlength: 200,\n    trim: true\n  },\n  \n  description: {\n    type: String,\n    required: true,\n    maxlength: 2000,\n    trim: true\n  },\n  \n  // Incident categorization\n  category: {\n    type: String,\n    required: true,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  // AI-generated fields\n  aiCategory: {\n    type: String,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  priority: {\n    type: String,\n    enum: ['low', 'medium', 'high', 'critical'],\n    default: 'medium'\n  },\n  \n  sentiment: {\n    type: String,\n    enum: ['positive', 'neutral', 'negative', 'distressed'],\n    default: 'neutral'\n  },\n  \n  // Location data (generalized for privacy)\n  location: {\n    type: {\n      type: String,\n      enum: ['Point'],\n      default: 'Point'\n    },\n    coordinates: {\n      type: [Number], // [longitude, latitude]\n      required: true,\n      index: '2dsphere'\n    },\n    address: {\n      type: String,\n      maxlength: 200\n    },\n    building: {\n      type: String,\n      maxlength: 100\n    },\n    floor: {\n      type: String,\n      maxlength: 20\n    }\n  },\n  \n  // Timestamp\n  incidentTime: {\n    type: Date,\n    required: true,\n    default: Date.now\n  },\n  \n  // Media attachments\n  attachments: [{\n    filename: String,\n    originalName: String,\n    mimetype: String,\n    size: Number,\n    path: String,\n    uploadedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Report status and handling\n  status: {\n    type: String,\n    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed'],\n    default: 'pending'\n  },\n  \n  assignedTo: {\n    type: mongoose.Schema.Types.ObjectId,\n    ref: 'User'\n  },\n  \n  // Admin notes (private)\n  adminNotes: [{\n    note: String,\n    addedBy: {\n      type: mongoose.Schema.Types.ObjectId,\n      ref: 'User'\n    },\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Public updates for reporter\n  publicUpdates: [{\n    message: String,\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Privacy and data retention\n  isAnonymous: {\n    type: Boolean,\n    default: true\n  },\n  \n  dataRetentionDate: {\n    type: Date,\n    default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years\n  },\n  \n  // Metadata\n  ipAddress: {\n    type: String,\n    required: false // Hashed for privacy\n  },\n  \n  userAgent: {\n    type: String,\n    required: false\n  },\n  \n  createdAt: {\n    type: Date,\n    default: Date.now,\n    index: true\n  },\n  \n  updatedAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Indexes for performance\nreportSchema.index({ createdAt: -1 });\nreportSchema.index({ status: 1, createdAt: -1 });\nreportSchema.index({ category: 1, createdAt: -1 });\nreportSchema.index({ priority: 1, status: 1 });\nreportSchema.index({ 'location.coordinates': '2dsphere' });\nreportSchema.index({ dataRetentionDate: 1 });\n\n// Pre-save middleware\nreportSchema.pre('save', function(next) {\n  this.updatedAt = Date.now();\n  next();\n});\n\n// Method to add admin note\nreportSchema.methods.addAdminNote = function(note, adminId) {\n  this.adminNotes.push({\n    note,\n    addedBy: adminId\n  });\n  return this.save();\n};\n\n// Method to add public update\nreportSchema.methods.addPublicUpdate = function(message) {\n  this.publicUpdates.push({\n    message\n  });\n  return this.save();\n};"}, {"file_name": "Campus-Shield/client/src/components/IncidentHeatMap.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx", "markdown_link": "- [Campus-Shield/client/src/components/IncidentHeatMap.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx)\n", "code_chunk": "import React, { useEffect, useState } from 'react';\nimport { MapContainer, TileLayer, useMap } from 'react-leaflet';\nimport 'leaflet/dist/leaflet.css';\nimport 'leaflet.heat';\n\ninterface Report {\n  _id: string;\n  location: {\n    coordinates: [number, number]; // [lng, lat]\n  };\n}\n\nconst HeatmapLayer: React.FC<{ points: [number, number][] }> = ({ points }) => {\n  const map = useMap();\n  useEffect(() => {\n    // @ts-ignore\n    if (window.L && points.length) {\n      // Remove existing heat layer if any\n      if ((map as any)._heatLayer) {\n        (map as any).removeLayer((map as any)._heatLayer);\n      }\n      // @ts-ignore\n      const heat = window.L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });\n      heat.addTo(map);\n      (map as any)._heatLayer = heat;\n    }\n  }, [map, points]);\n  return null;\n};\n\nconst IncidentHeatMap: React.FC = () => {\n  const [points, setPoints] = useState<[number, number][]>([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const fetchReports = async () => {\n      try {\n        const token = localStorage.getItem('token');\n        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {\n          headers: {\n            'Authorization': `Bearer ${token}`,\n            'Content-Type': 'application/json'\n          }\n        });\n        const data = await res.json();\n        if (data.success && Array.isArray(data.reports)) {\n          // Convert [lng, lat] to [lat, lng] for Leaflet\n          const pts = data.reports\n            .filter((r: Report) => r.location && Array.isArray(r.location.coordinates))\n            .map((r: Report) => [r.location.coordinates[1], r.location.coordinates[0]]);\n          setPoints(pts);\n        }\n      } catch (err) {\n        // Handle error\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchReports();\n  }, []);\n\n  return (\n    <div className=\"w-full h-[500px] rounded shadow overflow-hidden\">\n      {loading ? (\n        <div className=\"flex items-center justify-center h-full\">Loading heatmap...</div>\n      ) : (\n        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>\n          <TileLayer\n            attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\n            url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"\n          />\n          <HeatmapLayer points={points} />\n        </MapContainer>\n      )}\n    </div>\n  );\n};\n\nexport default IncidentHeatMap;"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// Admin request operations\n  createAdminRequest(userId, requestData) {\n    const request = {\n      id: this.nextRequestId.toString(),\n      userId,\n      ...requestData,\n      status: 'pending', // pending, approved, rejected\n      createdAt: new Date().toISOString(),\n      reviewedBy: null,\n      reviewedAt: null,\n      reviewNotes: null\n    };\n    this.adminRequests.set(request.id, request);\n    this.nextRequestId++;\n    return request;\n  }\n\n  getAdminRequests(status = null) {\n    const requests = Array.from(this.adminRequests.values());\n    if (status) {\n      return requests.filter(req => req.status === status);\n    }\n    return requests;\n  }\n\n  updateAdminRequest(requestId, updates) {\n    const request = this.adminRequests.get(requestId);\n    if (request) {\n      Object.assign(request, updates, { \n        reviewedAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString()\n      });\n      this.adminRequests.set(requestId, request);\n      return request;\n    }\n    return null;\n  }\n\n  approveAdminRequest(requestId, approvedBy, notes = '') {\n    const request = this.updateAdminRequest(requestId, {\n      status: 'approved',\n      reviewedBy: approvedBy,\n      reviewNotes: notes\n    });\n\n    if (request) {\n      // Promote user to admin\n      this.updateUser(request.userId, { role: 'admin' });\n    }\n\n    return request;\n  }\n\n  rejectAdminRequest(requestId, rejectedBy, notes = '') {\n    return this.updateAdminRequest(requestId, {\n      status: 'rejected',\n      reviewedBy: rejectedBy,\n      reviewNotes: notes\n    });\n  }\n\n  // Report operations\n  createReport(reportData) {\n    const report = {\n      id: this.nextReportId.toString(),\n      ...reportData,\n      status: 'pending',\n      priority: 'medium',\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString(),\n      attachments: [],\n      publicUpdates: []\n    };\n    this.reports.set(report.id, report);\n    this.nextReportId++;\n    return report;\n  }\n\n  findReportsByUserId(userId) {\n    const userReports = [];\n    for (const report of this.reports.values()) {\n      if (report.userId === userId) {\n        userReports.push(report);\n      }\n    }\n    return userReports;\n  }\n\n  findReportById(id) {\n    return this.reports.get(id) || null;\n  }\n\n  updateReport(id, updates) {\n    const report = this.reports.get(id);\n    if (report) {\n      Object.assign(report, updates, { updatedAt: new Date().toISOString() });\n      this.reports.set(id, report);\n      return report;\n    }\n    return null;\n  }\n\n  // Chat operations\n  createChatRoom(roomData) {\n    const room = {\n      roomId: this.nextRoomId.toString(),\n      ...roomData,\n      createdAt: new Date().toISOString(),\n      lastMessage: null\n    };\n    this.chatRooms.set(room.roomId, room);\n    this.nextRoomId++;\n    return room;\n  }\n\n  findChatRoomByReportId(reportId) {\n    for (const room of this.chatRooms.values()) {\n      if (room.reportId === reportId) {\n        return room;\n      }\n    }\n    return null;\n  }\n\n  findChatRoomsByUserId(userId) {\n    const userRooms = [];\n    for (const room of this.chatRooms.values()) {\n      if (room.userId === userId) {\n        userRooms.push(room);\n      }\n    }\n    return userRooms;\n  }\n\n  createMessage(messageData) {\n    const message = {\n      id: this.nextMessageId.toString(),\n      ...messageData,\n      timestamp: new Date().toISOString()\n    };\n    this.messages.set(message.id, message);\n    this.nextMessageId++;\n    return message;\n  }\n\n  findMessagesByRoomId(roomId) {\n    const roomMessages = [];\n    for (const message of this.messages.values()) {\n      if (message.roomId === roomId) {\n        roomMessages.push(message);\n      }\n    }\n    return roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));\n  }\n\n  // Admin operations\n  getAllReports() {\n    return Array.from(this.reports.values());\n  }\n\n  getAllUsers() {\n    return Array.from(this.users.values());\n  }"}, {"file_name": "Campus-Shield/README.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/README.md", "markdown_link": "- [Campus-Shield/README.md](https://github.com/sparrowdex/Campus-Shield/blob/main/README.md)\n", "code_chunk": "# CampusShield\n\nCampusShield is a privacy-first campus safety platform for anonymous incident reporting, real-time chat, and admin management. Built for hackathons and real-world impact.\n\n---\n\n## \ud83d\ude80 Features\n\n- **Anonymous Incident Reporting**: Students can report safety incidents without revealing their identity.\n- **Real-time Chat**: Secure, role-based chat between users and campus security/admins.\n- **Role-based Access**: User, Admin, and Moderator roles with custom dashboards and permissions.\n- **Admin Dashboard**: Manage reports, view analytics, assign/resolve cases, and monitor campus safety.\n- **Incident Heatmap**: Visualize incident locations and patterns with Leaflet.js.\n- **AI-Powered Categorization**: Automatic classification and prioritization of reports.\n- **Notifications**: (Pluggable) Real-time in-app notifications for new messages, assignments, and status changes.\n- **Mobile Responsive**: Usable on desktop and mobile devices.\n- **Security & Privacy**: JWT authentication, minimal data collection, and strong privacy defaults.\n\n---\n\n## \ud83d\udee0\ufe0f Tech Stack\n\n- **Frontend**: React, TypeScript, Tailwind CSS\n- **Backend**: Node.js, Express.js\n- **Database**: MongoDB, Mongoose\n- **Real-time**: Socket.IO\n- **Maps**: Leaflet.js\n- **Authentication**: JWT (JSON Web Tokens)\n\n---\n\n## \ud83e\uddd1\u200d\ud83d\udcbb Demo/Test Accounts\n\n- **Admin**  \n  Email: `admin1@example.com`  \n  Password: `adminpassword1`\n\n- **Moderator**  \n  Email: `moderator1@example.com`  \n  Password: `moderatorpassword1`\n\n- **User**  \n  Register a new account or use anonymous login.\n  Email: `user@example.com`\n  Password: `userpassword`\n\n---\n\n## \u26a1 Quick Start\n\n1. **Clone the repo:**\n   ```bash\n   git clone https://github.com/yourusername/campus-shield.git\n   cd campus-shield\n   ```\n2. **Install dependencies:**\n   ```bash\n   cd server && npm install\n   cd ../client && npm install\n   ```\n3. **Set up environment variables:**\n   - Copy `.env.example` to `.env` in both `server/` and `client/` if needed.\n4. **Start MongoDB locally (or use Atlas).**\n5. **Start the backend:**\n   ```bash\n   cd server && npm start\n   ```\n6. **Start the frontend:**\n   ```bash\n   cd ../client && npm start\n   ```\n7. **Open [http://localhost:3000](http://localhost:3000) to view the app.**\n\n---\n\n## \ud83d\udcf1 Mobile & Responsiveness\n- The UI is responsive and works on mobile and desktop.\n- For best results, test in Chrome DevTools mobile view.\n\n---\n\n## \ud83d\udca1 Why We Built This (Impact)\n\n- **Problem:** Students often hesitate to report safety incidents due to privacy concerns and lack of trust.\n- **Solution:** CampusShield enables anonymous, secure reporting and real-time support, empowering students and improving campus safety.\n- **Impact:** More reports, faster admin response, and a safer, more connected campus community.\n\n---\n\n## \ud83d\udce3 Notifications (Pluggable)\n- In-app notification bar for new chat messages, assignments, and status changes (see below for integration instructions).\n- (Optional) Email notifications can be added with Nodemailer.\n\n---\n\n## \ud83d\udcc2 Project Structure\n\n```\n\u251c\u2500\u2500 client/          # React frontend\n\u251c\u2500\u2500 server/          # Node.js backend\n\u251c\u2500\u2500 docs/            # Documentation\n\u2514\u2500\u2500 scripts/         # Utility scripts\n```\n\n---\n\n---\n\n## Setup\n\nFor detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).\n\n---"}, {"file_name": "Campus-Shield/client/src/pages/MyReports.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/MyReports.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx)\n", "code_chunk": "{/* Reports List */}\n        {filteredReports.length === 0 ? (\n          <div className=\"text-center py-12\">\n            <ClockIcon className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />\n            <h3 className=\"text-lg font-medium text-gray-900 mb-2\">\n              {reports.length === 0 ? 'No reports yet' : 'No reports match your search'}\n            </h3>\n            <p className=\"text-gray-600\">\n              {reports.length === 0 \n                ? 'Submit your first incident report to get started.'\n                : 'Try adjusting your search or filter criteria.'\n              }\n            </p>\n          </div>\n        ) : (\n          <div className=\"space-y-4\">\n            {filteredReports.map((report) => (\n              <div\n                key={report.id}\n                className=\"border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full\"\n                onClick={() => setSelectedReport(report)}\n              >\n                <div className=\"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2\">\n                  <div className=\"flex-1 w-full\">\n                    <div className=\"flex flex-wrap items-center gap-2 mb-2\">\n                      <h3 className=\"text-lg font-semibold text-gray-900 break-words\">{report.title}</h3>\n                      <span className={`badge ${statusColors[report.status as keyof typeof statusColors]}`}>{report.status.replace('_', ' ').toUpperCase()}</span>\n                      <span className={`badge ${priorityColors[report.priority as keyof typeof priorityColors]}`}>{report.priority.toUpperCase()}</span>\n                    </div>\n                    <p className=\"text-gray-600 mb-3 line-clamp-2 break-words\">\n                      {report.description}\n                    </p>\n                    <div className=\"flex flex-col sm:flex-row flex-wrap gap-2 text-sm text-gray-500\">\n                      <div className=\"flex items-center space-x-1\">\n                        <CalendarIcon className=\"h-4 w-4\" />\n                        <span>{report.incidentTime ? formatDate(report.incidentTime) : 'No date'}</span>\n                      </div>\n                      <div className=\"flex items-center space-x-1\">\n                        <MapPinIcon className=\"h-4 w-4\" />\n                        <span>{report.location?.address || 'Location not specified'}</span>\n                      </div>\n                      <div className=\"flex items-center space-x-1\">\n                        <span className=\"capitalize\">\n                          {report.category ? categoryLabels[report.category as keyof typeof categoryLabels] || report.category : 'Unknown'}\n                        </span>\n                      </div>\n                    </div>\n                  </div>\n                  <div className=\"flex flex-row flex-wrap items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4\">\n                    {report.attachments && report.attachments.length > 0 && (\n                      <span className=\"text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded\">\n                        {report.attachments.length} file{report.attachments.length !== 1 ? 's' : ''}\n                      </span>\n                    )}\n                    {report.publicUpdates && report.publicUpdates.length > 0 && (\n                      <span className=\"text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded\">\n                        {report.publicUpdates.length} update{report.publicUpdates.length !== 1 ? 's' : ''}\n                      </span>\n                    )}\n                    <EyeIcon className=\"h-5 w-5 text-gray-400\" />\n                  </div>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </div>"}, {"file_name": "Campus-Shield/env.example", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/env.example", "markdown_link": "- [Campus-Shield/env.example](https://github.com/sparrowdex/Campus-Shield/blob/main/env.example)\n", "code_chunk": "# CampusShield Environment Configuration\n\n# Server Configuration\nNODE_ENV=development\nPORT=5000\nCORS_ORIGIN=http://localhost:3000\n\n# Database Configuration\nMONGODB_URI=mongodb://localhost:27017/campusshield\n\n# JWT Configuration\nJWT_SECRET=your-super-secret-jwt-key-change-this-in-production\n\n# Rate Limiting\nRATE_LIMIT_WINDOW=900000\nRATE_LIMIT_MAX_REQUESTS=100\n\n# File Upload Configuration\nMAX_FILE_SIZE=10485760\nUPLOAD_PATH=uploads\n\n# Security Configuration\nBCRYPT_ROUNDS=12\n\n# AI/ML Service Configuration (for future integration)\nAI_SERVICE_URL=\nAI_SERVICE_KEY=\n\n# Notification Services (for future integration)\nFIREBASE_PROJECT_ID=\nFIREBASE_PRIVATE_KEY=\nFIREBASE_CLIENT_EMAIL=\n\nTWILIO_ACCOUNT_SID=\nTWILIO_AUTH_TOKEN=\nTWILIO_PHONE_NUMBER=\n\nSENDGRID_API_KEY=\nSENDGRID_FROM_EMAIL=\n\n# Maps Configuration\nGOOGLE_MAPS_API_KEY=\nMAPBOX_ACCESS_TOKEN=\n\n# File Storage (for future integration)\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nAWS_REGION=\nAWS_S3_BUCKET=\n\n# Logging Configuration\nLOG_LEVEL=info\nLOG_FILE=logs/app.log\n\n# Data Retention (in days)\nUSER_DATA_RETENTION_DAYS=365\nREPORT_DATA_RETENTION_DAYS=730"}, {"file_name": "Campus-Shield/client/src/pages/ReportIncident.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/ReportIncident.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx)\n", "code_chunk": "<div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                <div>\n                  <label htmlFor=\"address\" className=\"form-label\">\n                    Address\n                  </label>\n                  <input\n                    type=\"text\"\n                    id=\"address\"\n                    name=\"location.address\"\n                    value={formData.location.address}\n                    onChange={handleInputChange}\n                    className=\"input-field\"\n                    placeholder=\"Street address or general area\"\n                  />\n                </div>\n\n                <div>\n                  <label htmlFor=\"building\" className=\"form-label\">\n                    Building\n                  </label>\n                  <input\n                    type=\"text\"\n                    id=\"building\"\n                    name=\"location.building\"\n                    value={formData.location.building}\n                    onChange={handleInputChange}\n                    className=\"input-field\"\n                    placeholder=\"Building name or number\"\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label htmlFor=\"floor\" className=\"form-label\">\n                  Floor/Room\n                </label>\n                <input\n                  type=\"text\"\n                  id=\"floor\"\n                  name=\"location.floor\"\n                  value={formData.location.floor}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"Floor number or room number\"\n                />\n              </div>\n\n              <div className=\"flex items-center space-x-4\">\n                <button\n                  type=\"button\"\n                  onClick={handleLocationClick}\n                  className=\"btn-secondary\"\n                >\n                  <MapPinIcon className=\"h-4 w-4 mr-2\" />\n                  Use My Current Location\n                </button>\n                {formData.location.coordinates && (\n                  <span className=\"text-sm text-success-600\">\n                    \u2713 Location captured\n                  </span>\n                )}\n              </div>\n            </div>\n          )}\n\n          {/* Step 3: Attachments */}\n          {currentStep === 3 && (\n            <div className=\"space-y-6\">\n              <div className=\"bg-secondary-50 border border-secondary-200 rounded-lg p-4\">\n                <div className=\"flex items-center mb-2\">\n                  <CameraIcon className=\"h-5 w-5 text-secondary-600 mr-2\" />\n                  <h3 className=\"font-medium text-secondary-900\">Attachments (Optional)</h3>\n                </div>\n                <p className=\"text-sm text-secondary-700\">\n                  You can upload photos, videos, or documents related to the incident. Maximum 5 files, 10MB each.\n                </p>\n              </div>\n\n              <div>\n                <button\n                  type=\"button\"\n                  onClick={() => fileInputRef.current?.click()}\n                  className=\"btn-secondary w-full\"\n                >\n                  <DocumentIcon className=\"h-4 w-4 mr-2\" />\n                  Choose Files\n                </button>\n                <input\n                  ref={fileInputRef}\n                  type=\"file\"\n                  multiple\n                  accept=\"image/*,video/*,audio/*,.pdf\"\n                  onChange={handleFileUpload}\n                  className=\"hidden\"\n                />\n              </div>"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "{/* Features Section */}\n      <section className=\"bg-gray-50 py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              Why Choose CampusShield?\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Our privacy-first approach ensures you can report safety concerns without fear, \n              while powerful features help keep everyone informed and protected.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\n            {features.map((feature, index) => (\n              <div key={index} className=\"card hover:shadow-md transition-shadow duration-200\">\n                <div className=\"flex items-center mb-4\">\n                  <feature.icon className=\"h-8 w-8 text-primary-600 mr-3\" />\n                  <h3 className=\"text-lg font-semibold text-gray-900\">\n                    {feature.title}\n                  </h3>\n                </div>\n                <p className=\"text-gray-600\">\n                  {feature.description}\n                </p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      {/* How It Works Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              How It Works\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Simple, secure, and anonymous reporting in just a few steps.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">\n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">1</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Report Incident</h3>\n              <p className=\"text-gray-600\">\n                Submit a detailed report with location, description, and optional media attachments.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">2</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">AI Processing</h3>\n              <p className=\"text-gray-600\">\n                Our AI categorizes and prioritizes your report for appropriate response.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">3</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Stay Updated</h3>\n              <p className=\"text-gray-600\">\n                Receive updates on your report and chat with authorities if needed.\n              </p>\n            </div>\n          </div>\n        </div>\n      </section>"}]</code-reference>