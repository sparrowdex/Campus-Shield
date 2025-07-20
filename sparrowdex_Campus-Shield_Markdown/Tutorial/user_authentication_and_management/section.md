# User Authentication and Management

# User Authentication and Management Tutorial for CampusShield

This tutorial will guide you through implementing user authentication and management in the CampusShield project. We'll cover user registration, login, admin authentication, and admin request handling.

<artifact ArtifactUUID="b7c8de6b-c7bf-4ace-9394-ff9f9dfdd550">User Registration</artifact>

1. Open `client/src/pages/Register.tsx`:

```typescript
const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    campusId: ''
  });
  const { register, loginAnonymous } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData.email, formData.password, formData.campusId);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnonymousRegister = async () => {
    try {
      await loginAnonymous(formData.campusId);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Render form and buttons
}
```

2. Implement the `register` function in `client/src/contexts/AuthContext.tsx`:

```typescript
const register = async (email: string, password: string, campusId?: string) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      email,
      password,
      campusId
    });

    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};
```

3. Create the registration route in `server/routes/auth.js`:

```javascript
router.post('/register', [
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('campusId').optional().isString().withMessage('Campus ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, campusId } = req.body;
    
    const anonymousId = uuidv4();
    
    const userData = {
      anonymousId,
      campusId,
      isAnonymous: !email,
      email: email || null,
      password: password ? await bcrypt.hash(password, 10) : null,
      role: 'user'
    };

    const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        anonymousId: user.anonymousId,
        email: user.email,
        role: user.role,
        isAnonymous: user.isAnonymous,
        campusId: user.campusId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});
```

<artifact>User Login</artifact>

1. Open `client/src/pages/Login.tsx`:

```typescript
const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, loginAnonymous } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await loginAnonymous();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Render form and buttons
}
```

2. Implement the `login` function in `client/src/contexts/AuthContext.tsx`:

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
      email,
      password
    });

    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
```

3. Create the login route in `server/routes/auth.js`:

```javascript
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        anonymousId: user.anonymousId,
        email: user.email,
        role: user.role,
        isAnonymous: user.isAnonymous,
        campusId: user.campusId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});
