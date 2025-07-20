# AdminDashboard Component

# AdminDashboard Component

The AdminDashboard component is a crucial part of the Campus-Shield application, providing administrators with a comprehensive overview of system statistics, reports, and management tools. This React component integrates various features to enable efficient monitoring and control of the campus safety reporting system.

## <artifact ArtifactUUID="eba01d83-237e-4fa2-b40d-1acb336a471c">Core Functionality and Data Fetching</artifact>

<document-code-reference section="<artifact ArtifactUUID="eba01d83-237e-4fa2-b40d-1acb336a471c">Core Functionality and Data Fetching</artifact>">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/AdminDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
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

The AdminDashboard component utilizes React hooks to manage state and side effects. It fetches essential data from the server upon component mount:

```typescript
useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  try {
    const [statsRes, activeChatsRes] = await Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }),
      fetch(`${process.env.REACT_APP_API_URL}/api/admin/active-chats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    ]);
    // ... handle responses and update state
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

This function fetches dashboard statistics, active chats, reports, and heatmap data from the server.

## <artifact ArtifactUUID="d1d9c947-40cb-46f2-ac10-b271c8d7b9b0">State Management and Data Display</artifact>

<document-code-reference section="<artifact ArtifactUUID="d1d9c947-40cb-46f2-ac10-b271c8d7b9b0">State Management and Data Display</artifact>">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/AdminDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
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

The component manages various states to handle loading, errors, and data display:

```typescript
const [stats, setStats] = useState<DashboardStats | null>(null);
const [reports, setReports] = useState<Report[]>([]);
const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [selectedReport, setSelectedReport] = useState<Report | null>(null);
const [filter, setFilter] = useState('all');
const [priorityFilter, setPriorityFilter] = useState('all');
const [categoryFilter, setCategoryFilter] = useState('all');
```

These states are used to render different sections of the dashboard, including statistics cards, reports management, and filtering options.

## Report Management and Filtering

<document-code-reference section="Report Management and Filtering">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/MyReports.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/server/routes/reports.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  },
  {
    "name": "Campus-Shield/client/src/reportWebVitals.ts",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/reportWebVitals.ts",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src"
  },
  {
    "name": "Campus-Shield/server/index.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server"
  }
]}
</document-code-reference>

The component implements filtering functionality for reports:

```typescript
const filteredReports = reports.filter(report => {
  const matchesStatus = filter === 'all' || report.status === filter;
  const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
  const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
  return matchesStatus && matchesPriority && matchesCategory;
});
```

This allows administrators to view reports based on status, priority, and category.

## <artifact ArtifactUUID="8f5ee8bc-912a-4751-834d-847198275967">User Interface and Responsive Design</artifact>

<document-code-reference section="<artifact ArtifactUUID="8f5ee8bc-912a-4751-834d-847198275967">User Interface and Responsive Design</artifact>">
{"files": [
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
  {
    "name": "Campus-Shield/client/src/pages/AdminDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
  },
  {
    "name": "Campus-Shield/server/index.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server"
  }
]}
</document-code-reference>

The AdminDashboard component features a responsive design, adapting to different screen sizes:

```jsx
{/* Desktop Table View */}
<div className="hidden md:block overflow-x-auto">
  {/* ... table structure ... */}
</div>

{/* Mobile Card View */}
<div className="md:hidden p-4 space-y-4">
  {/* ... mobile-friendly card layout ... */}
</div>
```

This ensures a seamless experience across various devices.

## Integration with External Components

<document-code-reference section="Integration with External Components">
{"files": [
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
  },
  {
    "name": "Campus-Shield/client/src/components/common/NotificationBar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/common/NotificationBar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/common"
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
  }
]}
</document-code-reference>

The dashboard integrates several external components:

- LoadingSpinner for loading states
- IncidentHeatMap for visualizing incident locations
- Various icons from @heroicons/react for UI elements

## Authentication and Authorization

<document-code-reference section="Authentication and Authorization">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/AdminDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
  },
  {
    "name": "Campus-Shield/server/middleware/moderator.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/middleware/moderator.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/middleware"
  },
  {
    "name": "Campus-Shield/server/routes/auth.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/routes"
  }
]}
</document-code-reference>

The component leverages the AuthContext to ensure only authorized users can access the dashboard:

