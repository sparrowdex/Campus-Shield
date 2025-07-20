# Admin Dashboard

# Admin Dashboard Tutorial

This tutorial guides you through implementing the Admin Dashboard for the CampusShield project. The Admin Dashboard provides a centralized interface for administrators to manage reports, view statistics, and handle administrative tasks.

<artifact ArtifactUUID="7dbbd3cd-48db-4aca-ba09-b5f520c23ad2">Setting up the Admin Dashboard Component</artifact>

1. Create `AdminDashboard.tsx` in `client/src/pages/`:

```typescript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... Rest of the component implementation
}

export default AdminDashboard;
```

<artifact ArtifactUUID="30044c4d-1f1b-4c89-9426-0d39efaefdea">Implementing the Dashboard Layout</artifact>

2. Add the dashboard layout with statistics cards:

```typescript
return (
  <div className="max-w-7xl mx-auto">
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          {user?.role === 'moderator' && (
            <Link
              to="/admin/requests"
              className="btn-primary"
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Admin Requests
            </Link>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Administrator Access</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 rounded-md p-4">
          <p className="text-sm text-danger-700">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          {/* Add more stat cards for totalReports, pendingReports, and resolutionRate */}
        </div>
      )}

      {/* Add more dashboard sections like reports table, charts, etc. */}
    </div>
  </div>
);
```

<artifact ArtifactUUID="0d6b6a0d-7819-4a0d-84ba-91a3629a6115">Implementing Backend Routes for Admin Dashboard</artifact>

3. Create admin routes in `server/routes/admin.js`:

```javascript
const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Report = require('../models/Report');
const User = require('../models/User');

const router = express.Router();

router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0.0';

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalReports,
        pendingReports,
        resolvedReports,
        resolutionRate
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add more admin routes as needed

module.exports = router;
```

<artifact ArtifactUUID="4d588568-3220-44e9-a46e-2e98a336e133">Securing Admin Routes</artifact>

4. Implement admin middleware in `server/middleware/admin.js`:

```javascript
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

module.exports = admin;
```

<artifact ArtifactUUID="0a7f7bf2-6561-45d4-b128-76c0a0e09224">Integrating Admin Dashboard in the App</artifact>

5. Update `client/src/App.tsx` to include the Admin Dashboard route:

```typescript
import AdminDashboard from './pages/AdminDashboard';

// Inside the Routes component
<Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

<artifact ArtifactUUID="148f1d2d-e08d-4c9f-91b1-db7f94f2b634">Implementing Admin Login</artifact>

6. Create `AdminLogin.tsx` in `client/src/pages/`:

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(formData.email, formData.password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Implement form JSX and input handling
};

export default AdminLogin;
```

<artifact ArtifactUUID="c247e9c8-3a56-4fa9-92ec-36f8dd89b605">Enhancing Authentication Context</artifact>

7. Update `client/src/contexts/AuthContext.tsx` to include admin login functionality:

```typescript
const adminLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  } catch (error) {
    throw error;
  }
};

// Add adminLogin to the context value
```

<artifact ArtifactUUID="b99baca4-098b-4d7c-bd73-58c9a162925b">Updating Navigation for Admin Access</artifact>

8. Modify `client/src/components/layout/Navbar.tsx` to include admin navigation:

```typescript
{user?.role === 'admin' && (
  <Link to="/admin" className="nav-link">
    Admin Dashboard
  </Link>
)}
```

This tutorial provides a comprehensive guide to implementing the Admin Dashboard for CampusShield. It covers setting up the frontend component, creating backend routes, securing admin access, and integrating the dashboard into the application. The implementation includes features such as displaying statistics, managing reports, and handling admin requests.
## References:

<document-code-reference tutorial-step="admin-dashboard">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/AdminDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/client/src/pages/ModeratorDashboard.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ModeratorDashboard.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
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
    "name": "Campus-Shield/client/src/pages/AdminRequests.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  }
]}
</document-code-reference>
### Code:
<code-reference uuid='4c0c5737-07eb-4ec4-9209-0b2671b8864d'>[{"file_name": "Campus-Shield/SETUP_GUIDE.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md", "markdown_link": "- [Campus-Shield/SETUP_GUIDE.md](https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md)\n", "code_chunk": "# \ud83d\udee1\ufe0f CampusShield Setup Guide for Beginners\n\n## \ud83d\udccb Table of Contents\n1. [What is CampusShield?](#what-is-campusshield)\n2. [Cloning from GitHub](#cloning-from-github)\n3. [Prerequisites](#prerequisites)\n4. [Installation Steps](#installation-steps)\n5. [Running the Application](#running-the-application)\n6. [Understanding the Project Structure](#understanding-the-project-structure)\n7. [Common Issues & Solutions](#common-issues--solutions)\n8. [Development Workflow](#development-workflow)\n9. [Testing the Features](#testing-the-features)\n10. [Contributing](#contributing)\n\n---\n\n## \ud83c\udfaf What is CampusShield?\n\nCampusShield is a **privacy-first campus safety platform** that allows students to:\n- **Report incidents anonymously** with location tracking\n- **Chat securely** with campus authorities\n- **Track report status** and updates\n- **View safety analytics** and heatmaps\n\n---\n\n## \ud83d\ude80 Cloning from GitHub\n\nIf you are starting from the GitHub repository:\n```bash\ngit clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd CampusShield\n```\n\n---\n\n## \ud83d\udccb Prerequisites\n\nBefore you start, make sure you have these installed:\n\n### **Required Software:**\n- \u2705 **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)\n- \u2705 **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)\n- \u2705 **Git** (optional) - [Download here](https://git-scm.com/)\n\n### **How to Check if Installed:**\nOpen Command Prompt and type:\n```bash\nnode --version\nnpm --version\nmongod --version\n```\n\n---\n\n## \ud83d\ude80 Installation Steps\n\n### **Step 1: Download the Project**\n1. **Download** the CampusShield project files (or clone from GitHub)\n2. **Extract** to a folder (e.g., `C:\\CampusShield`)\n3. **Open Command Prompt** in that folder\n\n### **Step 2: Install Dependencies**\n```bash\n# Install backend dependencies\ncd server\nnpm install\n\n# Install frontend dependencies\ncd ../client\nnpm install\n```\n\n### **Step 3: Set Up MongoDB**\n1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)\n2. **Install with default settings** (Complete installation)\n3. **MongoDB will run as a Windows Service** (starts automatically)\n\n### **Step 4: Create Environment File**\n1. **Navigate to server folder**: `cd server`\n2. **Copy `.env.example` to `.env`**:\n   ```bash\n   copy .env.example .env\n   # Or manually create .env and copy the contents from .env.example\n   ```\n3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)\n\n### **Step 5: (Optional) Seed Admin/Moderator Accounts**\nIf you want demo admin/moderator accounts, run:\n```bash\ncd server\nnode seedAdmins.js\n```\n\n---\n\n## \ud83c\udfc3\u200d\u2642\ufe0f Running the Application\n\n### **You Need 2 Command Prompt Windows:**\n\n#### **Window 1: Backend Server**\n```bash\ncd server\nnpm run dev\n```\n**Expected Output:**\n```\n\ud83d\udce6 MongoDB Connected: localhost\n\ud83d\ude80 CampusShield server running on port 5000\n\ud83d\udcca Health check: http://localhost:5000/health\n\ud83d\udd12 Environment: development\n```\n\n#### **Window 2: Frontend Server**\n```bash\ncd client\nnpm start\n```\n**Expected Output:**\n```\nCompiled successfully!\n\nYou can now view campus-shield in the browser.\n\n  Local:            http://localhost:3000\n  On Your Network:  http://192.168.x.x:3000\n```\n\n### **Access the Application:**\n- **Frontend**: http://localhost:3000\n- **Backend API**: http://localhost:5000\n- **Health Check**: http://localhost:5000/health\n\n---\n\n## \ud83d\udcf1 Mobile Responsiveness\nCampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.\n\n---\n\n## \ud83d\udcc1 Understanding the Project Structure"}, {"file_name": "Campus-Shield/client/src/pages/AdminLogin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminLogin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminLogin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminLogin.tsx)\n", "code_chunk": "import React, { useState } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { \n  ShieldCheckIcon, \n  EyeIcon, \n  EyeSlashIcon,\n  ExclamationTriangleIcon\n} from '@heroicons/react/24/outline';\nimport LoadingSpinner from '../components/common/LoadingSpinner';\nimport { useAuth } from '../contexts/AuthContext';\n\nconst AdminLogin: React.FC = () => {\n  const navigate = useNavigate();\n  const { adminLogin, user } = useAuth();\n  const [formData, setFormData] = useState({\n    email: '',\n    password: ''\n  });\n  const [showPassword, setShowPassword] = useState(false);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n\n  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value\n    }));\n    setError('');\n  };\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setLoading(true);\n    setError('');\n\n    try {\n      await adminLogin(formData.email, formData.password);\n      // After login, user state is set in context\n      // Redirect based on role\n      const loggedInUser = user || JSON.parse(localStorage.getItem('user') || '{}');\n      if (loggedInUser.role === 'moderator') {\n        navigate('/admin/requests');\n      } else if (loggedInUser.role === 'admin') {\n        navigate('/admin');\n      } else {\n        navigate('/');\n      }\n    } catch (err: any) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8\">\n      <div className=\"sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"flex justify-center\">\n          <div className=\"flex items-center space-x-2\">\n            <ShieldCheckIcon className=\"h-12 w-12 text-primary-600\" />\n            <h1 className=\"text-3xl font-bold text-gray-900\">CampusShield</h1>\n          </div>\n        </div>\n        <h2 className=\"mt-6 text-center text-2xl font-bold text-gray-900\">\n          Administrative Access\n        </h2>\n        <p className=\"mt-2 text-center text-sm text-gray-600\">\n          Login for pre-authorized campus administrators and moderators\n        </p>\n      </div>\n\n      <div className=\"mt-8 sm:mx-auto sm:w-full sm:max-w-md\">\n        <div className=\"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10\">\n          <form className=\"space-y-6\" onSubmit={handleSubmit}>\n            {error && (\n              <div className=\"bg-danger-50 border border-danger-200 rounded-md p-4\">\n                <div className=\"flex\">\n                  <ExclamationTriangleIcon className=\"h-5 w-5 text-danger-400\" />\n                  <p className=\"ml-3 text-sm text-danger-700\">{error}</p>\n                </div>\n              </div>\n            )}\n\n            <div>\n              <label htmlFor=\"email\" className=\"form-label\">\n                Email Address\n              </label>\n              <input\n                id=\"email\"\n                name=\"email\"\n                type=\"email\"\n                autoComplete=\"email\"\n                required\n                value={formData.email}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"admin@campus.edu\"\n              />\n            </div>"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// Admin request operations\n  createAdminRequest(userId, requestData) {\n    const request = {\n      id: this.nextRequestId.toString(),\n      userId,\n      ...requestData,\n      status: 'pending', // pending, approved, rejected\n      createdAt: new Date().toISOString(),\n      reviewedBy: null,\n      reviewedAt: null,\n      reviewNotes: null\n    };\n    this.adminRequests.set(request.id, request);\n    this.nextRequestId++;\n    return request;\n  }\n\n  getAdminRequests(status = null) {\n    const requests = Array.from(this.adminRequests.values());\n    if (status) {\n      return requests.filter(req => req.status === status);\n    }\n    return requests;\n  }\n\n  updateAdminRequest(requestId, updates) {\n    const request = this.adminRequests.get(requestId);\n    if (request) {\n      Object.assign(request, updates, { \n        reviewedAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString()\n      });\n      this.adminRequests.set(requestId, request);\n      return request;\n    }\n    return null;\n  }\n\n  approveAdminRequest(requestId, approvedBy, notes = '') {\n    const request = this.updateAdminRequest(requestId, {\n      status: 'approved',\n      reviewedBy: approvedBy,\n      reviewNotes: notes\n    });\n\n    if (request) {\n      // Promote user to admin\n      this.updateUser(request.userId, { role: 'admin' });\n    }\n\n    return request;\n  }\n\n  rejectAdminRequest(requestId, rejectedBy, notes = '') {\n    return this.updateAdminRequest(requestId, {\n      status: 'rejected',\n      reviewedBy: rejectedBy,\n      reviewNotes: notes\n    });\n  }\n\n  // Report operations\n  createReport(reportData) {\n    const report = {\n      id: this.nextReportId.toString(),\n      ...reportData,\n      status: 'pending',\n      priority: 'medium',\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString(),\n      attachments: [],\n      publicUpdates: []\n    };\n    this.reports.set(report.id, report);\n    this.nextReportId++;\n    return report;\n  }\n\n  findReportsByUserId(userId) {\n    const userReports = [];\n    for (const report of this.reports.values()) {\n      if (report.userId === userId) {\n        userReports.push(report);\n      }\n    }\n    return userReports;\n  }\n\n  findReportById(id) {\n    return this.reports.get(id) || null;\n  }\n\n  updateReport(id, updates) {\n    const report = this.reports.get(id);\n    if (report) {\n      Object.assign(report, updates, { updatedAt: new Date().toISOString() });\n      this.reports.set(id, report);\n      return report;\n    }\n    return null;\n  }\n\n  // Chat operations\n  createChatRoom(roomData) {\n    const room = {\n      roomId: this.nextRoomId.toString(),\n      ...roomData,\n      createdAt: new Date().toISOString(),\n      lastMessage: null\n    };\n    this.chatRooms.set(room.roomId, room);\n    this.nextRoomId++;\n    return room;\n  }\n\n  findChatRoomByReportId(reportId) {\n    for (const room of this.chatRooms.values()) {\n      if (room.reportId === reportId) {\n        return room;\n      }\n    }\n    return null;\n  }\n\n  findChatRoomsByUserId(userId) {\n    const userRooms = [];\n    for (const room of this.chatRooms.values()) {\n      if (room.userId === userId) {\n        userRooms.push(room);\n      }\n    }\n    return userRooms;\n  }\n\n  createMessage(messageData) {\n    const message = {\n      id: this.nextMessageId.toString(),\n      ...messageData,\n      timestamp: new Date().toISOString()\n    };\n    this.messages.set(message.id, message);\n    this.nextMessageId++;\n    return message;\n  }\n\n  findMessagesByRoomId(roomId) {\n    const roomMessages = [];\n    for (const message of this.messages.values()) {\n      if (message.roomId === roomId) {\n        roomMessages.push(message);\n      }\n    }\n    return roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));\n  }\n\n  // Admin operations\n  getAllReports() {\n    return Array.from(this.reports.values());\n  }\n\n  getAllUsers() {\n    return Array.from(this.users.values());\n  }"}, {"file_name": "Campus-Shield/server/routes/admin.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js", "markdown_link": "- [Campus-Shield/server/routes/admin.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/admin.js)\n", "code_chunk": "const express = require('express');\nconst { body, validationResult, query } = require('express-validator');\nconst Report = require('../models/Report');\nconst User = require('../models/User');\nconst auth = require('../middleware/auth');\nconst admin = require('../middleware/admin');\nconst moderator = require('../middleware/moderator');\nconst memoryStore = require('../services/memoryStore');\nconst AdminRequest = require('../models/AdminRequest');\nconst ChatRoom = require('../models/ChatRoom');\n\nconst router = express.Router();\n\n// Check if MongoDB is connected\nconst isMongoConnected = () => {\n  return Report.db && Report.db.readyState === 1;\n};\n\n// @route   GET /api/admin/stats\n// @desc    Get admin dashboard statistics\n// @access  Private (Admin only)\nrouter.get('/stats', auth, admin, async (req, res) => {\n  try {\n    if (isMongoConnected()) {\n      // Get statistics from MongoDB\n      const totalUsers = await User.countDocuments();\n      const totalReports = await Report.countDocuments();\n      const pendingReports = await Report.countDocuments({ status: 'pending' });\n      const resolvedReports = await Report.countDocuments({ status: 'resolved' });\n      const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0.0';\n      \n      // Get recent reports (last 24 hours)\n      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);\n      const recentReports = await Report.countDocuments({\n        createdAt: { $gte: yesterday }\n      });\n\n      res.json({\n        success: true,\n        stats: {\n          totalUsers,\n          totalReports,\n          pendingReports,\n          resolvedReports,\n          resolutionRate,\n          recentReports,\n          activeChats: 0 // TODO: Implement chat counting\n        }\n      });\n    } else {\n      // Use memory store\n      const stats = memoryStore.getStats();\n      const allReports = memoryStore.getAllReports();\n      \n      // Calculate recent reports (last 24 hours)\n      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);\n      const recentReports = allReports.filter(report => \n        new Date(report.createdAt) >= yesterday\n      ).length;\n\n      res.json({\n        success: true,\n        stats: {\n          totalUsers: stats.totalUsers,\n          totalReports: stats.totalReports,\n          pendingReports: stats.pendingReports,\n          resolvedReports: stats.resolvedReports,\n          resolutionRate: stats.resolutionRate,\n          recentReports,\n          activeChats: 0 // TODO: Implement chat counting\n        }\n      });\n    }\n  } catch (error) {\n    console.error('Stats error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error'\n    });\n  }\n});\n\n// @route   GET /api/admin/dashboard\n// @desc    Get admin dashboard data\n// @access  Private (Admin only)\nrouter.get('/dashboard', auth, admin, async (req, res) => {\n  try {\n    const { startDate, endDate } = req.query;\n    \n    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago\n    const end = endDate ? new Date(endDate) : new Date();\n\n    // Get statistics\n    const totalReports = await Report.countDocuments({\n      createdAt: { $gte: start, $lte: end }\n    });\n\n    const pendingReports = await Report.countDocuments({\n      status: 'pending',\n      createdAt: { $gte: start, $lte: end }\n    });\n\n    const resolvedReports = await Report.countDocuments({\n      status: 'resolved',\n      createdAt: { $gte: start, $lte: end }\n    });\n\n    // Get category breakdown\n    const categoryStats = await Report.aggregate([\n      {\n        $match: {\n          createdAt: { $gte: start, $lte: end }\n        }\n      },\n      {\n        $group: {\n          _id: '$category',\n          count: { $sum: 1 }\n        }\n      },\n      {\n        $sort: { count: -1 }\n      }\n    ]);"}, {"file_name": "Campus-Shield/client/src/pages/AdminDashboard.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminDashboard.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx)\n", "code_chunk": "const assignedToIdStr = assignedToId ? String(assignedToId) : null;\n  const currentUserIdStr = currentUserId ? String(currentUserId) : null;\n\n  console.log('currentUserId:', currentUserId);\n  console.log('assignedToId:', assignedToId);\n  console.log('selectedReport:', selectedReport);\n\n  return (\n    <div className=\"max-w-7xl mx-auto\">\n      <div className=\"card\">\n        <div className=\"flex items-center justify-between mb-6\">\n          <h1 className=\"text-2xl font-bold text-gray-900\">Admin Dashboard</h1>\n          <div className=\"flex items-center space-x-4\">\n            {user?.role === 'moderator' && (\n              <Link\n                to=\"/admin/requests\"\n                className=\"btn-primary\"\n              >\n                <ShieldCheckIcon className=\"h-4 w-4 mr-2\" />\n                Admin Requests\n              </Link>\n            )}\n            <div className=\"flex items-center space-x-2 text-sm text-gray-500\">\n              <ShieldCheckIcon className=\"h-5 w-5\" />\n              <span>Administrator Access</span>\n            </div>\n          </div>\n        </div>\n\n        {error && (\n          <div className=\"mb-6 bg-danger-50 border border-danger-200 rounded-md p-4\">\n            <p className=\"text-sm text-danger-700\">{error}</p>\n          </div>\n        )}\n\n        {/* Stats Cards */}\n        {stats && (\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8\">\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-primary-100 rounded-lg\">\n                  <UsersIcon className=\"h-6 w-6 text-primary-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Total Users</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.totalUsers}</p>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-warning-100 rounded-lg\">\n                  <ExclamationTriangleIcon className=\"h-6 w-6 text-warning-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Total Reports</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.totalReports}</p>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-danger-100 rounded-lg\">\n                  <ClockIcon className=\"h-6 w-6 text-danger-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Pending Reports</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.pendingReports}</p>\n                </div>\n              </div>\n            </div>\n\n            <div className=\"bg-white p-6 rounded-lg border border-gray-200\">\n              <div className=\"flex items-center\">\n                <div className=\"p-2 bg-success-100 rounded-lg\">\n                  <CheckCircleIcon className=\"h-6 w-6 text-success-600\" />\n                </div>\n                <div className=\"ml-4\">\n                  <p className=\"text-sm font-medium text-gray-600\">Resolution Rate</p>\n                  <p className=\"text-2xl font-bold text-gray-900\">{stats.resolutionRate}%</p>\n                </div>\n              </div>\n            </div>\n          </div>\n        )}"}, {"file_name": "Campus-Shield/client/src/pages/RequestAdmin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/RequestAdmin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx)\n", "code_chunk": "<div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6\">\n          <div className=\"flex\">\n            <ShieldCheckIcon className=\"h-5 w-5 text-blue-400 mt-0.5\" />\n            <div className=\"ml-3\">\n              <h3 className=\"text-sm font-medium text-blue-800\">Important Information</h3>\n              <div className=\"mt-2 text-sm text-blue-700\">\n                <ul className=\"list-disc list-inside space-y-1\">\n                  <li>Admin access is granted only to authorized campus personnel</li>\n                  <li>Your request will be reviewed by existing administrators only</li>\n                  <li>Only pre-approved admins can approve new admin requests</li>\n                  <li>You will be notified of the decision via email</li>\n                  <li>Please provide a detailed reason for your request</li>\n                </ul>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <form onSubmit={handleSubmit} className=\"space-y-6\">\n          {/* Personal Information */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Personal Information</h3>\n            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n              <div>\n                <label htmlFor=\"role\" className=\"form-label\">\n                  Your Role/Position *\n                </label>\n                <input\n                  id=\"role\"\n                  name=\"role\"\n                  type=\"text\"\n                  required\n                  value={formData.role}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Security Officer, IT Manager, Dean\"\n                />\n              </div>\n              <div>\n                <label htmlFor=\"department\" className=\"form-label\">\n                  Department/Unit *\n                </label>\n                <input\n                  id=\"department\"\n                  name=\"department\"\n                  type=\"text\"\n                  required\n                  value={formData.department}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"e.g., Campus Security, IT Services, Student Affairs\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {/* Experience & Qualifications */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Experience & Qualifications</h3>\n            <div>\n              <label htmlFor=\"experience\" className=\"form-label\">\n                Relevant Experience *\n              </label>\n              <textarea\n                id=\"experience\"\n                name=\"experience\"\n                rows={3}\n                required\n                value={formData.experience}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your experience with campus safety, incident management, or administrative systems...\"\n              />\n            </div>\n          </div>\n\n          {/* Responsibilities */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Responsibilities & Duties</h3>\n            <div>\n              <label htmlFor=\"responsibilities\" className=\"form-label\">\n                Current Responsibilities *\n              </label>\n              <textarea\n                id=\"responsibilities\"\n                name=\"responsibilities\"\n                rows={3}\n                required\n                value={formData.responsibilities}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Describe your current responsibilities that would benefit from admin access...\"\n              />\n            </div>\n          </div>"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "return (\n    <div className=\"min-h-screen\">\n      {/* Hero Section */}\n      <section className=\"bg-gradient-to-br from-primary-600 to-primary-800 text-white\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24\">\n          <div className=\"text-center\">\n            <div className=\"flex justify-center mb-8\">\n              <ShieldCheckIcon className=\"h-16 w-16 text-white\" />\n            </div>\n            <h1 className=\"text-4xl md:text-6xl font-bold mb-6\">\n              {user?.role === 'admin' && 'Welcome, Admin! '}\n              {user?.role === 'moderator' && 'Welcome, Moderator! '}\n              Campus Safety,{' '}\n              <span className=\"text-primary-200\">Privacy First</span>\n            </h1>\n            <p className=\"text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto\">\n              Report campus safety incidents anonymously. Stay informed with real-time alerts. \n              Help create a safer campus community.\n            </p>\n            <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n              {user?.role === 'user' && (\n                <>\n                  <Link to=\"/report\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Report Incident\n                  </Link>\n                  <Link to=\"/my-reports\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    View My Reports\n                  </Link>\n                </>\n              )}\n              {user?.role === 'admin' && (\n                <>\n                  <Link to=\"/admin\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Dashboard\n                  </Link>\n                  <Link to=\"/chat\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Chat\n                  </Link>\n                </>\n              )}\n              {user?.role === 'moderator' && (\n                <>\n                  <Link to=\"/admin/requests\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Admin Requests\n                  </Link>\n                </>\n              )}\n              {!user && (\n                <>\n                  <Link to=\"/register\" className=\"btn-primary bg-white text-primary-600 hover:bg-gray-100\">\n                    Get Started\n                  </Link>\n                  <Link to=\"/login\" className=\"btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600\">\n                    Login\n                  </Link>\n                </>\n              )}\n            </div>\n          </div>\n        </div>\n      </section>\n\n      {/* Stats Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"grid grid-cols-2 md:grid-cols-4 gap-8\">\n            {stats.map((stat, index) => (\n              <div key={index} className=\"text-center\">\n                <div className=\"text-3xl md:text-4xl font-bold text-primary-600 mb-2\">\n                  {stat.value}\n                </div>\n                <div className=\"text-sm md:text-base text-gray-600\">\n                  {stat.label}\n                </div>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>"}, {"file_name": "Campus-Shield/client/src/pages/AdminRequests.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminRequests.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminRequests.tsx)\n", "code_chunk": "<div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Applicant Information</h3>\n                  <div className=\"grid grid-cols-2 gap-4\">\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Email:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.user?.email}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Role:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.role}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Department:</span>\n                      <p className=\"text-sm text-gray-900\">{selectedRequest.department}</p>\n                    </div>\n                    <div>\n                      <span className=\"text-sm font-medium text-gray-700\">Urgency:</span>\n                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedRequest.urgency)}`}>\n                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}\n                      </span>\n                    </div>\n                  </div>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Experience</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.experience}</p>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Current Responsibilities</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.responsibilities}</p>\n                </div>\n\n                <div>\n                  <h3 className=\"font-medium text-gray-900 mb-2\">Reason for Admin Access</h3>\n                  <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.reason}</p>\n                </div>\n\n                {selectedRequest.contactInfo && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Additional Contact</h3>\n                    <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.contactInfo}</p>\n                  </div>\n                )}\n\n                {selectedRequest.status === 'pending' && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Review Notes</h3>\n                    <textarea\n                      value={reviewNotes}\n                      onChange={(e) => setReviewNotes(e.target.value)}\n                      className=\"input-field\"\n                      rows={3}\n                      placeholder=\"Add notes about your decision...\"\n                    />\n                  </div>\n                )}\n\n                {selectedRequest.status !== 'pending' && selectedRequest.reviewNotes && (\n                  <div>\n                    <h3 className=\"font-medium text-gray-900 mb-2\">Review Notes</h3>\n                    <p className=\"text-sm text-gray-700 bg-gray-50 p-3 rounded\">{selectedRequest.reviewNotes}</p>\n                  </div>\n                )}"}, {"file_name": "Campus-Shield/server/routes/auth.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js", "markdown_link": "- [Campus-Shield/server/routes/auth.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/auth.js)\n", "code_chunk": "const user = memoryStore.createUser(userData);\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.status(201).json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }\n\n  } catch (error) {\n    console.error('Anonymous auth error:', error);\n    res.status(500).json({\n      success: false,\n      message: 'Server error during anonymous authentication'\n    });\n  }\n});\n\n// Enhanced /admin-login route with detailed logging\nrouter.post('/admin-login', [\n  body('email').isEmail().withMessage('Please enter a valid email'),\n  body('password').exists().withMessage('Password is required')\n], async (req, res) => {\n  try {\n    console.log('Admin login attempt:', req.body);\n\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      console.error('Validation errors:', errors.array());\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const { email, password } = req.body;\n\n    if (isMongoConnected()) {\n      const user = await User.findOne({ email });\n      if (!user) {\n        console.error('Admin user not found for email:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (user not found)'\n        });\n      }\n\n      const isMatch = await user.comparePassword(password);\n      if (!isMatch) {\n        console.error('Admin password mismatch for user:', email);\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials (password mismatch)'\n        });\n      }\n\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        console.error('User does not have admin/moderator role:', email, user.role);\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      const token = generateToken(user._id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user._id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    } else {\n      // Use memory store\n      const user = memoryStore.findUserByEmail(email);\n      if (!user || !user.password) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Check password (with special handling for new admin accounts)\n      let isMatch = false;\n      if (user.email === 'normal@admin.com' && password === 'admin') {\n        isMatch = true;\n      } else if (user.email === 'Iapprove@admin.com' && password === 'approve') {\n        isMatch = true;\n      } else {\n        isMatch = await bcrypt.compare(password, user.password);\n      }\n      \n      if (!isMatch) {\n        return res.status(400).json({\n          success: false,\n          message: 'Invalid credentials'\n        });\n      }\n\n      // Only allow existing admins or moderators to login\n      if (user.role !== 'admin' && user.role !== 'moderator') {\n        return res.status(403).json({\n          success: false,\n          message: 'Access denied. Administrative privileges required.'\n        });\n      }\n\n      // Generate token\n      const token = generateToken(user.id, user.role);\n\n      res.json({\n        success: true,\n        token,\n        user: {\n          id: user.id,\n          anonymousId: user.anonymousId,\n          email: user.email,\n          role: user.role,\n          isAnonymous: user.isAnonymous,\n          campusId: user.campusId\n        }\n      });\n    }"}]</code-reference>