```

<artifact ArtifactUUID="d96c1c7f-083a-45b2-b953-f7a09b2eafa5">Admin Authentication</artifact>

1. Open `client/src/pages/AdminLogin.tsx`:

```typescript
const AdminLogin: React.FC = () => {
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(formData.email, formData.password);
      const loggedInUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      if (loggedInUser.role === 'moderator') {
        navigate('/admin/requests');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Render form
}
```

2. Implement the `adminLogin` function in `client/src/contexts/AuthContext.tsx`:

```typescript
const adminLogin = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/admin-login`, {
      email,
      password
    });

    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Admin login failed');
  }
};
```

3. Create the admin login route in `server/routes/auth.js`:

```javascript
router.post('/admin-login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrative privileges required.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        anonymousId: user.anonymousId,
        email: user.email,
        role: user.role,
        isAnonymous: user.isAnonymous,
        campusId: user.campusId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});
```

<artifact ArtifactUUID="dc8e500f-5b5b-4c70-afb0-0e862e2747f6">Admin Request Handling</artifact>

1. Open `client/src/pages/RequestAdmin.tsx`:

```typescript
const RequestAdmin: React.FC = () => {
  const [formData, setFormData] = useState({
    role: '',
    department: '',
    experience: '',
    responsibilities: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/request', formData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  // Render form
}
```

2. Create the admin request route in `server/routes/admin.js`:

```javascript
router.post('/request', auth, async (req, res) => {
  try {
    const { role, department, experience, responsibilities } = req.body;

    const adminRequest = new AdminRequest({
      userId: req.user.id,
      role,
      department,
      experience,
      responsibilities,
      status: 'pending'
    });

    await adminRequest.save();

    res.status(201).json({
      success: true,
      message: 'Admin request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while submitting admin request'
    });
  }
});
```

3. Create the `AdminRequest` model in `server/models/AdminRequest.js`:

```javascript
const mongoose = require('mongoose');

const adminRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  responsibilities: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AdminRequest', adminRequestSchema);
```

This tutorial covers the main aspects of user authentication and management in the CampusShield project. It includes user registration, login, admin authentication, and admin request handling. The implementation uses React for the frontend and Express.js for the backend, with MongoDB as the database.
## References:

<document-code-reference tutorial-step="user-authentication-and-management">
{"files": [
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
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
  },
  {
    "name": "Campus-Shield/client/src/contexts/AuthContext.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts/AuthContext.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts"
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
<code-reference uuid='ff761475-f555-4541-8a57-dd6ad393ccf5'>[{"file_name": "Campus-Shield/server/index.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js", "markdown_link": "- [Campus-Shield/server/index.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/index.js)\n", "code_chunk": "const express = require('express');\nconst http = require('http');\nconst socketIo = require('socket.io');\nconst cors = require('cors');\nconst helmet = require('helmet');\nconst compression = require('compression');\nconst morgan = require('morgan');\nconst rateLimit = require('express-rate-limit');\nconst path = require('path');\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\n\n// Debug environment variables\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nconst connectDB = require('./config/database');\nconst authRoutes = require('./routes/auth');\nconst reportRoutes = require('./routes/reports');\nconst chatRoutes = require('./routes/chat');\nconst adminRoutes = require('./routes/admin');\nconst notificationsRoutes = require('./routes/notifications');\nconst { initializeSocket } = require('./services/socketService');\nconst { errorHandler } = require('./middleware/errorHandler');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server, {\n  cors: {\n    origin: process.env.CORS_ORIGIN || \"http://localhost:3000\",\n    methods: [\"GET\", \"POST\"]\n  }\n});\n\n// Connect to MongoDB (non-blocking)\nconnectDB().catch(err => {\n  console.error('Failed to connect to database:', err);\n  // Don't exit the process, let it continue\n});\n\n// Initialize Socket.io\ninitializeSocket(io);\n\n// Security middleware\napp.use(helmet({\n  contentSecurityPolicy: {\n    directives: {\n      defaultSrc: [\"'self'\"],\n      styleSrc: [\"'self'\", \"'unsafe-inline'\"],\n      scriptSrc: [\"'self'\"],\n      imgSrc: [\"'self'\", \"[REMOVED_DATA_URI]\n      connectSrc: [\"'self'\", \"ws:\", \"wss:\"]\n    }\n  }\n}));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes\n  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,\n  message: 'Too many requests from this IP, please try again later.',\n  standardHeaders: true,\n  legacyHeaders: false,\n});\napp.use('/api/', limiter);\n\n// Middleware\napp.use(compression());\napp.use(morgan('combined'));\n// Apply CORS globally before all routes\nconst allowedOrigins = process.env.CORS_ORIGIN\n  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())\n  : [\"http://localhost:3000\"];\nconsole.log('Allowed CORS origins:', allowedOrigins);\n\napp.use(cors({\n  origin: function(origin, callback) {\n    if (!origin) return callback(null, true);\n    if (allowedOrigins.includes(origin)) return callback(null, true);\n    return callback(new Error('Not allowed by CORS'));\n  },\n  credentials: true\n}));\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true, limit: '10mb' }));\n\n// Serve uploaded files\napp.use('/uploads', express.static(path.join(__dirname, 'uploads')));\n\n// Health check endpoint\napp.get('/health', (req, res) => {\n  const health = {\n    status: 'OK',\n    timestamp: new Date().toISOString(),\n    uptime: process.uptime(),\n    environment: process.env.NODE_ENV || 'development',\n    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'\n  };\n  \n  res.status(200).json(health);\n});\n\n// API Routes\napp.use('/api/auth', authRoutes);\napp.use('/api/reports', reportRoutes);\napp.use('/api/chat', chatRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/notifications', notificationsRoutes);\n\n// Error handling middleware\napp.use(errorHandler);\n\n// 404 handler\napp.use('*', (req, res) => {\n  res.status(404).json({\n    success: false,\n    message: 'Route not found'\n  });\n});\n\nconst PORT = process.env.PORT || 5000;"}, {"file_name": "Campus-Shield/SETUP_GUIDE.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md", "markdown_link": "- [Campus-Shield/SETUP_GUIDE.md](https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md)\n", "code_chunk": "# \ud83d\udee1\ufe0f CampusShield Setup Guide for Beginners\n\n## \ud83d\udccb Table of Contents\n1. [What is CampusShield?](#what-is-campusshield)\n2. [Cloning from GitHub](#cloning-from-github)\n3. [Prerequisites](#prerequisites)\n4. [Installation Steps](#installation-steps)\n5. [Running the Application](#running-the-application)\n6. [Understanding the Project Structure](#understanding-the-project-structure)\n7. [Common Issues & Solutions](#common-issues--solutions)\n8. [Development Workflow](#development-workflow)\n9. [Testing the Features](#testing-the-features)\n10. [Contributing](#contributing)\n\n---\n\n## \ud83c\udfaf What is CampusShield?\n\nCampusShield is a **privacy-first campus safety platform** that allows students to:\n- **Report incidents anonymously** with location tracking\n- **Chat securely** with campus authorities\n- **Track report status** and updates\n- **View safety analytics** and heatmaps\n\n---\n\n## \ud83d\ude80 Cloning from GitHub\n\nIf you are starting from the GitHub repository:\n```bash\ngit clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd CampusShield\n```\n\n---\n\n## \ud83d\udccb Prerequisites\n\nBefore you start, make sure you have these installed:\n\n### **Required Software:**\n- \u2705 **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)\n- \u2705 **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)\n- \u2705 **Git** (optional) - [Download here](https://git-scm.com/)\n\n### **How to Check if Installed:**\nOpen Command Prompt and type:\n```bash\nnode --version\nnpm --version\nmongod --version\n```\n\n---\n\n## \ud83d\ude80 Installation Steps\n\n### **Step 1: Download the Project**\n1. **Download** the CampusShield project files (or clone from GitHub)\n2. **Extract** to a folder (e.g., `C:\\CampusShield`)\n3. **Open Command Prompt** in that folder\n\n### **Step 2: Install Dependencies**\n```bash\n# Install backend dependencies\ncd server\nnpm install\n\n# Install frontend dependencies\ncd ../client\nnpm install\n```\n\n### **Step 3: Set Up MongoDB**\n1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)\n2. **Install with default settings** (Complete installation)\n3. **MongoDB will run as a Windows Service** (starts automatically)\n\n### **Step 4: Create Environment File**\n1. **Navigate to server folder**: `cd server`\n2. **Copy `.env.example` to `.env`**:\n   ```bash\n   copy .env.example .env\n   # Or manually create .env and copy the contents from .env.example\n   ```\n3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)\n\n### **Step 5: (Optional) Seed Admin/Moderator Accounts**\nIf you want demo admin/moderator accounts, run:\n```bash\ncd server\nnode seedAdmins.js\n```\n\n---\n\n## \ud83c\udfc3\u200d\u2642\ufe0f Running the Application\n\n### **You Need 2 Command Prompt Windows:**\n\n#### **Window 1: Backend Server**\n```bash\ncd server\nnpm run dev\n```\n**Expected Output:**\n```\n\ud83d\udce6 MongoDB Connected: localhost\n\ud83d\ude80 CampusShield server running on port 5000\n\ud83d\udcca Health check: http://localhost:5000/health\n\ud83d\udd12 Environment: development\n```\n\n#### **Window 2: Frontend Server**\n```bash\ncd client\nnpm start\n```\n**Expected Output:**\n```\nCompiled successfully!\n\nYou can now view campus-shield in the browser.\n\n  Local:            http://localhost:3000\n  On Your Network:  http://192.168.x.x:3000\n```\n\n### **Access the Application:**\n- **Frontend**: http://localhost:3000\n- **Backend API**: http://localhost:5000\n- **Health Check**: http://localhost:5000/health\n\n---\n\n## \ud83d\udcf1 Mobile Responsiveness\nCampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.\n\n---\n\n## \ud83d\udcc1 Understanding the Project Structure"}, {"file_name": "Campus-Shield/client/src/pages/AdminLogin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminLogin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminLogin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminLogin.tsx)\n", "code_chunk": "import React, { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { \n  ShieldCheckIcon, \n  EyeIcon, \n  EyeSlashIcon,\n  ExclamationTriangleIcon\n} from '@heroicons/react/24/outline';\nimport LoadingSpinner from '../components/common/LoadingSpinner';\nimport { useAuth } from '../contexts/AuthContext';\n\nconst AdminLogin: React.FC = () => {\n  const navigate = useNavigate();\n  const { adminLogin, user } = useAuth();\n  const [formData, setFormData] = useState({\n    email: '',\n    password: ''\n  });\n  const [showPassword, setShowPassword] = useState(false);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n\n  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value\n    }));\n    setError('');\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n\n    try {\n      await adminLogin(formData.email, formData.password);\n      // After login, user state is set in context\n      // Redirect based on role\n      const loggedInUser = user || JSON.parse(localStorage.getItem('user') || '{}');\n      if (loggedInUser.role === 'moderator') {\n        navigate('/admin/requests');\n      } else if (loggedInUser.role === 'admin') {\n        navigate('/admin');\n      } else {\n        navigate('/');\n      }\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8\">\n      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"flex justify-center\">\n          <div className=\"flex items-center space-x-2\">\n            <ShieldCheckIcon className=\"h-12 w-12 text-primary-600\" />\n            <h1 className=\"text-3xl font-bold text-gray-900\">CampusShield</h1>\n          </div>\n        </div>\n        <h2 className=\"mt-6 text-center text-2xl font-bold text-gray-900\">\n          Administrative Access\n        </h2>\n        <p className=\"mt-2 text-center text-sm text-gray-600\">\n          Login for pre-authorized campus administrators and moderators\n        </p>\n      </div>\n\n      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10\">\n          <form className=\"space-y-6\" onSubmit={handleSubmit}>\n            {error && (\n              <div className=\"bg-danger-50 border border-danger-200 rounded-md p-4\">\n                <div className=\"flex\">\n                  <ExclamationTriangleIcon className=\"h-5 w-5 text-danger-400\" />\n                  <p className=\"ml-3 text-sm text-danger-700\">{error}</p>\n                </div>\n              </div>\n            )}\n\n            <div>\n              <label htmlFor=\"email\" className=\"form-label\">\n                Email Address\n              </label>\n              <input\n                id=\"email\"\n                name=\"email\"\n                type=\"email\"\n                autoComplete=\"email\"\n                required\n                value={formData.email}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"admin@campus.edu\"\n              />\n            </div>"}, {"file_name": "Campus-Shield/client/src/contexts/AuthContext.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts/AuthContext.tsx", "markdown_link": "- [Campus-Shield/client/src/contexts/AuthContext.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/contexts/AuthContext.tsx)\n", "code_chunk": "import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';\nimport axios from 'axios';\n\n// Types\ninterface User {\n  id: string;\n  anonymousId: string;\n  email?: string;\n  role: 'user' | 'admin' | 'moderator';\n  isAnonymous: boolean;\n  campusId?: string;\n}\n\ninterface AuthContextType {\n  user: User | null;\n  loading: boolean;\n  login: (email: string, password: string) => Promise<void>;\n  register: (email: string, password: string, campusId?: string) => Promise<void>;\n  loginAnonymous: (campusId?: string) => Promise<void>;\n  logout: () => void;\n  updatePreferences: (preferences: any) => Promise<void>;\n  adminLogin: (email: string, password: string) => Promise<void>;\n}\n\n// Create context\nconst AuthContext = createContext<AuthContextType | undefined>(undefined);\n\n// Auth provider component\nexport const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {\n  const [user, setUser] = useState<User | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  // Set up axios defaults\n  useEffect(() => {\n    const token = localStorage.getItem('token');\n    if (token) {\n      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;\n    }\n  }, []);\n\n  // Check if user is logged in on app start\n  useEffect(() => {\n    const checkAuth = async () => {\n      const token = localStorage.getItem('token');\n      if (token) {\n        try {\n          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);\n          setUser(response.data.user);\n        } catch (error) {\n          localStorage.removeItem('token');\n          delete axios.defaults.headers.common['Authorization'];\n        }\n      }\n      setLoading(false);\n    };\n\n    checkAuth();\n  }, []);\n\n  const login = async (email: string, password: string) => {\n    try {\n      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {\n        email,\n        password\n      });\n\n      const { token, user } = response.data;\n      localStorage.setItem('token', token);\n      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;\n      setUser(user);\n    } catch (error: any) {\n      throw new Error(error.response?.data?.message || 'Login failed');\n    }\n  };\n\n  const register = async (email: string, password: string, campusId?: string) => {\n    try {\n      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {\n        email,\n        password,\n        campusId\n      });\n\n      const { token, user } = response.data;\n      localStorage.setItem('token', token);\n      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;\n      setUser(user);\n    } catch (error: any) {\n      throw new Error(error.response?.data?.message || 'Registration failed');\n    }\n  };\n\n  const loginAnonymous = async (campusId?: string) => {\n    try {\n      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/anonymous`, {\n        campusId\n      });\n\n      const { token, user } = response.data;\n      localStorage.setItem('token', token);\n      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;\n      setUser(user);\n    } catch (error: any) {\n      throw new Error(error.response?.data?.message || 'Anonymous login failed');\n    }\n  };\n\n  const logout = () => {\n    localStorage.removeItem('token');\n    delete axios.defaults.headers.common['Authorization'];\n    setUser(null);\n  };\n\n  const updatePreferences = async (preferences: any) => {\n    try {\n      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/preferences`, preferences);\n      // Update user preferences in state if needed\n    } catch (error: any) {\n      throw new Error(error.response?.data?.message || 'Failed to update preferences');\n    }\n  };"}, {"file_name": "Campus-Shield/server/services/socketService.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/socketService.js", "markdown_link": "- [Campus-Shield/server/services/socketService.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/socketService.js)\n", "code_chunk": "const jwt = require('jsonwebtoken');\nconst User = require('../models/User');\n\nconst initializeSocket = (io) => {\n  // Authentication middleware\n  io.use(async (socket, next) => {\n    try {\n      const token = socket.handshake.auth.token;\n      \n      if (!token) {\n        return next(new Error('Authentication error'));\n      }\n\n      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');\n      const user = await User.findById(decoded.userId);\n      \n      if (!user || !user.isActive) {\n        return next(new Error('User not found or inactive'));\n      }\n\n      socket.user = {\n        userId: user._id,\n        anonymousId: user.anonymousId,\n        role: user.role,\n        isAnonymous: user.isAnonymous\n      };\n\n      next();\n    } catch (error) {\n      next(new Error('Authentication error'));\n    }\n  });\n\n  io.on('connection', (socket) => {\n    console.log(`User connected: ${socket.user.anonymousId}`);\n\n    // Join user to their personal room\n    socket.join(`user_${socket.user.userId}`);\n\n    // Join admin to admin room if admin\n    if (socket.user.role === 'admin') {\n      socket.join('admin_room');\n    }\n\n    // Join chat room\n    socket.on('join_chat_room', (roomId) => {\n      socket.join(roomId);\n      console.log(`User ${socket.user.anonymousId} joined room: ${roomId}`);\n    });\n\n    // Leave chat room\n    socket.on('leave_chat_room', (roomId) => {\n      socket.leave(roomId);\n      console.log(`User ${socket.user.anonymousId} left room: ${roomId}`);\n    });\n\n    // Send message\n    socket.on('send_message', (data) => {\n      const { roomId, message } = data;\n      \n      // Emit to room\n      io.to(roomId).emit('new_message', {\n        id: Date.now().toString(),\n        senderId: socket.user.userId,\n        senderRole: socket.user.role,\n        message,\n        timestamp: new Date(),\n        isAnonymous: socket.user.isAnonymous\n      });\n\n      // Notify admins if message is from user\n      if (socket.user.role === 'user') {\n        io.to('admin_room').emit('user_message', {\n          roomId,\n          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),\n          timestamp: new Date()\n        });\n      }\n    });\n\n    // Report status updates\n    socket.on('report_status_update', (data) => {\n      const { reportId, status, message } = data;\n      \n      // Notify user about their report update\n      io.to(`user_${socket.user.userId}`).emit('report_updated', {\n        reportId,\n        status,\n        message,\n        timestamp: new Date()\n      });\n    });\n\n    // Location-based alerts\n    socket.on('location_update', (data) => {\n      const { latitude, longitude } = data;\n      \n      // In a real implementation, you would check for nearby incidents\n      // and send alerts to users in high-report areas\n      console.log(`User ${socket.user.anonymousId} location: ${latitude}, ${longitude}`);\n    });\n\n    // Typing indicators\n    socket.on('typing_start', (roomId) => {\n      socket.to(roomId).emit('user_typing', {\n        userId: socket.user.userId,\n        isTyping: true\n      });\n    });\n\n    socket.on('typing_stop', (roomId) => {\n      socket.to(roomId).emit('user_typing', {\n        userId: socket.user.userId,\n        isTyping: false\n      });\n    });\n\n    // Disconnect\n    socket.on('disconnect', () => {\n      console.log(`User disconnected: ${socket.user.anonymousId}`);\n    });\n  });\n\n  // Global error handler\n  io.on('error', (error) => {\n    console.error('Socket.io error:', error);\n  });\n};\n\nmodule.exports = { initializeSocket };"}, {"file_name": "Campus-Shield/server/models/User.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js", "markdown_link": "- [Campus-Shield/server/models/User.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js)\n", "code_chunk": "const mongoose = require('mongoose');\nconst bcrypt = require('bcryptjs');\n\nconst userSchema = new mongoose.Schema({\n  // Minimal user data for privacy\n  anonymousId: {\n    type: String,\n    required: true,\n    unique: true,\n    index: true\n  },\n  \n  // Optional authenticated user data\n  email: {\n    type: String,\n    sparse: true, // Allows multiple null values\n    lowercase: true,\n    match: [/^\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(\\.\\w{2,3})+$/, 'Please enter a valid email']\n  },\n  \n  password: {\n    type: String,\n    minlength: 6\n  },\n  \n  role: {\n    type: String,\n    enum: ['user', 'admin', 'moderator'],\n    default: 'user'\n  },\n  \n  // Privacy settings\n  isAnonymous: {\n    type: Boolean,\n    default: true\n  },\n  \n  // Campus affiliation (optional)\n  campusId: {\n    type: String,\n    index: true\n  },\n  \n  // User preferences\n  preferences: {\n    notifications: {\n      type: Boolean,\n      default: true\n    },\n    locationSharing: {\n      type: Boolean,\n      default: false\n    },\n    language: {\n      type: String,\n      default: 'en'\n    }\n  },\n  \n  // Privacy and security\n  lastActive: {\n    type: Date,\n    default: Date.now\n  },\n  \n  dataRetentionDate: {\n    type: Date,\n    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year\n  },\n  \n  // Account status\n  isActive: {\n    type: Boolean,\n    default: true\n  },\n  \n  createdAt: {\n    type: Date,\n    default: Date.now\n  },\n  \n  updatedAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Index for data cleanup\nuserSchema.index({ dataRetentionDate: 1 });\n\n// Pre-save middleware to hash password\nuserSchema.pre('save', async function(next) {\n  if (!this.isModified('password')) return next();\n  \n  if (this.password) {\n    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);\n    this.password = await bcrypt.hash(this.password, salt);\n  }\n  \n  this.updatedAt = Date.now();\n  next();\n});\n\n// Method to check password\nuserSchema.methods.comparePassword = async function(candidatePassword) {\n  if (!this.password) return false;\n  return bcrypt.compare(candidatePassword, this.password);\n};\n\n// Method to update last active\nuserSchema.methods.updateLastActive = function() {\n  this.lastActive = new Date();\n  return this.save();\n};\n\n// Static method to create anonymous user\nuserSchema.statics.createAnonymousUser = function(anonymousId, campusId = null) {\n  return this.create({\n    anonymousId,\n    campusId,\n    isAnonymous: true\n  });\n};\n\n// Remove sensitive data when converting to JSON\nuserSchema.methods.toJSON = function() {\n  const user = this.toObject();\n  delete user.password;\n  return user;\n};\n\nmodule.exports = mongoose.model('User', userSchema);"}, {"file_name": "Campus-Shield/client/src/App.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/App.tsx", "markdown_link": "- [Campus-Shield/client/src/App.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/App.tsx)\n", "code_chunk": "import React from 'react';\nimport { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';\nimport { AuthProvider, useAuth } from './contexts/AuthContext';\nimport Navbar from './components/layout/Navbar';\nimport Home from './pages/Home';\nimport Login from './pages/Login';\nimport Register from './pages/Register';\nimport AdminLogin from './pages/AdminLogin';\nimport RequestAdmin from './pages/RequestAdmin';\nimport AdminRequests from './pages/AdminRequests';\nimport ReportIncident from './pages/ReportIncident';\nimport MyReports from './pages/MyReports';\nimport AdminDashboard from './pages/AdminDashboard';\nimport Chat from './pages/Chat';\nimport LoadingSpinner from './components/common/LoadingSpinner';\nimport ModeratorDashboard from './pages/ModeratorDashboard';\nimport { NotificationProvider } from './contexts/NotificationContext';\nimport NotificationBar from './components/common/NotificationBar';\nimport { ToastContainer } from 'react-toastify';\nimport 'react-toastify/dist/ReactToastify.css';\n\n// Protected Route Component\nconst ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; moderatorOnly?: boolean }> = ({\n  children,\n  adminOnly = false,\n  moderatorOnly = false\n}) => {\n  const { user, loading } = useAuth();\n\n  if (loading) return <LoadingSpinner />;\n  if (!user) return <Navigate to=\"/login\" replace />;\n  if (adminOnly && user.role !== 'admin') return <Navigate to=\"/\" replace />;\n  if (moderatorOnly && user.role !== 'moderator') return <Navigate to=\"/\" replace />;\n  return <>{children}</>;\n};\n\n// Main App Component\nconst AppContent: React.FC = () => {\n  const { user } = useAuth();\n\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <Navbar />\n      <main className=\"container mx-auto px-4 py-8\">\n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/login\" element={!user ? <Login /> : <Navigate to=\"/\" replace />} />\n          <Route path=\"/register\" element={!user ? <Register /> : <Navigate to=\"/\" replace />} />\n          <Route path=\"/admin-login\" element={!user ? <AdminLogin /> : <Navigate to=\"/admin\" replace />} />\n          <Route\n            path=\"/request-admin\"\n            element={\n              <ProtectedRoute>\n                <RequestAdmin />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/report\"\n            element={\n              <ProtectedRoute>\n                <ReportIncident />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/my-reports\"\n            element={\n              <ProtectedRoute>\n                <MyReports />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/chat\"\n            element={\n              <ProtectedRoute>\n                <Chat />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/admin\"\n            element={\n              <ProtectedRoute adminOnly>\n                <AdminDashboard />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/admin/requests\"\n            element={\n              <ProtectedRoute moderatorOnly>\n                <AdminRequests />\n              </ProtectedRoute>\n            }\n          />\n          <Route\n            path=\"/moderator\"\n            element={\n              <ProtectedRoute moderatorOnly>\n                <ModeratorDashboard />\n              </ProtectedRoute>\n            }\n          />\n          <Route path=\"*\" element={<Navigate to=\"/\" replace />} />\n        </Routes>\n      </main>\n    </div>\n  );\n};"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// In-memory data store for testing when MongoDB is not available\nclass MemoryStore {\n  constructor() {\n    this.users = new Map();\n    this.reports = new Map();\n    this.chatRooms = new Map();\n    this.messages = new Map();\n    this.adminRequests = new Map();\n    this.nextUserId = 1;\n    this.nextReportId = 1;\n    this.nextRoomId = 1;\n    this.nextMessageId = 1;\n    this.nextRequestId = 1;\n\n    // Initialize with pre-existing admin users\n    this.initializeAdminUsers();\n  }\n\n  initializeAdminUsers() {\n    // Pre-existing admin users - these should be provided by campus IT\n    const adminUsers = [\n      {\n        id: 'admin-001',\n        email: 'admin@campus.edu',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"password\"\n        role: 'admin',\n        anonymousId: 'admin-anon-001',\n        isAnonymous: false,\n        campusId: 'ADMIN001',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-002',\n        email: 'security@campus.edu',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"password\"\n        role: 'admin',\n        anonymousId: 'admin-anon-002',\n        isAnonymous: false,\n        campusId: 'ADMIN002',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-003',\n        email: 'normal@admin.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"admin\" (same hash as \"password\")\n        role: 'admin',\n        anonymousId: 'admin-anon-003',\n        isAnonymous: false,\n        campusId: 'ADMIN003',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'admin-004',\n        email: 'Iapprove@admin.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"approve\" (same hash as \"password\")\n        role: 'moderator',\n        anonymousId: 'moderator-anon-001',\n        isAnonymous: false,\n        campusId: 'MOD001',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      },\n      {\n        id: 'moderator-001',\n        email: 'moderator1@example.com',\n        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // \"moderatorpassword1\"\n        role: 'moderator',\n        anonymousId: 'moderator-anon-002',\n        isAnonymous: false,\n        campusId: 'MOD002',\n        createdAt: new Date('2024-01-01').toISOString(),\n        updatedAt: new Date('2024-01-01').toISOString()\n      }\n    ];\n\n    adminUsers.forEach(user => {\n      this.users.set(user.id, user);\n    });\n  }\n\n  // User operations\n  createUser(userData) {\n    const user = {\n      id: this.nextUserId.toString(),\n      ...userData,\n      role: 'user', // Default role is user, not admin\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString()\n    };\n    this.users.set(user.id, user);\n    this.nextUserId++;\n    return user;\n  }\n\n  findUserByEmail(email) {\n    for (const user of this.users.values()) {\n      if (user.email === email) {\n        return user;\n      }\n    }\n    return null;\n  }\n\n  findUserById(id) {\n    return this.users.get(id) || null;\n  }\n\n  updateUser(id, updates) {\n    const user = this.users.get(id);\n    if (user) {\n      Object.assign(user, updates, { updatedAt: new Date().toISOString() });\n      this.users.set(id, user);\n      return user;\n    }\n    return null;\n  }"}, {"file_name": "Campus-Shield/client/src/pages/RequestAdmin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/RequestAdmin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx)\n", "code_chunk": "<div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6\">\n          <div className=\"flex\">\n            <ShieldCheckIcon className=\"h-5 w-5 text-blue-400 mt-0.5\" />\n            <div className=\"ml-3\">\n              <h3 className=\"text-sm font-medium text-blue-800\">Important Information</h3>\n              <div className=\"mt-2 text-sm text-blue-700\">\n                <ul className=\"list-disc list-inside space-y-1\">\n                  <li>Admin access is granted only to authorized campus personnel</li>\n                  <li>Your request will be reviewed by existing administrators only</li>\n                  <li>Only pre-approved admins can approve new admin requests</li>\n                  <li>You will be notified of the decision via email</li>\n                  <li>Please provide a detailed reason for your request</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <form onSubmit={handleSubmit} className=\"space-y-6\">\n          {/* Personal Information */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Personal Information</h3>\n            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n              <div>\n                <label htmlFor=\"role\" className=\"form-label\">\n                  Your Role/Position *\n                </label>\n                <input\n                  id=\"role\"\n                  name=\"role\"\n                  type=\"text\"\n                  required\n                  value={formData.role}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Security Officer, IT Manager, Dean\"\n                />\n              </div>\n              <div>\n                <label htmlFor=\"department\" className=\"form-label\">\n                  Department/Unit *\n                </label>\n                <input\n                  id=\"department\"\n                  name=\"department\"\n                  type=\"text\"\n                  required\n                  value={formData.department}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Campus Security, IT Services, Student Affairs\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {/* Experience & Qualifications */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Experience & Qualifications</h3>\n            <div>\n              <label htmlFor=\"experience\" className=\"form-label\">\n                Relevant Experience *\n              </label>\n              <textarea\n                id=\"experience\"\n                name=\"experience\"\n                rows={3}\n                required\n                value={formData.experience}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your experience with campus safety, incident management, or administrative systems...\"\n              />\n            </div>\n          </div>\n\n          {/* Responsibilities */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Responsibilities & Duties</h3>\n            <div>\n              <label htmlFor=\"responsibilities\" className=\"form-label\">\n                Current Responsibilities *\n              </label>\n              <textarea\n                id=\"responsibilities\"\n                name=\"responsibilities\"\n                rows={3}\n                required\n                value={formData.responsibilities}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your current responsibilities that would benefit from admin access...\"\n              />\n            </div>\n          </div>"}, {"file_name": "Campus-Shield/env.example", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/env.example", "markdown_link": "- [Campus-Shield/env.example](https://github.com/sparrowdex/Campus-Shield/blob/main/env.example)\n", "code_chunk": "# CampusShield Environment Configuration\n\n# Server Configuration\nNODE_ENV=development\nPORT=5000\nCORS_ORIGIN=http://localhost:3000\n\n# Database Configuration\nMONGODB_URI=mongodb://localhost:27017/campusshield\n\n# JWT Configuration\nJWT_SECRET=your-super-secret-jwt-key-change-this-in-production\n\n# Rate Limiting\nRATE_LIMIT_WINDOW=900000\nRATE_LIMIT_MAX_REQUESTS=100\n\n# File Upload Configuration\nMAX_FILE_SIZE=10485760\nUPLOAD_PATH=uploads\n\n# Security Configuration\nBCRYPT_ROUNDS=12\n\n# AI/ML Service Configuration (for future integration)\nAI_SERVICE_URL=\nAI_SERVICE_KEY=\n\n# Notification Services (for future integration)\nFIREBASE_PROJECT_ID=\nFIREBASE_PRIVATE_KEY=\nFIREBASE_CLIENT_EMAIL=\n\nTWILIO_ACCOUNT_SID=\nTWILIO_AUTH_TOKEN=\nTWILIO_PHONE_NUMBER=\n\nSENDGRID_API_KEY=\nSENDGRID_FROM_EMAIL=\n\n# Maps Configuration\nGOOGLE_MAPS_API_KEY=\nMAPBOX_ACCESS_TOKEN=\n\n# File Storage (for future integration)\nAWS_ACCESS_KEY_ID=\nAWS_SECRET_ACCESS_KEY=\nAWS_REGION=\nAWS_S3_BUCKET=\n\n# Logging Configuration\nLOG_LEVEL=info\nLOG_FILE=logs/app.log\n\n# Data Retention (in days)\nUSER_DATA_RETENTION_DAYS=365\nREPORT_DATA_RETENTION_DAYS=730"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "return (\n    <div className=\"min-h-screen\">\n      {/* Hero Section */}\n      <section className=\"bg-gradient-to-br from-primary-600 to-primary-800 text-white\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24\">\n          <div className=\"text-center\">\n            <div className=\"flex justify-center mb-8\">\n              <ShieldCheckIcon className=\"h-16 w-16 text-white\" />\n            </div>\n            <h1 className=\"text-4xl md:text-6xl font-bold mb-6\">\n              {user?.role === 'admin' && 'Welcome, Admin! '}\n              {user?.role === 'moderator' && 'Welcome, Moderator! '}\n              Campus Safety,{' '}\n              <span className=\"text-primary-200\">Privacy First</span>\n            </h1>\n            <p className=\"text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto\">\n              Report campus safety incidents anonymously. Stay informed with real-time alerts. \n              Help create a safer campus community.\n            </p>\n            <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n              {user?.role === 'user' && (\n                <>\n                  <Link to=\"/report\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Report Incident\n                  </Link>\n                  <Link to=\"/my-reports\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    View My Reports\n                  </Link>\n                </>\n              )}\n              {user?.role === 'admin' && (\n                <>\n                  <Link to=\"/admin\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Dashboard\n                  </Link>\n                  <Link to=\"/chat\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Chat\n                  </Link>\n                </>\n              )}\n              {user?.role === 'moderator' && (\n                <>\n                  <Link to=\"/admin/requests\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Requests\n                  </Link>\n                </>\n              )}\n              {!user && (\n                <>\n                  <Link to=\"/register\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Get Started\n                  </Link>\n                  <Link to=\"/login\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Login\n                  </Link>\n                </>\n              )}\n            </div>\n          </div>\n        </div>\n      </section>\n\n      {/* Stats Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"grid grid-cols-2 md:grid-cols-4 gap-8\">\n            {stats.map((stat, index) => (\n              <div key={index} className=\"text-center\">\n                <div className=\"text-3xl md:text-4xl font-bold text-primary-600 mb-2\">\n                  {stat.value}\n                </div>\n                <div className=\"text-sm md:text-base text-gray-600\">\n                  {stat.label}\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>"}, {"file_name": "Campus-Shield/client/src/pages/Register.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Register.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Register.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Register.tsx)\n", "code_chunk": "import React, { useState } from 'react';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\nimport { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';\nimport LoadingSpinner from '../components/common/LoadingSpinner';\n\nconst Register: React.FC = () => {\n  const [formData, setFormData] = useState({\n    email: '',\n    password: '',\n    confirmPassword: '',\n    campusId: ''\n  });\n  const [showPassword, setShowPassword] = useState(false);\n  const [showConfirmPassword, setShowConfirmPassword] = useState(false);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n  \n  const { register, loginAnonymous } = useAuth();\n  const navigate = useNavigate();\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    setFormData({\n      ...formData,\n      [e.target.name]: e.target.value\n    });\n    setError('');\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n\n    if (formData.password !== formData.confirmPassword) {\n      setError('Passwords do not match');\n      setLoading(false);\n      return;\n    }\n\n    try {\n      await register(formData.email, formData.password, formData.campusId);\n      navigate('/');\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const handleAnonymousRegister = async () => {\n    setLoading(true);\n    setError('');\n\n    try {\n      await loginAnonymous(formData.campusId);\n      navigate('/');\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8\">\n      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"flex justify-center\">\n          <ShieldCheckIcon className=\"h-10 w-10 text-primary-600\" />\n        </div>\n        <h2 className=\"mt-6 text-center text-3xl font-extrabold text-gray-900\">\n          Create your account\n        </h2>\n        <p className=\"mt-2 text-center text-sm text-gray-600\">\n          Or{' '}\n          <Link to=\"/login\" className=\"font-medium text-primary-600 hover:text-primary-500\">\n            sign in to your existing account\n          </Link>\n        </p>\n      </div>\n\n      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10\">\n          {error && (\n            <div className=\"mb-4 bg-danger-50 border border-danger-200 rounded-md p-4\">\n              <p className=\"text-sm text-danger-700\">{error}</p>\n            </div>\n          )}\n\n          <form className=\"space-y-6\" onSubmit={handleSubmit}>\n            <div>\n              <label htmlFor=\"email\" className=\"form-label\">\n                Email address\n              </label>\n              <div className=\"mt-1\">\n                <input\n                  id=\"email\"\n                  name=\"email\"\n                  type=\"email\"\n                  autoComplete=\"email\"\n                  required\n                  value={formData.email}\n                  onChange={handleChange}\n                  className=\"input-field\"\n                  placeholder=\"Enter your email\"\n                />\n              </div>\n            </div>\n\n            <div>\n              <label htmlFor=\"campusId\" className=\"form-label\">\n                Campus ID (optional)\n              </label>\n              <div className=\"mt-1\">\n                <input\n                  id=\"campusId\"\n                  name=\"campusId\"\n                  type=\"text\"\n                  value={formData.campusId}\n                  onChange={handleChange}\n                  className=\"input-field\"\n                  placeholder=\"Enter your campus ID\"\n                />\n              </div>\n            </div>"}, {"file_name": "Campus-Shield/server/start.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/start.js", "markdown_link": "- [Campus-Shield/server/start.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/start.js)\n", "code_chunk": "#!/usr/bin/env node\n\n// Simple startup script for deployment\nconsole.log('\ud83d\ude80 Starting CampusShield Server...');\nconsole.log('\ud83d\udcca Environment:', process.env.NODE_ENV || 'development');\nconsole.log('\ud83d\udd17 Port:', process.env.PORT || 5000);\n\n// Check if MongoDB URI is set\nconsole.log('\ud83d\udd0d Environment variables check:');\nconsole.log('NODE_ENV:', process.env.NODE_ENV);\nconsole.log('PORT:', process.env.PORT);\nconsole.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);\nconsole.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);\nconsole.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('MONGODB')));\n\nif (!process.env.MONGODB_URI) {\n  console.warn('\u26a0\ufe0f  MONGODB_URI not set. Database features will not work.');\n  console.log('\ud83d\udca1 Please check your environment variables');\n  console.log('\ud83d\udca1 Make sure you added MONGODB_URI in the Variables tab');\n} else {\n  console.log('\u2705 MONGODB_URI is configured');\n  console.log('\ud83d\udd17 URI starts with:', process.env.MONGODB_URI.substring(0, 30) + '...');\n}\n\n// Start the server\nrequire('./index.js');"}, {"file_name": "Campus-Shield/client/src/pages/Login.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Login.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Login.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Login.tsx)\n", "code_chunk": "import React, { useState } from 'react';\nimport { Link, useNavigate } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';\nimport { ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';\nimport LoadingSpinner from '../components/common/LoadingSpinner';\n\nconst Login: React.FC = () => {\n  const [formData, setFormData] = useState({\n    email: '',\n    password: ''\n  });\n  const [showPassword, setShowPassword] = useState(false);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n  \n  const { login, loginAnonymous } = useAuth();\n  const navigate = useNavigate();\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    setFormData({\n      ...formData,\n      [e.target.name]: e.target.value\n    });\n    setError(''); // Clear error when user types\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n\n    try {\n      await login(formData.email, formData.password);\n      navigate('/');\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  const handleAnonymousLogin = async () => {\n    setLoading(true);\n    setError('');\n\n    try {\n      await loginAnonymous();\n      navigate('/');\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-2 sm:px-6 lg:px-8\">\n      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"flex justify-center\">\n          <ShieldCheckIcon className=\"h-10 w-10 text-primary-600\" />\n        </div>\n        <h2 className=\"mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900\">\n          Sign in to CampusShield\n        </h2>\n        <p className=\"mt-2 text-center text-sm text-gray-600\">\n          Or{' '}\n          <Link to=\"/register\" className=\"font-medium text-primary-600 hover:text-primary-500\">\n            create a new account\n          </Link>\n        </p>\n      </div>\n\n      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10\">\n          {error && (\n            <div className=\"mb-4 bg-danger-50 border border-danger-200 rounded-md p-4\">\n              <p className=\"text-sm text-danger-700\">{error}</p>\n            </div>\n          )}\n\n          <form className=\"space-y-6\" onSubmit={handleSubmit} autoComplete=\"on\">\n            <div className=\"flex flex-col gap-2\">\n              <label htmlFor=\"email\" className=\"form-label\">\n                Email address\n              </label>\n              <input\n                id=\"email\"\n                name=\"email\"\n                type=\"email\"\n                autoComplete=\"email\"\n                required\n                value={formData.email}\n                onChange={handleChange}\n                className=\"input-field w-full\"\n                placeholder=\"Enter your email\"\n              />\n            </div>"}, {"file_name": "Campus-Shield/server/routes/auth.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js", "markdown_link": "- [Campus-Shield/server/routes/auth.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js)\n", "code_chunk": "const user = memoryStore.createUser(userData);\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.status(201).json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }\n\n  } catch (error) {\n    console.error('Anonymous auth error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error during anonymous authentication'\n    });\n  }\n});\n\n// Enhanced /admin-login route with detailed logging\nrouter.post('/admin-login', [\n  body('email').isEmail().withMessage('Please enter a valid email'),\n  body('password').exists().withMessage('Password is required')\n], async (req, res) => {\n  try {\n    console.log('Admin login attempt:', req.body);\n\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      console.error('Validation errors:', errors.array());\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const { email, password } = req.body;\n\n    if (isMongoConnected()) {\n      const user = await User.findOne({ email });\n      if (!user) {\n        console.error('Admin user not found for email:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (user not found)'\n        });\n      }\n\n      const isMatch = await user.comparePassword(password);\n      if (!isMatch) {\n        console.error('Admin password mismatch for user:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (password mismatch)'\n        });\n      }\n\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        console.error('User does not have admin/moderator role:', email, user.role);\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      const token = generateToken(user._id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user._id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    } else {\n      // Use memory store\n      const user = memoryStore.findUserByEmail(email);\n      if (!user || !user.password) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Check password (with special handling for new admin accounts)\n      let isMatch = false;\n      if (user.email === 'normal@admin.com' && password === 'admin') {\n        isMatch = true;\n      } else if (user.email === 'Iapprove@admin.com' && password === 'approve') {\n        isMatch = true;\n      } else {\n        isMatch = await bcrypt.compare(password, user.password);\n      }\n      \n      if (!isMatch) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Only allow existing admins or moderators to login\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }"}]</code-reference>