```typescript
const { user } = useAuth();
const currentUserId = user?.id;
```

This integration with the authentication system helps maintain security and access control.

## Error Handling and User Feedback

<document-code-reference section="Error Handling and User Feedback">
{"files": [
  {
    "name": "Campus-Shield/server/middleware/errorHandler.js",
    "description": "JavaScript/TypeScript implementation file containing request handlers and business logic",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/middleware/errorHandler.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/middleware"
  },
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
  {
    "name": "Campus-Shield/client/src/pages/AdminDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/components/layout/Navbar.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout"
  }
]}
</document-code-reference>

The component implements error handling and provides user feedback:

```jsx
{error && (
  <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
    <p className="text-sm text-danger-700">{error}</p>
  </div>
)}
```

This ensures that users are informed of any issues during data fetching or interactions.

In summary, the AdminDashboard component serves as a central hub for administrators, offering a comprehensive set of tools and visualizations to manage and monitor the Campus-Shield system effectively.
## References:
### Code:
<code-reference uuid='31685de9-e544-4aff-b178-8f5334e5ea99'>[{"file_name": "Campus-Shield/server/index.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js", "markdown_link": "- [Campus-Shield/server/index.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js)\n", "code_chunk": "const express = require('express');\nconst http = require('http');\nconst socketIo = require('socket.io');\nconst cors = require('cors');\nconst helmet = require('helmet');\nconst compression = require('compression');\nconst morgan = require('morgan');\nconst rateLimit = require('express-rate-limit');\nconst path = require('path');\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\n\n// Debug environment variables\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nconst connectDB = require('./config/database');\nconst authRoutes = require('./routes/auth');\nconst reportRoutes = require('./routes/reports');\nconst chatRoutes = require('./routes/chat');\nconst adminRoutes = require('./routes/admin');\nconst notificationsRoutes = require('./routes/notifications');\nconst { initializeSocket } = require('./services/socketService');\nconst { errorHandler } = require('./middleware/errorHandler');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server, {\n  cors: {\n    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",\n    methods: [\"GET\", \"POST\"]\n  }\n});\n\n// Connect to MongoDB (non-blocking)\nconnectDB().catch(err => {\n  console.error('Failed to connect to database:', err);\n  // Don't exit the process, let it continue\n});\n\n// Initialize Socket.io\ninitializeSocket(io);\n\n// Security middleware\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      scriptSrc: [\"'self'\"],\n      imgSrc: [\"'self'\", \"[REMOVED_DATA_URI]\n      connectSrc: [\"'self'\", \"ws:\", \"wss:\"]\n    }\n  }\n}));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes\n  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,\n  message: 'Too many requests from this IP, please try again later.',\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use('/api/', limiter);\n\n// Middleware\napp.use(compression());\napp.use(morgan('combined'));\n// Apply CORS globally before all routes\nconst allowedOrigins = process.env.CORS_ORIGIN\n  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())\n  : [\"http://localhost:3000\"];\nconsole.log('Allowed CORS origins:', allowedOrigins);\n\napp.use(cors({\n  origin: function(origin, callback) {\n    if (!origin) return callback(null, true);\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    return callback(new Error('Not allowed by CORS'));\n  },\n  credentials: true\n}));\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true, limit: '10mb' }));\n\n// Serve uploaded files\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  const health = {\n    status: 'OK',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n    environment: process.env.NODE_ENV || 'development',\n    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'\n  };\n  \n  res.status(200).json(health);\n});\n\n// API Routes\napp.use('/api/auth', authRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/chat', chatRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/notifications', notificationsRoutes);\n\n// Error handling middleware\napp.use(errorHandler);\n\n// 404 handler\napp.use('*', (req, res) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n});\n\nconst PORT = process.env.PORT || 5000;"}, {"file_name": "Campus-Shield/server/models/AdminRequest.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/AdminRequest.js", "markdown_link": "- [Campus-Shield/server/models/AdminRequest.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/AdminRequest.js)\n", "code_chunk": "const mongoose = require('mongoose');\nconst { Schema } = mongoose;\n\nconst AdminRequestSchema = new Schema({\n  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },\n  reason: { type: String, required: true },\n  role: { type: String, required: true },\n  department: { type: String, required: true },\n  experience: { type: String, required: true },\n  responsibilities: { type: String, required: true },\n  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },\n  contactInfo: { type: String },\n  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },\n  createdAt: { type: Date, default: Date.now },\n  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },\n  reviewedAt: { type: Date },\n  reviewNotes: { type: String }\n});\n\nmodule.exports = mongoose.model('AdminRequest', AdminRequestSchema);"}, {"file_name": "Campus-Shield/client/src/pages/AdminLogin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminLogin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminLogin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminLogin.tsx)\n", "code_chunk": "import React, { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { \n  ShieldCheckIcon, \n  EyeIcon, \n  EyeSlashIcon,\n  ExclamationTriangleIcon\n} from '@heroicons/react/24/outline';\nimport LoadingSpinner from '../components/common/LoadingSpinner';\nimport { useAuth } from '../contexts/AuthContext';\n\nconst AdminLogin: React.FC = () => {\n  const navigate = useNavigate();\n  const { adminLogin, user } = useAuth();\n  const [formData, setFormData] = useState({\n    email: '',\n    password: ''\n  });\n  const [showPassword, setShowPassword] = useState(false);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n\n  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value\n    }));\n    setError('');\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n\n    try {\n      await adminLogin(formData.email, formData.password);\n      // After login, user state is set in context\n      // Redirect based on role\n      const loggedInUser = user || JSON.parse(localStorage.getItem('user') || '{}');\n      if (loggedInUser.role === 'moderator') {\n        navigate('/admin/requests');\n      } else if (loggedInUser.role === 'admin') {\n        navigate('/admin');\n      } else {\n        navigate('/');\n      }\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8\">\n      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"flex justify-center\">\n          <div className=\"flex items-center space-x-2\">\n            <ShieldCheckIcon className=\"h-12 w-12 text-primary-600\" />\n            <h1 className=\"text-3xl font-bold text-gray-900\">CampusShield</h1>\n          </div>\n        </div>\n        <h2 className=\"mt-6 text-center text-2xl font-bold text-gray-900\">\n          Administrative Access\n        </h2>\n        <p className=\"mt-2 text-center text-sm text-gray-600\">\n          Login for pre-authorized campus administrators and moderators\n        </p>\n      </div>\n\n      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10\">\n          <form className=\"space-y-6\" onSubmit={handleSubmit}>\n            {error && (\n              <div className=\"bg-danger-50 border border-danger-200 rounded-md p-4\">\n                <div className=\"flex\">\n                  <ExclamationTriangleIcon className=\"h-5 w-5 text-danger-400\" />\n                  <p className=\"ml-3 text-sm text-danger-700\">{error}</p>\n                </div>\n              </div>\n            )}\n\n            <div>\n              <label htmlFor=\"email\" className=\"form-label\">\n                Email Address\n              </label>\n              <input\n                id=\"email\"\n                name=\"email\"\n                type=\"email\"\n                autoComplete=\"email\"\n                required\n                value={formData.email}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"admin@campus.edu\"\n              />\n            </div>"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// Admin request operations\n  createAdminRequest(userId, requestData) {\n    const request = {\n      id: this.nextRequestId.toString(),\n      userId,\n      ...requestData,\n      status: 'pending', // pending, approved, rejected\n      createdAt: new Date().toISOString(),\n      reviewedBy: null,\n      reviewedAt: null,\n      reviewNotes: null\n    };\n    this.adminRequests.set(request.id, request);\n    this.nextRequestId++;\n    return request;\n  }\n\n  getAdminRequests(status = null) {\n    const requests = Array.from(this.adminRequests.values());\n    if (status) {\n      return requests.filter(req => req.status === status);\n    }\n    return requests;\n  }\n\n  updateAdminRequest(requestId, updates) {\n    const request = this.adminRequests.get(requestId);\n    if (request) {\n      Object.assign(request, updates, { \n        reviewedAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString()\n      });\n      this.adminRequests.set(requestId, request);\n      return request;\n    }\n    return null;\n  }\n\n  approveAdminRequest(requestId, approvedBy, notes = '') {\n    const request = this.updateAdminRequest(requestId, {\n      status: 'approved',\n      reviewedBy: approvedBy,\n      reviewNotes: notes\n    });\n\n    if (request) {\n      // Promote user to admin\n      this.updateUser(request.userId, { role: 'admin' });\n    }\n\n    return request;\n  }\n\n  rejectAdminRequest(requestId, rejectedBy, notes = '') {\n    return this.updateAdminRequest(requestId, {\n      status: 'rejected',\n      reviewedBy: rejectedBy,\n      reviewNotes: notes\n    });\n  }\n\n  // Report operations\n  createReport(reportData) {\n    const report = {\n      id: this.nextReportId.toString(),\n      ...reportData,\n      status: 'pending',\n      priority: 'medium',\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString(),\n      attachments: [],\n      publicUpdates: []\n    };\n    this.reports.set(report.id, report);\n    this.nextReportId++;\n    return report;\n  }\n\n  findReportsByUserId(userId) {\n    const userReports = [];\n    for (const report of this.reports.values()) {\n      if (report.userId === userId) {\n        userReports.push(report);\n      }\n    }\n    return userReports;\n  }\n\n  findReportById(id) {\n    return this.reports.get(id) || null;\n  }\n\n  updateReport(id, updates) {\n    const report = this.reports.get(id);\n    if (report) {\n      Object.assign(report, updates, { updatedAt: new Date().toISOString() });\n      this.reports.set(id, report);\n      return report;\n    }\n    return null;\n  }\n\n  // Chat operations\n  createChatRoom(roomData) {\n    const room = {\n      roomId: this.nextRoomId.toString(),\n      ...roomData,\n      createdAt: new Date().toISOString(),\n      lastMessage: null\n    };\n    this.chatRooms.set(room.roomId, room);\n    this.nextRoomId++;\n    return room;\n  }\n\n  findChatRoomByReportId(reportId) {\n    for (const room of this.chatRooms.values()) {\n      if (room.reportId === reportId) {\n        return room;\n      }\n    }\n    return null;\n  }\n\n  findChatRoomsByUserId(userId) {\n    const userRooms = [];\n    for (const room of this.chatRooms.values()) {\n      if (room.userId === userId) {\n        userRooms.push(room);\n      }\n    }\n    return userRooms;\n  }\n\n  createMessage(messageData) {\n    const message = {\n      id: this.nextMessageId.toString(),\n      ...messageData,\n      timestamp: new Date().toISOString()\n    };\n    this.messages.set(message.id, message);\n    this.nextMessageId++;\n    return message;\n  }\n\n  findMessagesByRoomId(roomId) {\n    const roomMessages = [];\n    for (const message of this.messages.values()) {\n      if (message.roomId === roomId) {\n        roomMessages.push(message);\n      }\n    }\n    return roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));\n  }\n\n  // Admin operations\n  getAllReports() {\n    return Array.from(this.reports.values());\n  }\n\n  getAllUsers() {\n    return Array.from(this.users.values());\n  }"}, {"file_name": "Campus-Shield/server/routes/admin.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js", "markdown_link": "- [Campus-Shield/server/routes/admin.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js)\n", "code_chunk": "const express = require('express');\nconst { body, validationResult, query } = require('express-validator');\nconst Report = require('../models/Report');\nconst User = require('../models/User');\nconst auth = require('../middleware/auth');\nconst admin = require('../middleware/admin');\nconst moderator = require('../middleware/moderator');\nconst memoryStore = require('../services/memoryStore');\nconst AdminRequest = require('../models/AdminRequest');\nconst ChatRoom = require('../models/ChatRoom');\n\nconst router = express.Router();\n\n// Check if MongoDB is connected\nconst isMongoConnected = () => {\n  return Report.db && Report.db.readyState === 1;\n};\n\n// @route   GET /api/admin/stats\n// @desc    Get admin dashboard statistics\n// @access  Private (Admin only)\nrouter.get('/stats', auth, admin, async (req, res) => {\n  try {\n    if (isMongoConnected()) {\n      // Get statistics from MongoDB\n      const totalUsers = await User.countDocuments();\n      const totalReports = await Report.countDocuments();\n      const pendingReports = await Report.countDocuments({ status: 'pending' });\n      const resolvedReports = await Report.countDocuments({ status: 'resolved' });\n      const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0.0';\n      \n      // Get recent reports (last 24 hours)\n      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);\n      const recentReports = await Report.countDocuments({\n        createdAt: { $gte: yesterday }\n      });\n\n      res.json({\n        success: true,\n        stats: {\n          totalUsers,\n          totalReports,\n          pendingReports,\n          resolvedReports,\n          resolutionRate,\n          recentReports,\n          activeChats: 0 // TODO: Implement chat counting\n        }\n      });\n    } else {\n      // Use memory store\n      const stats = memoryStore.getStats();\n      const allReports = memoryStore.getAllReports();\n      \n      // Calculate recent reports (last 24 hours)\n      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);\n      const recentReports = allReports.filter(report => \n        new Date(report.createdAt) >= yesterday\n      ).length;\n\n      res.json({\n        success: true,\n        stats: {\n          totalUsers: stats.totalUsers,\n          totalReports: stats.totalReports,\n          pendingReports: stats.pendingReports,\n          resolvedReports: stats.resolvedReports,\n          resolutionRate: stats.resolutionRate,\n          recentReports,\n          activeChats: 0 // TODO: Implement chat counting\n        }\n      });\n    }\n  } catch (error) {\n    console.error('Stats error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error'\n    });\n  }\n});\n\n// @route   GET /api/admin/dashboard\n// @desc    Get admin dashboard data\n// @access  Private (Admin only)\nrouter.get('/dashboard', auth, admin, async (req, res) => {\n  try {\n    const { startDate, endDate } = req.query;\n    \n    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago\n    const end = endDate ? new Date(endDate) : new Date();\n\n    // Get statistics\n    const totalReports = await Report.countDocuments({\n      createdAt: { $gte: start, $lte: end }\n    });\n\n    const pendingReports = await Report.countDocuments({\n      status: 'pending',\n      createdAt: { $gte: start, $lte: end }\n    });\n\n    const resolvedReports = await Report.countDocuments({\n      status: 'resolved',\n      createdAt: { $gte: start, $lte: end }\n    });\n\n    // Get category breakdown\n    const categoryStats = await Report.aggregate([\n      {\n        $match: {\n          createdAt: { $gte: start, $lte: end }\n        }\n      },\n      {\n        $group: {\n          _id: '$category',\n          count: { $sum: 1 }\n        }\n      },\n      {\n        $sort: { count: -1 }\n      }\n    ]);"}, {"file_name": "Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md", "markdown_link": "- [Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md](https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md)\n", "code_chunk": "# CampusShield Tech Stack and Workflow Documentation\n\n## Recommended Tech Stack\n\n| Layer                | Technology Options                                                                                                          | Notes                                                     |\n|----------------------|----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|\n| **Front-End**        | React.js, React Native (mobile), Flutter (mobile)                                                                          | For web/mobile apps; Flutter enables true cross-platform  |\n| **Back-End/API**     | Node.js (Express.js), Python (FastAPI or Django)                                                                           | Scalable REST APIs, real-time features                    |\n| **Database**         | MongoDB (NoSQL), PostgreSQL (SQL)                                                                                          | MongoDB for flexible data; PostgreSQL for relational data |\n| **Authentication**   | Firebase Auth, Auth0, or custom JWT-based auth                                                                             | Secure sign-in, supports anonymity and OAuth              |\n| **Notifications**    | Firebase Cloud Messaging (push), Twilio (SMS), SendGrid (email)                                                            | Real-time and multi-channel notifications                 |\n| **AI/ML Integration**| Python (scikit-learn, Hugging Face Transformers, spaCy) via an API microservice                                           | For categorization, sentiment analysis, NLP               |\n| **Chat/Real-Time**   | Socket.io (Node.js), WebSockets, or Firebase Realtime Database                                                             | For admin-user anonymous chat, group support              |\n| **Maps/Heatmaps**    | Google Maps API, Mapbox, Leaflet.js                                                                                        | For live incident heatmaps                                |\n| **File Storage**     | AWS S3, Google Cloud Storage, Firebase Storage                                                                             | For reports with photos, voice, or video                  |\n| **Admin Dashboard**  | React (web-based), Chart.js/D3.js for analytics and visualizations                                                         | Data visualization and report management                  |\n| **Hosting/Infra**    | AWS, Google Cloud Platform, Azure, Vercel, Heroku                                                                          | Scalable and easy deployment                              |\n| **Security**         | HTTPS/SSL, end-to-end encryption (Signal Protocol, custom), privacy libraries                                              | To ensure report privacy and anonymous chat               |\n| **Localization**     | i18next, Google Cloud Translation                                                                                          | For multilingual support                                  |\n\n## MVP Tech Stack (Phase 1)\n\nFor the initial MVP, we'll use a simplified but scalable stack:\n\n- **Frontend**: React.js with Tailwind CSS\n- **Backend**: Node.js with Express.js\n- **Database**: MongoDB (flexible schema for reports)\n- **Real-time**: Socket.io for chat and live updates\n- **Authentication**: JWT-based with anonymous options\n- **Maps**: Leaflet.js for heatmap visualization\n- **File Storage**: Local storage initially, cloud storage later\n- **AI/ML**: Basic text classification using natural language processing\n\n## Suggested Workflow\n\n### 1. User Onboarding & Authentication\n- Users sign up with minimal data, choose anonymity (no personal info required).\n- Optional: Offer OAuth (Google, college email) for added features with clear privacy messaging."}, {"file_name": "Campus-Shield/client/src/components/layout/Navbar.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx", "markdown_link": "- [Campus-Shield/client/src/components/layout/Navbar.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/layout/Navbar.tsx)\n", "code_chunk": "{/* Mobile menu */}\n      {isMenuOpen && (\n        <div className=\"sm:hidden\">\n          <div className=\"pt-2 pb-3 space-y-1\">\n            {navigation.map((item) => (\n              <Link\n                key={item.name}\n                to={item.href}\n                className=\"block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200\"\n                onClick={() => setIsMenuOpen(false)}\n              >\n                {item.name}\n              </Link>\n            ))}\n          </div>\n          {/* Notification Bell in mobile menu */}\n          {user && (\n            <div className=\"flex items-center px-4 pt-2 pb-1 border-t border-gray-200\">\n              <button\n                className=\"relative focus:outline-none mr-4\"\n                onClick={() => { setNotifOpen(true); setIsMenuOpen(false); }}\n                aria-label=\"Open notifications\"\n              >\n                <BellIcon className=\"h-6 w-6 text-gray-600 hover:text-primary-600\" />\n                {unread.length > 0 && (\n                  <span className=\"absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow\">\n                    {unread.length}\n                  </span>\n                )}\n              </button>\n              <div className=\"flex items-center space-x-2 text-sm text-gray-700\">\n                <UserIcon className=\"h-4 w-4\" />\n                <span>\n                  {user.isAnonymous ? 'Anonymous User' : user.email}\n                </span>\n                {user.role === 'admin' && (\n                  <span className=\"badge badge-info\">Admin</span>\n                )}\n                {user.role === 'moderator' && (\n                  <span className=\"badge badge-warning\">Moderator</span>\n                )}\n              </div>\n            </div>\n          )}\n          {user ? (\n            <div className=\"pt-2 pb-3\">\n              {user.role !== 'admin' && (\n                <Link to=\"/request-admin\" className=\"block px-4 py-2 text-base text-primary-600 hover:text-primary-500\" onClick={() => setIsMenuOpen(false)}>\n                  Request Admin\n                </Link>\n              )}\n              <button\n                onClick={handleLogout}\n                className=\"block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100\"\n              >\n                Logout\n              </button>\n            </div>\n          ) : (\n            <div className=\"pt-4 pb-3 border-t border-gray-200\">\n              <div className=\"space-y-1\">\n                <Link\n                  to=\"/login\"\n                  className=\"block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100\"\n                  onClick={() => setIsMenuOpen(false)}\n                >\n                  Login\n                </Link>\n                <Link\n                  to=\"/register\"\n                  className=\"block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100\"\n                  onClick={() => setIsMenuOpen(false)}\n                >\n                  Register\n                </Link>\n                <Link\n                  to=\"/admin-login\"\n                  className=\"block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100\"\n                  onClick={() => setIsMenuOpen(false)}\n                >\n                  Admin Access\n                </Link>\n              </div>\n            </div>\n          )}\n        </div>\n      )}"}, {"file_name": "Campus-Shield/client/src/pages/RequestAdmin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/RequestAdmin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx)\n", "code_chunk": "<div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6\">\n          <div className=\"flex\">\n            <ShieldCheckIcon className=\"h-5 w-5 text-blue-400 mt-0.5\" />\n            <div className=\"ml-3\">\n              <h3 className=\"text-sm font-medium text-blue-800\">Important Information</h3>\n              <div className=\"mt-2 text-sm text-blue-700\">\n                <ul className=\"list-disc list-inside space-y-1\">\n                  <li>Admin access is granted only to authorized campus personnel</li>\n                  <li>Your request will be reviewed by existing administrators only</li>\n                  <li>Only pre-approved admins can approve new admin requests</li>\n                  <li>You will be notified of the decision via email</li>\n                  <li>Please provide a detailed reason for your request</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <form onSubmit={handleSubmit} className=\"space-y-6\">\n          {/* Personal Information */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Personal Information</h3>\n            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n              <div>\n                <label htmlFor=\"role\" className=\"form-label\">\n                  Your Role/Position *\n                </label>\n                <input\n                  id=\"role\"\n                  name=\"role\"\n                  type=\"text\"\n                  required\n                  value={formData.role}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Security Officer, IT Manager, Dean\"\n                />\n              </div>\n              <div>\n                <label htmlFor=\"department\" className=\"form-label\">\n                  Department/Unit *\n                </label>\n                <input\n                  id=\"department\"\n                  name=\"department\"\n                  type=\"text\"\n                  required\n                  value={formData.department}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Campus Security, IT Services, Student Affairs\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {/* Experience & Qualifications */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Experience & Qualifications</h3>\n            <div>\n              <label htmlFor=\"experience\" className=\"form-label\">\n                Relevant Experience *\n              </label>\n              <textarea\n                id=\"experience\"\n                name=\"experience\"\n                rows={3}\n                required\n                value={formData.experience}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your experience with campus safety, incident management, or administrative systems...\"\n              />\n            </div>\n          </div>\n\n          {/* Responsibilities */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Responsibilities & Duties</h3>\n            <div>\n              <label htmlFor=\"responsibilities\" className=\"form-label\">\n                Current Responsibilities *\n              </label>\n              <textarea\n                id=\"responsibilities\"\n                name=\"responsibilities\"\n                rows={3}\n                required\n                value={formData.responsibilities}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your current responsibilities that would benefit from admin access...\"\n              />\n            </div>\n          </div>"}, {"file_name": "Campus-Shield/client/src/pages/AdminDashboard.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminDashboard.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx)\n", "code_chunk": "useEffect(() => {\n    fetchDashboardData();\n  }, []);\n\n  const fetchDashboardData = async () => {\n    try {\n      const [statsRes, activeChatsRes] = await Promise.all([\n        fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {\n          headers: {\n            'Authorization': `Bearer ${localStorage.getItem('token')}`\n          }\n        }),\n        fetch(`${process.env.REACT_APP_API_URL}/api/admin/active-chats`, {\n          headers: {\n            'Authorization': `Bearer ${localStorage.getItem('token')}`\n          }\n        })\n      ]);\n      if (statsRes.ok) {\n        const statsData = await statsRes.json();\n        setStats(statsData.stats);\n      }\n      if (activeChatsRes.ok) {\n        const activeChatsData = await activeChatsRes.json();\n        setActiveChats(activeChatsData.activeChats || 0);\n      }\n\n      // Fetch all reports\n      const reportsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reports`, {\n        headers: {\n          'Authorization': `Bearer ${localStorage.getItem('token')}`\n        }\n      });\n\n      if (reportsResponse.ok) {\n        const reportsData = await reportsResponse.json();\n        setReports(reportsData.reports || []);\n      }\n\n      // Fetch heatmap data\n      const heatmapResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/heatmap/data`, {\n        headers: {\n          'Authorization': `Bearer ${localStorage.getItem('token')}`\n        }\n      });\n\n      if (heatmapResponse.ok) {\n        const heatmapData = await heatmapResponse.json();\n        setHeatmapData(heatmapData.heatmapData || []);\n      }\n\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const updateReportStatus = async (reportId: string, newStatus: string) => {\n    try {\n      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/reports/${reportId}/status`, {\n        method: 'PATCH',\n        headers: {\n          'Authorization': `Bearer ${localStorage.getItem('token')}`,\n          'Content-Type': 'application/json'\n        },\n        body: JSON.stringify({ status: newStatus })\n      });\n\n      if (response.ok) {\n        // Update the report in the local state\n        setReports(prev => prev.map(report => \n          report.id === reportId \n            ? { ...report, status: newStatus }\n            : report\n        ));\n        \n        // Refresh stats\n        fetchDashboardData();\n      }\n    } catch (err: any) {\n      setError(err.message);\n    }\n  };\n\n  const filteredReports = reports.filter(report => {\n    const matchesStatus = filter === 'all' || report.status === filter;\n    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;\n    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;\n    return matchesStatus && matchesPriority && matchesCategory;\n  });\n\n  const formatDate = (dateString: string) => {\n    return new Date(dateString).toLocaleDateString('en-US', {\n      year: 'numeric',\n      month: 'short',\n      day: 'numeric',\n      hour: '2-digit',\n      minute: '2-digit'\n    });\n  };\n\n  const getCategoryStats = () => {\n    const categoryCounts: { [key: string]: number } = {};\n    reports.forEach(report => {\n      const category = categoryLabels[report.category as keyof typeof categoryLabels] || report.category;\n      categoryCounts[category] = (categoryCounts[category] || 0) + 1;\n    });\n    return categoryCounts;\n  };\n\n  if (loading) {\n    return (\n      <div className=\"max-w-7xl mx-auto\">\n        <div className=\"card\">\n          <LoadingSpinner text=\"Loading admin dashboard...\" />\n        </div>\n      </div>\n    );\n  }\n\n  const assignedToId =\n    selectedReport && selectedReport.assignedTo\n      ? isAssignedToObject(selectedReport.assignedTo)\n        ? selectedReport.assignedTo._id\n        : selectedReport.assignedTo\n      : null;"}, {"file_name": "Campus-Shield/client/src/pages/AdminRequests.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminRequests.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx)\n", "code_chunk": "<div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Applicant Information</h3>\n                  <div className=\"grid grid-cols-2 gap-4\">\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Email:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.user?.email}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Role:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.role}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Department:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.department}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Urgency:</span>\n                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedRequest.urgency)}`}>\n                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}\n                      </span>\n                    </div>\n                  </div>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Experience</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.experience}</p>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Current Responsibilities</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.responsibilities}</p>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Reason for Admin Access</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.reason}</p>\n                </div>\n\n                {selectedRequest.contactInfo && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Additional Contact</h3>\n                    <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.contactInfo}</p>\n                  </div>\n                )}\n\n                {selectedRequest.status === 'pending' && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Review Notes</h3>\n                    <textarea\n                      value={reviewNotes}\n                      onChange={(e) => setReviewNotes(e.target.value)}\n                      className=\"input-field\"\n                      rows={3}\n                      placeholder=\"Add notes about your decision...\"\n                    />\n                  </div>\n                )}\n\n                {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Review Notes</h3>\n                    <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.reviewNotes}</p>\n                  </div>\n                )}"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "{/* Features Section */}\n      <section className=\"bg-gray-50 py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              Why Choose CampusShield?\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Our privacy-first approach ensures you can report safety concerns without fear, \n              while powerful features help keep everyone informed and protected.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\n            {features.map((feature, index) => (\n              <div key={index} className=\"card hover:shadow-md transition-shadow duration-200\">\n                <div className=\"flex items-center mb-4\">\n                  <feature.icon className=\"h-8 w-8 text-primary-600 mr-3\" />\n                  <h3 className=\"text-lg font-semibold text-gray-900\">\n                    {feature.title}\n                  </h3>\n                </div>\n                <p className=\"text-gray-600\">\n                  {feature.description}\n                </p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      {/* How It Works Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              How It Works\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Simple, secure, and anonymous reporting in just a few steps.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">\n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">1</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Report Incident</h3>\n              <p className=\"text-gray-600\">\n                Submit a detailed report with location, description, and optional media attachments.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">2</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">AI Processing</h3>\n              <p className=\"text-gray-600\">\n                Our AI categorizes and prioritizes your report for appropriate response.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">3</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Stay Updated</h3>\n              <p className=\"text-gray-600\">\n                Receive updates on your report and chat with authorities if needed.\n              </p>\n            </div>\n          </div>\n        </div>\n      </section>"}]</code-reference>