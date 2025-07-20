# Report Model

## Report Model Overview

The Report Model is a crucial component of the Campus-Shield system, defining the structure and behavior of incident reports. It utilizes MongoDB's schema definition and provides methods for report management.

<artifact ArtifactUUID="39da710e-0f5e-4086-9b6d-8ecba5203260">Schema Definition and Fields</artifact>

The Report schema includes fields for:

- Reporter identification (anonymized)
- Report content (title, description)
- Incident categorization
- AI-generated fields (category, priority, sentiment)
- Location data (coordinates, address, building, floor)
- Timestamp
- Media attachments
- Report status and handling
- Privacy and data retention

Key fields include:

```javascript
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
  // ... other fields
});
```

## Indexing and Performance Optimization

<document-code-reference section="Indexing and Performance Optimization">
{"files": [
  {
    "name": "Campus-Shield/server/models/Report.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
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

The Report Model implements several indexes to optimize query performance:

```javascript
reportSchema.index({ createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ category: 1, createdAt: -1 });
reportSchema.index({ priority: 1, status: 1 });
reportSchema.index({ 'location.coordinates': '2dsphere' });
reportSchema.index({ dataRetentionDate: 1 });
```

These indexes improve the efficiency of common queries, such as filtering by status, category, and location.

<artifact ArtifactUUID="5b1116e3-973b-4ada-a476-1382ecf87c24">Methods and Functionality</artifact>

The Report Model includes several methods to enhance its functionality:

1. Pre-save middleware:
   ```javascript
   reportSchema.pre('save', function(next) {
     this.updatedAt = Date.now();
     next();
   });
   ```

2. Adding admin notes:
   ```javascript
   reportSchema.methods.addAdminNote = function(note, adminId) {
     this.adminNotes.push({
       note,
       addedBy: adminId
     });
     return this.save();
   };
   ```

3. Adding public updates:
   ```javascript
   reportSchema.methods.addPublicUpdate = function(message) {
     this.publicUpdates.push({
       message
     });
     return this.save();
   };
   ```

4. Updating report status:
   ```javascript
   reportSchema.methods.updateStatus = function(newStatus, adminId = null) {
     this.status = newStatus;
     if (adminId) {
       this.assignedTo = adminId;
     }
     return this.save();
   };
   ```

## Geospatial Queries

<document-code-reference section="Geospatial Queries">
{"files": [
  {
    "name": "Campus-Shield/server/models/Report.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
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

The Report Model supports geospatial queries for retrieving reports near a specific location:

```javascript
reportSchema.statics.getReportsNearLocation = function(longitude, latitude, radiusInMeters = 1000, limit = 50) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInMeters
      }
    },
    status: { $ne: 'closed' }
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};
```

## Heatmap Data Generation

<document-code-reference section="Heatmap Data Generation">
{"files": [
  {
    "name": "Campus-Shield/server/models/Report.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
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

The model includes a method for generating heatmap data based on report locations:

```javascript
reportSchema.statics.getHeatmapData = function(startDate, endDate, categories = []) {
  const query = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (categories.length > 0) {
    query.category = { $in: categories };
  }
  
  return this.find(query, {
    'location.coordinates': 1,
    category: 1,
    priority: 1,
    createdAt: 1
  });
};
```

<artifact ArtifactUUID="68b1c92b-718d-40cd-ad6c-09028d1990ef">Integration with Report Routes</artifact>

The Report Model is extensively used in the report routes (`server/routes/reports.js`) for creating, retrieving, and updating reports. Key operations include:

1. Creating a new report
2. Retrieving reports with pagination and filtering
3. Fetching a specific report by ID
4. Generating heatmap data
5. Finding reports near a given location

These routes utilize the Report Model's methods and schema to ensure data integrity and efficient querying.

## Frontend Integration

<document-code-reference section="Frontend Integration">
{"files": [
  {
    "name": "Campus-Shield/server/models/Report.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
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

The Report Model's structure is reflected in the frontend components, particularly in the `ReportIncident.tsx` and `MyReports.tsx` pages. These components use the model's fields to structure forms for report submission and display report details.

The `IncidentHeatMap.tsx` component leverages the heatmap data generation method to visualize report locations on a map.

## Security and Privacy Considerations

<document-code-reference section="Security and Privacy Considerations">
{"files": [
  {
    "name": "Campus-Shield/server/models/Report.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/server/models"
  },
  {
    "name": "Campus-Shield/server/middleware/moderator.js",
    "description": "JavaScript/TypeScript implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/middleware/moderator.js",
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

The Report Model incorporates several security and privacy features:

1. Anonymized reporter identification
2. Data retention policies
3. Controlled access to sensitive information (e.g., admin notes)
4. Integration with authentication middleware for secure API access

These features ensure that the Campus-Shield system handles incident reports with the necessary confidentiality and data protection measures.
## References:
### Code:
<code-reference uuid='61909ab0-4ae3-45b9-af7e-4d98d85f99ac'>[{"file_name": "Campus-Shield/server/routes/reports.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js", "markdown_link": "- [Campus-Shield/server/routes/reports.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js)\n", "code_chunk": "const express = require('express');\nconst multer = require('multer');\nconst path = require('path');\nconst { body, validationResult, query } = require('express-validator');\nconst Report = require('../models/Report');\nconst auth = require('../middleware/auth');\nconst { categorizeReport, analyzeSentiment } = require('../services/aiService');\nconst memoryStore = require('../services/memoryStore');\n\nconst router = express.Router();\n\n// Check if MongoDB is connected\nconst isMongoConnected = () => {\n  return Report.db && Report.db.readyState === 1;\n};\n\n// Configure multer for file uploads\nconst storage = multer.diskStorage({\n  destination: (req, file, cb) => {\n    cb(null, 'uploads/');\n  },\n  filename: (req, file, cb) => {\n    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);\n    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));\n  }\n});\n\nconst upload = multer({\n  storage: storage,\n  limits: {\n    fileSize: 10 * 1024 * 1024, // 10MB limit\n  },\n  fileFilter: (req, file, cb) => {\n    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wav|mp3|pdf/;\n    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());\n    const mimetype = allowedTypes.test(file.mimetype);\n    \n    if (mimetype && extname) {\n      return cb(null, true);\n    } else {\n      cb(new Error('Only image, video, audio, and PDF files are allowed'));\n    }\n  }\n});\n\n// @route   POST /api/reports\n// @desc    Submit a new incident report\n// @access  Private\nrouter.post('/', auth, upload.array('attachments', 5), [\n  body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),\n  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),\n  body('category').isIn([\n    'harassment', 'assault', 'theft', 'vandalism', 'suspicious_activity',\n    'emergency', 'safety_hazard', 'discrimination', 'bullying', 'other'\n  ]).withMessage('Invalid category'),\n  // Add a custom sanitizer for coordinates\n  body('location.coordinates').customSanitizer(value => {\n    if (typeof value === 'string') {\n      try {\n        return JSON.parse(value);\n      } catch {\n        return value;\n      }\n    }\n    return value;\n  }),\n  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),\n  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),\n  body('incidentTime').optional().isISO8601().withMessage('Invalid date format')\n], async (req, res) => {\n  try {\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const {\n      title,\n      description,\n      category,\n      location,\n      incidentTime\n    } = req.body;\n\n    // Get user info\n    const user = req.user;\n\n    // Process attachments\n    const attachments = req.files ? req.files.map(file => ({\n      filename: file.filename,\n      originalName: file.originalname,\n      mimetype: file.mimetype,\n      size: file.size,\n      path: file.path\n    })) : [];\n\n    // Parse coordinates if sent as a string\n    let coordinates = location.coordinates;\n    if (typeof coordinates === 'string') {\n      try {\n        coordinates = JSON.parse(coordinates);\n      } catch (e) {\n        coordinates = undefined;\n      }\n    }\n\n    // Create report data\n    const reportData = {\n      reporterId: user.userId,\n      title,\n      description,\n      category,\n      location: {\n        type: 'Point',\n        coordinates: coordinates || location.coordinates,\n        address: location.address || '',\n        building: location.building || '',\n        floor: location.floor || ''\n      },\n      incidentTime: incidentTime || new Date(),\n      attachments,\n      isAnonymous: user.isAnonymous || true,\n      ipAddress: req.ip,\n      userAgent: req.get('User-Agent')\n    };"}, {"file_name": "Campus-Shield/client/src/pages/AdminDashboard.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminDashboard.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx)\n", "code_chunk": "{/* Heatmap Section */}\n        <div className=\"mt-8 bg-white p-6 rounded-lg border border-gray-200\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Incident Heatmap</h3>\n          <IncidentHeatMap />\n        </div>\n      </div>\n\n      {/* Report Detail Modal */}\n      {selectedReport && (\n        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50\">\n          <div className=\"bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-60\">\n            <div className=\"p-6\">\n              <div className=\"flex items-center justify-between mb-4\">\n                <h2 className=\"text-xl font-bold text-gray-900\">Report Details</h2>\n                <button\n                  onClick={() => setSelectedReport(null)}\n                  className=\"text-gray-400 hover:text-gray-600\"\n                >\n                  <XMarkIcon className=\"h-6 w-6\" />\n                </button>\n              </div>\n\n              <div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-semibold text-gray-900 mb-2\">{selectedReport.title}</h3>\n                  <div className=\"flex items-center space-x-3 mb-3\">\n                    <span className={`badge ${statusColors[selectedReport.status as keyof typeof statusColors]}`}>\n                      {selectedReport.status.replace('_', ' ').toUpperCase()}\n                    </span>\n                    <span className={`badge ${priorityColors[selectedReport.priority as keyof typeof priorityColors]}`}>\n                      {selectedReport.priority.toUpperCase()}\n                    </span>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Description</h4>\n                  <p className=\"text-gray-600\">{selectedReport.description}</p>\n                </div>\n\n                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Category</h4>\n                    <p className=\"text-gray-600 capitalize\">\n                      {categoryLabels[selectedReport.category as keyof typeof categoryLabels] || selectedReport.category}\n                    </p>\n                  </div>\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Incident Time</h4>\n                    <p className=\"text-gray-600\">{formatDate(selectedReport.incidentTime)}</p>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Location</h4>\n                  <div className=\"text-gray-600\">\n                    {selectedReport.location?.address && <p>{selectedReport.location.address}</p>}\n                    {selectedReport.location?.building && <p>Building: {selectedReport.location.building}</p>}\n                    {selectedReport.location?.floor && <p>Floor: {selectedReport.location.floor}</p>}\n                    {!selectedReport.location?.address && !selectedReport.location?.building && !selectedReport.location?.floor && (\n                      <p className=\"text-gray-500\">Location not specified</p>\n                    )}\n                  </div>\n                </div>"}, {"file_name": "Campus-Shield/SETUP_GUIDE.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md", "markdown_link": "- [Campus-Shield/SETUP_GUIDE.md](https://github.com/sparrowdex/Campus-Shield/blob/main/SETUP_GUIDE.md)\n", "code_chunk": "# \ud83d\udee1\ufe0f CampusShield Setup Guide for Beginners\n\n## \ud83d\udccb Table of Contents\n1. [What is CampusShield?](#what-is-campusshield)\n2. [Cloning from GitHub](#cloning-from-github)\n3. [Prerequisites](#prerequisites)\n4. [Installation Steps](#installation-steps)\n5. [Running the Application](#running-the-application)\n6. [Understanding the Project Structure](#understanding-the-project-structure)\n7. [Common Issues & Solutions](#common-issues--solutions)\n8. [Development Workflow](#development-workflow)\n9. [Testing the Features](#testing-the-features)\n10. [Contributing](#contributing)\n\n---\n\n## \ud83c\udfaf What is CampusShield?\n\nCampusShield is a **privacy-first campus safety platform** that allows students to:\n- **Report incidents anonymously** with location tracking\n- **Chat securely** with campus authorities\n- **Track report status** and updates\n- **View safety analytics** and heatmaps\n\n---\n\n## \ud83d\ude80 Cloning from GitHub\n\nIf you are starting from the GitHub repository:\n```bash\ngit clone https://github.com/YOUR_USERNAME/YOUR_REPO.git\ncd CampusShield\n```\n\n---\n\n## \ud83d\udccb Prerequisites\n\nBefore you start, make sure you have these installed:\n\n### **Required Software:**\n- \u2705 **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)\n- \u2705 **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)\n- \u2705 **Git** (optional) - [Download here](https://git-scm.com/)\n\n### **How to Check if Installed:**\nOpen Command Prompt and type:\n```bash\nnode --version\nnpm --version\nmongod --version\n```\n\n---\n\n## \ud83d\ude80 Installation Steps\n\n### **Step 1: Download the Project**\n1. **Download** the CampusShield project files (or clone from GitHub)\n2. **Extract** to a folder (e.g., `C:\\CampusShield`)\n3. **Open Command Prompt** in that folder\n\n### **Step 2: Install Dependencies**\n```bash\n# Install backend dependencies\ncd server\nnpm install\n\n# Install frontend dependencies\ncd ../client\nnpm install\n```\n\n### **Step 3: Set Up MongoDB**\n1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)\n2. **Install with default settings** (Complete installation)\n3. **MongoDB will run as a Windows Service** (starts automatically)\n\n### **Step 4: Create Environment File**\n1. **Navigate to server folder**: `cd server`\n2. **Copy `.env.example` to `.env`**:\n   ```bash\n   copy .env.example .env\n   # Or manually create .env and copy the contents from .env.example\n   ```\n3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)\n\n### **Step 5: (Optional) Seed Admin/Moderator Accounts**\nIf you want demo admin/moderator accounts, run:\n```bash\ncd server\nnode seedAdmins.js\n```\n\n---\n\n## \ud83c\udfc3\u200d\u2642\ufe0f Running the Application\n\n### **You Need 2 Command Prompt Windows:**\n\n#### **Window 1: Backend Server**\n```bash\ncd server\nnpm run dev\n```\n**Expected Output:**\n```\n\ud83d\udce6 MongoDB Connected: localhost\n\ud83d\ude80 CampusShield server running on port 5000\n\ud83d\udcca Health check: http://localhost:5000/health\n\ud83d\udd12 Environment: development\n```\n\n#### **Window 2: Frontend Server**\n```bash\ncd client\nnpm start\n```\n**Expected Output:**\n```\nCompiled successfully!\n\nYou can now view campus-shield in the browser.\n\n  Local:            http://localhost:3000\n  On Your Network:  http://192.168.x.x:3000\n```\n\n### **Access the Application:**\n- **Frontend**: http://localhost:3000\n- **Backend API**: http://localhost:5000\n- **Health Check**: http://localhost:5000/health\n\n---\n\n## \ud83d\udcf1 Mobile Responsiveness\nCampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.\n\n---\n\n## \ud83d\udcc1 Understanding the Project Structure"}, {"file_name": "Campus-Shield/server/models/Report.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js", "markdown_link": "- [Campus-Shield/server/models/Report.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js)\n", "code_chunk": "const mongoose = require('mongoose');\n\nconst reportSchema = new mongoose.Schema({\n  // Anonymous reporter identification\n  reporterId: {\n    type: String,\n    required: true,\n    index: true\n  },\n  \n  // Report content\n  title: {\n    type: String,\n    required: true,\n    maxlength: 200,\n    trim: true\n  },\n  \n  description: {\n    type: String,\n    required: true,\n    maxlength: 2000,\n    trim: true\n  },\n  \n  // Incident categorization\n  category: {\n    type: String,\n    required: true,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  // AI-generated fields\n  aiCategory: {\n    type: String,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  priority: {\n    type: String,\n    enum: ['low', 'medium', 'high', 'critical'],\n    default: 'medium'\n  },\n  \n  sentiment: {\n    type: String,\n    enum: ['positive', 'neutral', 'negative', 'distressed'],\n    default: 'neutral'\n  },\n  \n  // Location data (generalized for privacy)\n  location: {\n    type: {\n      type: String,\n      enum: ['Point'],\n      default: 'Point'\n    },\n    coordinates: {\n      type: [Number], // [longitude, latitude]\n      required: true,\n      index: '2dsphere'\n    },\n    address: {\n      type: String,\n      maxlength: 200\n    },\n    building: {\n      type: String,\n      maxlength: 100\n    },\n    floor: {\n      type: String,\n      maxlength: 20\n    }\n  },\n  \n  // Timestamp\n  incidentTime: {\n    type: Date,\n    required: true,\n    default: Date.now\n  },\n  \n  // Media attachments\n  attachments: [{\n    filename: String,\n    originalName: String,\n    mimetype: String,\n    size: Number,\n    path: String,\n    uploadedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Report status and handling\n  status: {\n    type: String,\n    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed'],\n    default: 'pending'\n  },\n  \n  assignedTo: {\n    type: mongoose.Schema.Types.ObjectId,\n    ref: 'User'\n  },\n  \n  // Admin notes (private)\n  adminNotes: [{\n    note: String,\n    addedBy: {\n      type: mongoose.Schema.Types.ObjectId,\n      ref: 'User'\n    },\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Public updates for reporter\n  publicUpdates: [{\n    message: String,\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Privacy and data retention\n  isAnonymous: {\n    type: Boolean,\n    default: true\n  },\n  \n  dataRetentionDate: {\n    type: Date,\n    default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years\n  },\n  \n  // Metadata\n  ipAddress: {\n    type: String,\n    required: false // Hashed for privacy\n  },\n  \n  userAgent: {\n    type: String,\n    required: false\n  },\n  \n  createdAt: {\n    type: Date,\n    default: Date.now,\n    index: true\n  },\n  \n  updatedAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Indexes for performance\nreportSchema.index({ createdAt: -1 });\nreportSchema.index({ status: 1, createdAt: -1 });\nreportSchema.index({ category: 1, createdAt: -1 });\nreportSchema.index({ priority: 1, status: 1 });\nreportSchema.index({ 'location.coordinates': '2dsphere' });\nreportSchema.index({ dataRetentionDate: 1 });\n\n// Pre-save middleware\nreportSchema.pre('save', function(next) {\n  this.updatedAt = Date.now();\n  next();\n});\n\n// Method to add admin note\nreportSchema.methods.addAdminNote = function(note, adminId) {\n  this.adminNotes.push({\n    note,\n    addedBy: adminId\n  });\n  return this.save();\n};\n\n// Method to add public update\nreportSchema.methods.addPublicUpdate = function(message) {\n  this.publicUpdates.push({\n    message\n  });\n  return this.save();\n};"}, {"file_name": "Campus-Shield/client/src/components/IncidentHeatMap.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx", "markdown_link": "- [Campus-Shield/client/src/components/IncidentHeatMap.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx)\n", "code_chunk": "import React, { useEffect, useState } from 'react';\nimport { MapContainer, TileLayer, useMap } from 'react-leaflet';\nimport 'leaflet/dist/leaflet.css';\nimport 'leaflet.heat';\n\ninterface Report {\n  _id: string;\n  location: {\n    coordinates: [number, number]; // [lng, lat]\n  };\n}\n\nconst HeatmapLayer: React.FC<{ points: [number, number][] }> = ({ points }) => {\n  const map = useMap();\n  useEffect(() => {\n    // @ts-ignore\n    if (window.L && points.length) {\n      // Remove existing heat layer if any\n      if ((map as any)._heatLayer) {\n        (map as any).removeLayer((map as any)._heatLayer);\n      }\n      // @ts-ignore\n      const heat = window.L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });\n      heat.addTo(map);\n      (map as any)._heatLayer = heat;\n    }\n  }, [map, points]);\n  return null;\n};\n\nconst IncidentHeatMap: React.FC = () => {\n  const [points, setPoints] = useState<[number, number][]>([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const fetchReports = async () => {\n      try {\n        const token = localStorage.getItem('token');\n        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {\n          headers: {\n            'Authorization': `Bearer ${token}`,\n            'Content-Type': 'application/json'\n          }\n        });\n        const data = await res.json();\n        if (data.success && Array.isArray(data.reports)) {\n          // Convert [lng, lat] to [lat, lng] for Leaflet\n          const pts = data.reports\n            .filter((r: Report) => r.location && Array.isArray(r.location.coordinates))\n            .map((r: Report) => [r.location.coordinates[1], r.location.coordinates[0]]);\n          setPoints(pts);\n        }\n      } catch (err) {\n        // Handle error\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchReports();\n  }, []);\n\n  return (\n    <div className=\"w-full h-[500px] rounded shadow overflow-hidden\">\n      {loading ? (\n        <div className=\"flex items-center justify-center h-full\">Loading heatmap...</div>\n      ) : (\n        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>\n          <TileLayer\n            attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\n            url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"\n          />\n          <HeatmapLayer points={points} />\n        </MapContainer>\n      )}\n    </div>\n  );\n};\n\nexport default IncidentHeatMap;"}, {"file_name": "Campus-Shield/client/src/pages/MyReports.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/MyReports.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx)\n", "code_chunk": "{/* Report Detail Modal */}\n      {selectedReport && (\n        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50\">\n          <div className=\"bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto\">\n            <div className=\"p-6\">\n              <div className=\"flex items-center justify-between mb-4\">\n                <h2 className=\"text-xl font-bold text-gray-900\">Report Details</h2>\n                <button\n                  onClick={() => setSelectedReport(null)}\n                  className=\"text-gray-400 hover:text-gray-600\"\n                >\n                  <XMarkIcon className=\"h-6 w-6\" />\n                </button>\n              </div>\n\n              <div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-semibold text-gray-900 mb-2\">{selectedReport.title}</h3>\n                  <div className=\"flex items-center space-x-3 mb-3\">\n                    <span className={`badge ${statusColors[selectedReport.status as keyof typeof statusColors]}`}>\n                      {selectedReport.status.replace('_', ' ').toUpperCase()}\n                    </span>\n                    <span className={`badge ${priorityColors[selectedReport.priority as keyof typeof priorityColors]}`}>\n                      {selectedReport.priority.toUpperCase()}\n                    </span>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Description</h4>\n                  <p className=\"text-gray-600\">{selectedReport.description}</p>\n                </div>\n\n                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Category</h4>\n                    <p className=\"text-gray-600 capitalize\">\n                      {categoryLabels[selectedReport.category as keyof typeof categoryLabels]}\n                    </p>\n                  </div>\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Incident Time</h4>\n                    <p className=\"text-gray-600\">{formatDate(selectedReport.incidentTime)}</p>\n                  </div>\n                </div>\n\n                                 <div>\n                   <h4 className=\"font-medium text-gray-900 mb-2\">Location</h4>\n                   <div className=\"text-gray-600\">\n                     {selectedReport.location?.address && <p>{selectedReport.location.address}</p>}\n                     {selectedReport.location?.building && <p>Building: {selectedReport.location.building}</p>}\n                     {selectedReport.location?.floor && <p>Floor: {selectedReport.location.floor}</p>}\n                     {!selectedReport.location?.address && !selectedReport.location?.building && !selectedReport.location?.floor && (\n                       <p className=\"text-gray-500\">Location not specified</p>\n                     )}\n                   </div>\n                 </div>\n\n                                 {selectedReport.attachments && selectedReport.attachments.length > 0 && (\n                   <div>\n                     <h4 className=\"font-medium text-gray-900 mb-2\">Attachments</h4>\n                     <div className=\"space-y-2\">\n                       {selectedReport.attachments.map((file, index) => (\n                         <div key={index} className=\"flex items-center space-x-2 text-sm text-gray-600\">\n                           <DocumentIcon className=\"h-4 w-4\" />\n                           <span>{file.originalName || file.filename || 'Unknown file'}</span>\n                         </div>\n                       ))}\n                     </div>\n                   </div>\n                 )}"}, {"file_name": "Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md", "markdown_link": "- [Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md](https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md)\n", "code_chunk": "# CampusShield Tech Stack and Workflow Documentation\n\n## Recommended Tech Stack\n\n| Layer                | Technology Options                                                                                                          | Notes                                                     |\n|----------------------|----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|\n| **Front-End**        | React.js, React Native (mobile), Flutter (mobile)                                                                          | For web/mobile apps; Flutter enables true cross-platform  |\n| **Back-End/API**     | Node.js (Express.js), Python (FastAPI or Django)                                                                           | Scalable REST APIs, real-time features                    |\n| **Database**         | MongoDB (NoSQL), PostgreSQL (SQL)                                                                                          | MongoDB for flexible data; PostgreSQL for relational data |\n| **Authentication**   | Firebase Auth, Auth0, or custom JWT-based auth                                                                             | Secure sign-in, supports anonymity and OAuth              |\n| **Notifications**    | Firebase Cloud Messaging (push), Twilio (SMS), SendGrid (email)                                                            | Real-time and multi-channel notifications                 |\n| **AI/ML Integration**| Python (scikit-learn, Hugging Face Transformers, spaCy) via an API microservice                                           | For categorization, sentiment analysis, NLP               |\n| **Chat/Real-Time**   | Socket.io (Node.js), WebSockets, or Firebase Realtime Database                                                             | For admin-user anonymous chat, group support              |\n| **Maps/Heatmaps**    | Google Maps API, Mapbox, Leaflet.js                                                                                        | For live incident heatmaps                                |\n| **File Storage**     | AWS S3, Google Cloud Storage, Firebase Storage                                                                             | For reports with photos, voice, or video                  |\n| **Admin Dashboard**  | React (web-based), Chart.js/D3.js for analytics and visualizations                                                         | Data visualization and report management                  |\n| **Hosting/Infra**    | AWS, Google Cloud Platform, Azure, Vercel, Heroku                                                                          | Scalable and easy deployment                              |\n| **Security**         | HTTPS/SSL, end-to-end encryption (Signal Protocol, custom), privacy libraries                                              | To ensure report privacy and anonymous chat               |\n| **Localization**     | i18next, Google Cloud Translation                                                                                          | For multilingual support                                  |\n\n## MVP Tech Stack (Phase 1)\n\nFor the initial MVP, we'll use a simplified but scalable stack:\n\n- **Frontend**: React.js with Tailwind CSS\n- **Backend**: Node.js with Express.js\n- **Database**: MongoDB (flexible schema for reports)\n- **Real-time**: Socket.io for chat and live updates\n- **Authentication**: JWT-based with anonymous options\n- **Maps**: Leaflet.js for heatmap visualization\n- **File Storage**: Local storage initially, cloud storage later\n- **AI/ML**: Basic text classification using natural language processing\n\n## Suggested Workflow\n\n### 1. User Onboarding & Authentication\n- Users sign up with minimal data, choose anonymity (no personal info required).\n- Optional: Offer OAuth (Google, college email) for added features with clear privacy messaging."}, {"file_name": "Campus-Shield/client/src/reportWebVitals.ts", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/reportWebVitals.ts", "markdown_link": "- [Campus-Shield/client/src/reportWebVitals.ts](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/reportWebVitals.ts)\n", "code_chunk": "import { ReportHandler } from 'web-vitals';\n\nconst reportWebVitals = (onPerfEntry?: ReportHandler) => {\n  if (onPerfEntry && onPerfEntry instanceof Function) {\n    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {\n      getCLS(onPerfEntry);\n      getFID(onPerfEntry);\n      getFCP(onPerfEntry);\n      getLCP(onPerfEntry);\n      getTTFB(onPerfEntry);\n    });\n  }\n};\n\nexport default reportWebVitals;"}, {"file_name": "Campus-Shield/client/src/pages/ReportIncident.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/ReportIncident.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx)\n", "code_chunk": "<div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                <div>\n                  <label htmlFor=\"address\" className=\"form-label\">\n                    Address\n                  </label>\n                  <input\n                    type=\"text\"\n                    id=\"address\"\n                    name=\"location.address\"\n                    value={formData.location.address}\n                    onChange={handleInputChange}\n                    className=\"input-field\"\n                    placeholder=\"Street address or general area\"\n                  />\n                </div>\n\n                <div>\n                  <label htmlFor=\"building\" className=\"form-label\">\n                    Building\n                  </label>\n                  <input\n                    type=\"text\"\n                    id=\"building\"\n                    name=\"location.building\"\n                    value={formData.location.building}\n                    onChange={handleInputChange}\n                    className=\"input-field\"\n                    placeholder=\"Building name or number\"\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label htmlFor=\"floor\" className=\"form-label\">\n                  Floor/Room\n                </label>\n                <input\n                  type=\"text\"\n                  id=\"floor\"\n                  name=\"location.floor\"\n                  value={formData.location.floor}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"Floor number or room number\"\n                />\n              </div>\n\n              <div className=\"flex items-center space-x-4\">\n                <button\n                  type=\"button\"\n                  onClick={handleLocationClick}\n                  className=\"btn-secondary\"\n                >\n                  <MapPinIcon className=\"h-4 w-4 mr-2\" />\n                  Use My Current Location\n                </button>\n                {formData.location.coordinates && (\n                  <span className=\"text-sm text-success-600\">\n                    \u2713 Location captured\n                  </span>\n                )}\n              </div>\n            </div>\n          )}\n\n          {/* Step 3: Attachments */}\n          {currentStep === 3 && (\n            <div className=\"space-y-6\">\n              <div className=\"bg-secondary-50 border border-secondary-200 rounded-lg p-4\">\n                <div className=\"flex items-center mb-2\">\n                  <CameraIcon className=\"h-5 w-5 text-secondary-600 mr-2\" />\n                  <h3 className=\"font-medium text-secondary-900\">Attachments (Optional)</h3>\n                </div>\n                <p className=\"text-sm text-secondary-700\">\n                  You can upload photos, videos, or documents related to the incident. Maximum 5 files, 10MB each.\n                </p>\n              </div>\n\n              <div>\n                <button\n                  type=\"button\"\n                  onClick={() => fileInputRef.current?.click()}\n                  className=\"btn-secondary w-full\"\n                >\n                  <DocumentIcon className=\"h-4 w-4 mr-2\" />\n                  Choose Files\n                </button>\n                <input\n                  ref={fileInputRef}\n                  type=\"file\"\n                  multiple\n                  accept=\"image/*,video/*,audio/*,.pdf\"\n                  onChange={handleFileUpload}\n                  className=\"hidden\"\n                />\n              </div>"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "{/* Features Section */}\n      <section className=\"bg-gray-50 py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              Why Choose CampusShield?\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Our privacy-first approach ensures you can report safety concerns without fear, \n              while powerful features help keep everyone informed and protected.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\n            {features.map((feature, index) => (\n              <div key={index} className=\"card hover:shadow-md transition-shadow duration-200\">\n                <div className=\"flex items-center mb-4\">\n                  <feature.icon className=\"h-8 w-8 text-primary-600 mr-3\" />\n                  <h3 className=\"text-lg font-semibold text-gray-900\">\n                    {feature.title}\n                  </h3>\n                </div>\n                <p className=\"text-gray-600\">\n                  {feature.description}\n                </p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      {/* How It Works Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              How It Works\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Simple, secure, and anonymous reporting in just a few steps.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">\n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">1</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Report Incident</h3>\n              <p className=\"text-gray-600\">\n                Submit a detailed report with location, description, and optional media attachments.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">2</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">AI Processing</h3>\n              <p className=\"text-gray-600\">\n                Our AI categorizes and prioritizes your report for appropriate response.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">3</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Stay Updated</h3>\n              <p className=\"text-gray-600\">\n                Receive updates on your report and chat with authorities if needed.\n              </p>\n            </div>\n          </div>\n        </div>\n      </section>"}]</code-reference>