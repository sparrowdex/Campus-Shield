# Incident Reporting System

# Incident Reporting System

## <artifact ArtifactUUID="25584a9b-a9db-4076-b175-597e0fd14076">User-Facing Incident Submission Interface</artifact>

<document-code-reference section="<artifact ArtifactUUID="25584a9b-a9db-4076-b175-597e0fd14076">User-Facing Incident Submission Interface</artifact>">
{"files": [
  {
    "name": "Campus-Shield/client/src/pages/ReportIncident.tsx",
    "description": "Implementation file",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx",
    "directory": "https:/github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages"
  },
  {
    "name": "Campus-Shield/server/models/User.js",
    "description": "JavaScript/TypeScript implementation file containing data models and entity definitions",
    "file_url": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/User.js",
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
  }
]}
</document-code-reference>

The ReportIncident component, implemented in `client/src/pages/ReportIncident.tsx`, provides a multi-step form for users to submit incident reports. Key features include:

- Three-step wizard interface for guided report submission
- Dynamic form validation and error handling
- File attachment support with size and type restrictions
- Geolocation capture for precise incident location reporting
- Integration with backend API for report submission

The component utilizes React hooks for state management and form handling:

```typescript
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
```

## <artifact ArtifactUUID="e6e34e61-dc2e-48a6-906f-bb737d8a2aa0">Report Management and Visualization</artifact>

<document-code-reference section="<artifact ArtifactUUID="e6e34e61-dc2e-48a6-906f-bb737d8a2aa0">Report Management and Visualization</artifact>">
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

The MyReports component (`client/src/pages/MyReports.tsx`) allows users to view and manage their submitted reports. It implements:

- Filterable and searchable report list
- Detailed report view modal
- Status updates and priority indicators
- Integration with IncidentHeatMap for spatial visualization

The IncidentHeatMap component (`client/src/components/IncidentHeatMap.tsx`) uses Leaflet.js to render a heatmap of incident locations:

```typescript
const HeatmapLayer: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (window.L && points.length) {
      const heat = window.L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });
      heat.addTo(map);
      (map as any)._heatLayer = heat;
    }
  }, [map, points]);
  return null;
};
```

## <artifact ArtifactUUID="8bad32d6-52a1-42a4-bda7-32cf62a7b04c">Backend Report Processing and Storage</artifact>

<document-code-reference section="<artifact ArtifactUUID="8bad32d6-52a1-42a4-bda7-32cf62a7b04c">Backend Report Processing and Storage</artifact>">
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

The server-side report handling is implemented in `server/routes/reports.js` and `server/models/Report.js`. Key features include:

- RESTful API endpoints for report CRUD operations
- MongoDB schema definition with comprehensive metadata
- File upload handling with Multer middleware
- Geospatial indexing for efficient location-based queries

The Report model schema includes fields for various aspects of an incident:

```javascript
const reportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true, index: true },
  title: { type: String, required: true, maxlength: 200, trim: true },
  description: { type: String, required: true, maxlength: 2000, trim: true },
  category: { type: String, required: true, enum: [...] },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true, index: '2dsphere' },
    address: { type: String, maxlength: 200 },
    building: { type: String, maxlength: 100 },
    floor: { type: String, maxlength: 20 }
  },
  // ... additional fields
});
```

## Notification System

<document-code-reference section="Notification System">
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
  }
]}
</document-code-reference>

The notification system is implemented across multiple components:

- NotificationContext (`client/src/contexts/NotificationContext.tsx`) for state management
- NotificationBar (`client/src/components/common/NotificationBar.tsx`) for UI rendering
- Server-side model (`server/models/Notification.js`) and routes (`server/routes/notifications.js`) for persistence and API endpoints

This system ensures users receive real-time updates on report status changes and administrative actions.

## <artifact>AI-Assisted Report Classification</artifact>

<document-code-reference section="<artifact>AI-Assisted Report Classification</artifact>">
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

The system incorporates AI services for automated report categorization and sentiment analysis:

```javascript
const { categorizeReport, analyzeSentiment } = require('../services/aiService');

// Inside report submission route
const aiCategory = await categorizeReport(description);
const sentiment = await analyzeSentiment(description);

const reportData = {
  // ... other fields
  aiCategory,
  sentiment,
};
```

This AI integration enhances the system's ability to prioritize and route reports efficiently.

## Security and Privacy Measures

<document-code-reference section="Security and Privacy Measures">
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

The Incident Reporting System implements several security features:

- JWT-based authentication for API access
- Anonymous reporting options
- Data retention policies and automatic purging of old reports
- Encrypted file storage for attachments

These measures ensure user privacy and data protection in compliance with relevant regulations.

## Scalability and Performance Considerations

<document-code-reference section="Scalability and Performance Considerations">
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

The system architecture is designed for scalability:

- Use of MongoDB for flexible document storage and geospatial queries
- Indexed fields for optimized database performance
- Stateless API design allowing for horizontal scaling
- Client-side caching and pagination for efficient data loading

Future enhancements could include implementing a message queue for asynchronous processing of reports and notifications to further improve system responsiveness under high load.
## References:
### Code:
<code-reference uuid='b7620d9b-75a5-4ba7-b608-e47faa8f5b60'>[{"file_name": "Campus-Shield/server/routes/reports.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js", "markdown_link": "- [Campus-Shield/server/routes/reports.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/routes/reports.js)\n", "code_chunk": "const express = require('express');\nconst multer = require('multer');\nconst path = require('path');\nconst { body, validationResult, query } = require('express-validator');\nconst Report = require('../models/Report');\nconst auth = require('../middleware/auth');\nconst { categorizeReport, analyzeSentiment } = require('../services/aiService');\nconst memoryStore = require('../services/memoryStore');\n\nconst router = express.Router();\n\n// Check if MongoDB is connected\nconst isMongoConnected = () => {\n  return Report.db && Report.db.readyState === 1;\n};\n\n// Configure multer for file uploads\nconst storage = multer.diskStorage({\n  destination: (req, file, cb) => {\n    cb(null, 'uploads/');\n  },\n  filename: (req, file, cb) => {\n    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);\n    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));\n  }\n});\n\nconst upload = multer({\n  storage: storage,\n  limits: {\n    fileSize: 10 * 1024 * 1024, // 10MB limit\n  },\n  fileFilter: (req, file, cb) => {\n    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wav|mp3|pdf/;\n    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());\n    const mimetype = allowedTypes.test(file.mimetype);\n    \n    if (mimetype && extname) {\n      return cb(null, true);\n    } else {\n      cb(new Error('Only image, video, audio, and PDF files are allowed'));\n    }\n  }\n});\n\n// @route   POST /api/reports\n// @desc    Submit a new incident report\n// @access  Private\nrouter.post('/', auth, upload.array('attachments', 5), [\n  body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),\n  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),\n  body('category').isIn([\n    'harassment', 'assault', 'theft', 'vandalism', 'suspicious_activity',\n    'emergency', 'safety_hazard', 'discrimination', 'bullying', 'other'\n  ]).withMessage('Invalid category'),\n  // Add a custom sanitizer for coordinates\n  body('location.coordinates').customSanitizer(value => {\n    if (typeof value === 'string') {\n      try {\n        return JSON.parse(value);\n      } catch {\n        return value;\n      }\n    }\n    return value;\n  }),\n  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),\n  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),\n  body('incidentTime').optional().isISO8601().withMessage('Invalid date format')\n], async (req, res) => {\n  try {\n    const errors = validationResult(req);\n    if (!errors.isEmpty()) {\n      return res.status(400).json({ success: false, errors: errors.array() });\n    }\n\n    const {\n      title,\n      description,\n      category,\n      location,\n      incidentTime\n    } = req.body;\n\n    // Get user info\n    const user = req.user;\n\n    // Process attachments\n    const attachments = req.files ? req.files.map(file => ({\n      filename: file.filename,\n      originalName: file.originalname,\n      mimetype: file.mimetype,\n      size: file.size,\n      path: file.path\n    })) : [];\n\n    // Parse coordinates if sent as a string\n    let coordinates = location.coordinates;\n    if (typeof coordinates === 'string') {\n      try {\n        coordinates = JSON.parse(coordinates);\n      } catch (e) {\n        coordinates = undefined;\n      }\n    }\n\n    // Create report data\n    const reportData = {\n      reporterId: user.userId,\n      title,\n      description,\n      category,\n      location: {\n        type: 'Point',\n        coordinates: coordinates || location.coordinates,\n        address: location.address || '',\n        building: location.building || '',\n        floor: location.floor || ''\n      },\n      incidentTime: incidentTime || new Date(),\n      attachments,\n      isAnonymous: user.isAnonymous || true,\n      ipAddress: req.ip,\n      userAgent: req.get('User-Agent')\n    };"}, {"file_name": "Campus-Shield/client/src/pages/AdminDashboard.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/AdminDashboard.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/AdminDashboard.tsx)\n", "code_chunk": "{/* Heatmap Section */}\n        <div className=\"mt-8 bg-white p-6 rounded-lg border border-gray-200\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Incident Heatmap</h3>\n          <IncidentHeatMap />\n        </div>\n      </div>\n\n      {/* Report Detail Modal */}\n      {selectedReport && (\n        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50\">\n          <div className=\"bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-60\">\n            <div className=\"p-6\">\n              <div className=\"flex items-center justify-between mb-4\">\n                <h2 className=\"text-xl font-bold text-gray-900\">Report Details</h2>\n                <button\n                  onClick={() => setSelectedReport(null)}\n                  className=\"text-gray-400 hover:text-gray-600\"\n                >\n                  <XMarkIcon className=\"h-6 w-6\" />\n                </button>\n              </div>\n\n              <div className=\"space-y-4\">\n                <div>\n                  <h3 className=\"font-semibold text-gray-900 mb-2\">{selectedReport.title}</h3>\n                  <div className=\"flex items-center space-x-3 mb-3\">\n                    <span className={`badge ${statusColors[selectedReport.status as keyof typeof statusColors]}`}>\n                      {selectedReport.status.replace('_', ' ').toUpperCase()}\n                    </span>\n                    <span className={`badge ${priorityColors[selectedReport.priority as keyof typeof priorityColors]}`}>\n                      {selectedReport.priority.toUpperCase()}\n                    </span>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Description</h4>\n                  <p className=\"text-gray-600\">{selectedReport.description}</p>\n                </div>\n\n                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Category</h4>\n                    <p className=\"text-gray-600 capitalize\">\n                      {categoryLabels[selectedReport.category as keyof typeof categoryLabels] || selectedReport.category}\n                    </p>\n                  </div>\n                  <div>\n                    <h4 className=\"font-medium text-gray-900 mb-2\">Incident Time</h4>\n                    <p className=\"text-gray-600\">{formatDate(selectedReport.incidentTime)}</p>\n                  </div>\n                </div>\n\n                <div>\n                  <h4 className=\"font-medium text-gray-900 mb-2\">Location</h4>\n                  <div className=\"text-gray-600\">\n                    {selectedReport.location?.address && <p>{selectedReport.location.address}</p>}\n                    {selectedReport.location?.building && <p>Building: {selectedReport.location.building}</p>}\n                    {selectedReport.location?.floor && <p>Floor: {selectedReport.location.floor}</p>}\n                    {!selectedReport.location?.address && !selectedReport.location?.building && !selectedReport.location?.floor && (\n                      <p className=\"text-gray-500\">Location not specified</p>\n                    )}\n                  </div>\n                </div>"}, {"file_name": "Campus-Shield/server/models/Report.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js", "markdown_link": "- [Campus-Shield/server/models/Report.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/models/Report.js)\n", "code_chunk": "const mongoose = require('mongoose');\n\nconst reportSchema = new mongoose.Schema({\n  // Anonymous reporter identification\n  reporterId: {\n    type: String,\n    required: true,\n    index: true\n  },\n  \n  // Report content\n  title: {\n    type: String,\n    required: true,\n    maxlength: 200,\n    trim: true\n  },\n  \n  description: {\n    type: String,\n    required: true,\n    maxlength: 2000,\n    trim: true\n  },\n  \n  // Incident categorization\n  category: {\n    type: String,\n    required: true,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  // AI-generated fields\n  aiCategory: {\n    type: String,\n    enum: [\n      'harassment',\n      'assault',\n      'theft',\n      'vandalism',\n      'suspicious_activity',\n      'emergency',\n      'safety_hazard',\n      'discrimination',\n      'bullying',\n      'other'\n    ]\n  },\n  \n  priority: {\n    type: String,\n    enum: ['low', 'medium', 'high', 'critical'],\n    default: 'medium'\n  },\n  \n  sentiment: {\n    type: String,\n    enum: ['positive', 'neutral', 'negative', 'distressed'],\n    default: 'neutral'\n  },\n  \n  // Location data (generalized for privacy)\n  location: {\n    type: {\n      type: String,\n      enum: ['Point'],\n      default: 'Point'\n    },\n    coordinates: {\n      type: [Number], // [longitude, latitude]\n      required: true,\n      index: '2dsphere'\n    },\n    address: {\n      type: String,\n      maxlength: 200\n    },\n    building: {\n      type: String,\n      maxlength: 100\n    },\n    floor: {\n      type: String,\n      maxlength: 20\n    }\n  },\n  \n  // Timestamp\n  incidentTime: {\n    type: Date,\n    required: true,\n    default: Date.now\n  },\n  \n  // Media attachments\n  attachments: [{\n    filename: String,\n    originalName: String,\n    mimetype: String,\n    size: Number,\n    path: String,\n    uploadedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Report status and handling\n  status: {\n    type: String,\n    enum: ['pending', 'under_review', 'investigating', 'resolved', 'closed'],\n    default: 'pending'\n  },\n  \n  assignedTo: {\n    type: mongoose.Schema.Types.ObjectId,\n    ref: 'User'\n  },\n  \n  // Admin notes (private)\n  adminNotes: [{\n    note: String,\n    addedBy: {\n      type: mongoose.Schema.Types.ObjectId,\n      ref: 'User'\n    },\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Public updates for reporter\n  publicUpdates: [{\n    message: String,\n    addedAt: {\n      type: Date,\n      default: Date.now\n    }\n  }],\n  \n  // Privacy and data retention\n  isAnonymous: {\n    type: Boolean,\n    default: true\n  },\n  \n  dataRetentionDate: {\n    type: Date,\n    default: () => new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years\n  },\n  \n  // Metadata\n  ipAddress: {\n    type: String,\n    required: false // Hashed for privacy\n  },\n  \n  userAgent: {\n    type: String,\n    required: false\n  },\n  \n  createdAt: {\n    type: Date,\n    default: Date.now,\n    index: true\n  },\n  \n  updatedAt: {\n    type: Date,\n    default: Date.now\n  }\n});\n\n// Indexes for performance\nreportSchema.index({ createdAt: -1 });\nreportSchema.index({ status: 1, createdAt: -1 });\nreportSchema.index({ category: 1, createdAt: -1 });\nreportSchema.index({ priority: 1, status: 1 });\nreportSchema.index({ 'location.coordinates': '2dsphere' });\nreportSchema.index({ dataRetentionDate: 1 });\n\n// Pre-save middleware\nreportSchema.pre('save', function(next) {\n  this.updatedAt = Date.now();\n  next();\n});\n\n// Method to add admin note\nreportSchema.methods.addAdminNote = function(note, adminId) {\n  this.adminNotes.push({\n    note,\n    addedBy: adminId\n  });\n  return this.save();\n};\n\n// Method to add public update\nreportSchema.methods.addPublicUpdate = function(message) {\n  this.publicUpdates.push({\n    message\n  });\n  return this.save();\n};"}, {"file_name": "Campus-Shield/client/src/components/IncidentHeatMap.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx", "markdown_link": "- [Campus-Shield/client/src/components/IncidentHeatMap.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/components/IncidentHeatMap.tsx)\n", "code_chunk": "import React, { useEffect, useState } from 'react';\nimport { MapContainer, TileLayer, useMap } from 'react-leaflet';\nimport 'leaflet/dist/leaflet.css';\nimport 'leaflet.heat';\n\ninterface Report {\n  _id: string;\n  location: {\n    coordinates: [number, number]; // [lng, lat]\n  };\n}\n\nconst HeatmapLayer: React.FC<{ points: [number, number][] }> = ({ points }) => {\n  const map = useMap();\n  useEffect(() => {\n    // @ts-ignore\n    if (window.L && points.length) {\n      // Remove existing heat layer if any\n      if ((map as any)._heatLayer) {\n        (map as any).removeLayer((map as any)._heatLayer);\n      }\n      // @ts-ignore\n      const heat = window.L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });\n      heat.addTo(map);\n      (map as any)._heatLayer = heat;\n    }\n  }, [map, points]);\n  return null;\n};\n\nconst IncidentHeatMap: React.FC = () => {\n  const [points, setPoints] = useState<[number, number][]>([]);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    const fetchReports = async () => {\n      try {\n        const token = localStorage.getItem('token');\n        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {\n          headers: {\n            'Authorization': `Bearer ${token}`,\n            'Content-Type': 'application/json'\n          }\n        });\n        const data = await res.json();\n        if (data.success && Array.isArray(data.reports)) {\n          // Convert [lng, lat] to [lat, lng] for Leaflet\n          const pts = data.reports\n            .filter((r: Report) => r.location && Array.isArray(r.location.coordinates))\n            .map((r: Report) => [r.location.coordinates[1], r.location.coordinates[0]]);\n          setPoints(pts);\n        }\n      } catch (err) {\n        // Handle error\n      } finally {\n        setLoading(false);\n      }\n    };\n    fetchReports();\n  }, []);\n\n  return (\n    <div className=\"w-full h-[500px] rounded shadow overflow-hidden\">\n      {loading ? (\n        <div className=\"flex items-center justify-center h-full\">Loading heatmap...</div>\n      ) : (\n        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>\n          <TileLayer\n            attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\n            url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"\n          />\n          <HeatmapLayer points={points} />\n        </MapContainer>\n      )}\n    </div>\n  );\n};\n\nexport default IncidentHeatMap;"}, {"file_name": "Campus-Shield/server/services/memoryStore.js", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js", "markdown_link": "- [Campus-Shield/server/services/memoryStore.js](https://github.com/sparrowdex/Campus-Shield/blob/main/server/services/memoryStore.js)\n", "code_chunk": "// Admin request operations\n  createAdminRequest(userId, requestData) {\n    const request = {\n      id: this.nextRequestId.toString(),\n      userId,\n      ...requestData,\n      status: 'pending', // pending, approved, rejected\n      createdAt: new Date().toISOString(),\n      reviewedBy: null,\n      reviewedAt: null,\n      reviewNotes: null\n    };\n    this.adminRequests.set(request.id, request);\n    this.nextRequestId++;\n    return request;\n  }\n\n  getAdminRequests(status = null) {\n    const requests = Array.from(this.adminRequests.values());\n    if (status) {\n      return requests.filter(req => req.status === status);\n    }\n    return requests;\n  }\n\n  updateAdminRequest(requestId, updates) {\n    const request = this.adminRequests.get(requestId);\n    if (request) {\n      Object.assign(request, updates, { \n        reviewedAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString()\n      });\n      this.adminRequests.set(requestId, request);\n      return request;\n    }\n    return null;\n  }\n\n  approveAdminRequest(requestId, approvedBy, notes = '') {\n    const request = this.updateAdminRequest(requestId, {\n      status: 'approved',\n      reviewedBy: approvedBy,\n      reviewNotes: notes\n    });\n\n    if (request) {\n      // Promote user to admin\n      this.updateUser(request.userId, { role: 'admin' });\n    }\n\n    return request;\n  }\n\n  rejectAdminRequest(requestId, rejectedBy, notes = '') {\n    return this.updateAdminRequest(requestId, {\n      status: 'rejected',\n      reviewedBy: rejectedBy,\n      reviewNotes: notes\n    });\n  }\n\n  // Report operations\n  createReport(reportData) {\n    const report = {\n      id: this.nextReportId.toString(),\n      ...reportData,\n      status: 'pending',\n      priority: 'medium',\n      createdAt: new Date().toISOString(),\n      updatedAt: new Date().toISOString(),\n      attachments: [],\n      publicUpdates: []\n    };\n    this.reports.set(report.id, report);\n    this.nextReportId++;\n    return report;\n  }\n\n  findReportsByUserId(userId) {\n    const userReports = [];\n    for (const report of this.reports.values()) {\n      if (report.userId === userId) {\n        userReports.push(report);\n      }\n    }\n    return userReports;\n  }\n\n  findReportById(id) {\n    return this.reports.get(id) || null;\n  }\n\n  updateReport(id, updates) {\n    const report = this.reports.get(id);\n    if (report) {\n      Object.assign(report, updates, { updatedAt: new Date().toISOString() });\n      this.reports.set(id, report);\n      return report;\n    }\n    return null;\n  }\n\n  // Chat operations\n  createChatRoom(roomData) {\n    const room = {\n      roomId: this.nextRoomId.toString(),\n      ...roomData,\n      createdAt: new Date().toISOString(),\n      lastMessage: null\n    };\n    this.chatRooms.set(room.roomId, room);\n    this.nextRoomId++;\n    return room;\n  }\n\n  findChatRoomByReportId(reportId) {\n    for (const room of this.chatRooms.values()) {\n      if (room.reportId === reportId) {\n        return room;\n      }\n    }\n    return null;\n  }\n\n  findChatRoomsByUserId(userId) {\n    const userRooms = [];\n    for (const room of this.chatRooms.values()) {\n      if (room.userId === userId) {\n        userRooms.push(room);\n      }\n    }\n    return userRooms;\n  }\n\n  createMessage(messageData) {\n    const message = {\n      id: this.nextMessageId.toString(),\n      ...messageData,\n      timestamp: new Date().toISOString()\n    };\n    this.messages.set(message.id, message);\n    this.nextMessageId++;\n    return message;\n  }\n\n  findMessagesByRoomId(roomId) {\n    const roomMessages = [];\n    for (const message of this.messages.values()) {\n      if (message.roomId === roomId) {\n        roomMessages.push(message);\n      }\n    }\n    return roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));\n  }\n\n  // Admin operations\n  getAllReports() {\n    return Array.from(this.reports.values());\n  }\n\n  getAllUsers() {\n    return Array.from(this.users.values());\n  }"}, {"file_name": "Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md", "markdown_link": "- [Campus-Shield/docs/TECH_STACK_AND_WORKFLOW.md](https://github.com/sparrowdex/Campus-Shield/blob/main/docs/TECH_STACK_AND_WORKFLOW.md)\n", "code_chunk": "# CampusShield Tech Stack and Workflow Documentation\n\n## Recommended Tech Stack\n\n| Layer                | Technology Options                                                                                                          | Notes                                                     |\n|----------------------|----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|\n| **Front-End**        | React.js, React Native (mobile), Flutter (mobile)                                                                          | For web/mobile apps; Flutter enables true cross-platform  |\n| **Back-End/API**     | Node.js (Express.js), Python (FastAPI or Django)                                                                           | Scalable REST APIs, real-time features                    |\n| **Database**         | MongoDB (NoSQL), PostgreSQL (SQL)                                                                                          | MongoDB for flexible data; PostgreSQL for relational data |\n| **Authentication**   | Firebase Auth, Auth0, or custom JWT-based auth                                                                             | Secure sign-in, supports anonymity and OAuth              |\n| **Notifications**    | Firebase Cloud Messaging (push), Twilio (SMS), SendGrid (email)                                                            | Real-time and multi-channel notifications                 |\n| **AI/ML Integration**| Python (scikit-learn, Hugging Face Transformers, spaCy) via an API microservice                                           | For categorization, sentiment analysis, NLP               |\n| **Chat/Real-Time**   | Socket.io (Node.js), WebSockets, or Firebase Realtime Database                                                             | For admin-user anonymous chat, group support              |\n| **Maps/Heatmaps**    | Google Maps API, Mapbox, Leaflet.js                                                                                        | For live incident heatmaps                                |\n| **File Storage**     | AWS S3, Google Cloud Storage, Firebase Storage                                                                             | For reports with photos, voice, or video                  |\n| **Admin Dashboard**  | React (web-based), Chart.js/D3.js for analytics and visualizations                                                         | Data visualization and report management                  |\n| **Hosting/Infra**    | AWS, Google Cloud Platform, Azure, Vercel, Heroku                                                                          | Scalable and easy deployment                              |\n| **Security**         | HTTPS/SSL, end-to-end encryption (Signal Protocol, custom), privacy libraries                                              | To ensure report privacy and anonymous chat               |\n| **Localization**     | i18next, Google Cloud Translation                                                                                          | For multilingual support                                  |\n\n## MVP Tech Stack (Phase 1)\n\nFor the initial MVP, we'll use a simplified but scalable stack:\n\n- **Frontend**: React.js with Tailwind CSS\n- **Backend**: Node.js with Express.js\n- **Database**: MongoDB (flexible schema for reports)\n- **Real-time**: Socket.io for chat and live updates\n- **Authentication**: JWT-based with anonymous options\n- **Maps**: Leaflet.js for heatmap visualization\n- **File Storage**: Local storage initially, cloud storage later\n- **AI/ML**: Basic text classification using natural language processing\n\n## Suggested Workflow\n\n### 1. User Onboarding & Authentication\n- Users sign up with minimal data, choose anonymity (no personal info required).\n- Optional: Offer OAuth (Google, college email) for added features with clear privacy messaging."}, {"file_name": "Campus-Shield/client/src/pages/MyReports.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/MyReports.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/MyReports.tsx)\n", "code_chunk": "{/* Reports List */}\n        {filteredReports.length === 0 ? (\n          <div className=\"text-center py-12\">\n            <ClockIcon className=\"h-12 w-12 text-gray-400 mx-auto mb-4\" />\n            <h3 className=\"text-lg font-medium text-gray-900 mb-2\">\n              {reports.length === 0 ? 'No reports yet' : 'No reports match your search'}\n            </h3>\n            <p className=\"text-gray-600\">\n              {reports.length === 0 \n                ? 'Submit your first incident report to get started.'\n                : 'Try adjusting your search or filter criteria.'\n              }\n            </p>\n          </div>\n        ) : (\n          <div className=\"space-y-4\">\n            {filteredReports.map((report) => (\n              <div\n                key={report.id}\n                className=\"border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer w-full\"\n                onClick={() => setSelectedReport(report)}\n              >\n                <div className=\"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2\">\n                  <div className=\"flex-1 w-full\">\n                    <div className=\"flex flex-wrap items-center gap-2 mb-2\">\n                      <h3 className=\"text-lg font-semibold text-gray-900 break-words\">{report.title}</h3>\n                      <span className={`badge ${statusColors[report.status as keyof typeof statusColors]}`}>{report.status.replace('_', ' ').toUpperCase()}</span>\n                      <span className={`badge ${priorityColors[report.priority as keyof typeof priorityColors]}`}>{report.priority.toUpperCase()}</span>\n                    </div>\n                    <p className=\"text-gray-600 mb-3 line-clamp-2 break-words\">\n                      {report.description}\n                    </p>\n                    <div className=\"flex flex-col sm:flex-row flex-wrap gap-2 text-sm text-gray-500\">\n                      <div className=\"flex items-center space-x-1\">\n                        <CalendarIcon className=\"h-4 w-4\" />\n                        <span>{report.incidentTime ? formatDate(report.incidentTime) : 'No date'}</span>\n                      </div>\n                      <div className=\"flex items-center space-x-1\">\n                        <MapPinIcon className=\"h-4 w-4\" />\n                        <span>{report.location?.address || 'Location not specified'}</span>\n                      </div>\n                      <div className=\"flex items-center space-x-1\">\n                        <span className=\"capitalize\">\n                          {report.category ? categoryLabels[report.category as keyof typeof categoryLabels] || report.category : 'Unknown'}\n                        </span>\n                      </div>\n                    </div>\n                  </div>\n                  <div className=\"flex flex-row flex-wrap items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4\">\n                    {report.attachments && report.attachments.length > 0 && (\n                      <span className=\"text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded\">\n                        {report.attachments.length} file{report.attachments.length !== 1 ? 's' : ''}\n                      </span>\n                    )}\n                    {report.publicUpdates && report.publicUpdates.length > 0 && (\n                      <span className=\"text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded\">\n                        {report.publicUpdates.length} update{report.publicUpdates.length !== 1 ? 's' : ''}\n                      </span>\n                    )}\n                    <EyeIcon className=\"h-5 w-5 text-gray-400\" />\n                  </div>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </div>"}, {"file_name": "Campus-Shield/client/src/pages/RequestAdmin.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/RequestAdmin.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/RequestAdmin.tsx)\n", "code_chunk": "{/* Urgency & Timeline */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Urgency & Timeline</h3>\n            <div>\n              <label htmlFor=\"urgency\" className=\"form-label\">\n                Urgency Level *\n              </label>\n              <select\n                id=\"urgency\"\n                name=\"urgency\"\n                required\n                value={formData.urgency}\n                onChange={handleInputChange}\n                className=\"input-field\"\n              >\n                <option value=\"\">Select urgency level</option>\n                <option value=\"low\">Low - General administrative needs</option>\n                <option value=\"medium\">Medium - Regular operational requirements</option>\n                <option value=\"high\">High - Immediate safety/security needs</option>\n                <option value=\"critical\">Critical - Emergency response requirements</option>\n              </select>\n            </div>\n          </div>\n\n          {/* Contact Information */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Additional Contact Information</h3>\n            <div>\n              <label htmlFor=\"contactInfo\" className=\"form-label\">\n                Additional Contact Details\n              </label>\n              <textarea\n                id=\"contactInfo\"\n                name=\"contactInfo\"\n                rows={2}\n                value={formData.contactInfo}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Phone number, office location, or any additional contact information...\"\n              />\n            </div>\n          </div>\n\n          {/* Primary Reason */}\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Primary Reason for Admin Access</h3>\n            <div>\n              <label htmlFor=\"reason\" className=\"form-label\">\n                Detailed Explanation *\n              </label>\n              <textarea\n                id=\"reason\"\n                name=\"reason\"\n                rows={4}\n                required\n                minLength={10}\n                maxLength={500}\n                value={formData.reason}\n                onChange={handleInputChange}\n                className=\"input-field\"\n                placeholder=\"Please provide a comprehensive explanation of why you need admin access, how you plan to use it, and the benefits to campus safety...\"\n              />\n              <p className=\"mt-1 text-xs text-gray-500\">\n                {formData.reason.length}/500 characters (minimum 10 characters)\n              </p>\n            </div>\n          </div>\n\n          <div className=\"bg-gray-50 p-4 rounded-lg\">\n            <h4 className=\"font-medium text-gray-900 mb-2\">What Admin Access Includes:</h4>\n            <ul className=\"text-sm text-gray-600 space-y-1\">\n              <li>\u2022 View and manage all incident reports</li>\n              <li>\u2022 Update report statuses and priorities</li>\n              <li>\u2022 Access to analytics and statistics</li>\n              <li>\u2022 Ability to respond to reports</li>\n              <li>\u2022 Review and approve admin requests</li>\n            </ul>\n          </div>"}, {"file_name": "Campus-Shield/client/src/pages/ReportIncident.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/ReportIncident.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/ReportIncident.tsx)\n", "code_chunk": "<div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n                <div>\n                  <label htmlFor=\"address\" className=\"form-label\">\n                    Address\n                  </label>\n                  <input\n                    type=\"text\"\n                    id=\"address\"\n                    name=\"location.address\"\n                    value={formData.location.address}\n                    onChange={handleInputChange}\n                    className=\"input-field\"\n                    placeholder=\"Street address or general area\"\n                  />\n                </div>\n\n                <div>\n                  <label htmlFor=\"building\" className=\"form-label\">\n                    Building\n                  </label>\n                  <input\n                    type=\"text\"\n                    id=\"building\"\n                    name=\"location.building\"\n                    value={formData.location.building}\n                    onChange={handleInputChange}\n                    className=\"input-field\"\n                    placeholder=\"Building name or number\"\n                  />\n                </div>\n              </div>\n\n              <div>\n                <label htmlFor=\"floor\" className=\"form-label\">\n                  Floor/Room\n                </label>\n                <input\n                  type=\"text\"\n                  id=\"floor\"\n                  name=\"location.floor\"\n                  value={formData.location.floor}\n                  onChange={handleInputChange}\n                  className=\"input-field\"\n                  placeholder=\"Floor number or room number\"\n                />\n              </div>\n\n              <div className=\"flex items-center space-x-4\">\n                <button\n                  type=\"button\"\n                  onClick={handleLocationClick}\n                  className=\"btn-secondary\"\n                >\n                  <MapPinIcon className=\"h-4 w-4 mr-2\" />\n                  Use My Current Location\n                </button>\n                {formData.location.coordinates && (\n                  <span className=\"text-sm text-success-600\">\n                    \u2713 Location captured\n                  </span>\n                )}\n              </div>\n            </div>\n          )}\n\n          {/* Step 3: Attachments */}\n          {currentStep === 3 && (\n            <div className=\"space-y-6\">\n              <div className=\"bg-secondary-50 border border-secondary-200 rounded-lg p-4\">\n                <div className=\"flex items-center mb-2\">\n                  <CameraIcon className=\"h-5 w-5 text-secondary-600 mr-2\" />\n                  <h3 className=\"font-medium text-secondary-900\">Attachments (Optional)</h3>\n                </div>\n                <p className=\"text-sm text-secondary-700\">\n                  You can upload photos, videos, or documents related to the incident. Maximum 5 files, 10MB each.\n                </p>\n              </div>\n\n              <div>\n                <button\n                  type=\"button\"\n                  onClick={() => fileInputRef.current?.click()}\n                  className=\"btn-secondary w-full\"\n                >\n                  <DocumentIcon className=\"h-4 w-4 mr-2\" />\n                  Choose Files\n                </button>\n                <input\n                  ref={fileInputRef}\n                  type=\"file\"\n                  multiple\n                  accept=\"image/*,video/*,audio/*,.pdf\"\n                  onChange={handleFileUpload}\n                  className=\"hidden\"\n                />\n              </div>"}, {"file_name": "Campus-Shield/client/src/pages/Home.tsx", "file_path": "https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx", "markdown_link": "- [Campus-Shield/client/src/pages/Home.tsx](https://github.com/sparrowdex/Campus-Shield/blob/main/client/src/pages/Home.tsx)\n", "code_chunk": "{/* Features Section */}\n      <section className=\"bg-gray-50 py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              Why Choose CampusShield?\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Our privacy-first approach ensures you can report safety concerns without fear, \n              while powerful features help keep everyone informed and protected.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8\">\n            {features.map((feature, index) => (\n              <div key={index} className=\"card hover:shadow-md transition-shadow duration-200\">\n                <div className=\"flex items-center mb-4\">\n                  <feature.icon className=\"h-8 w-8 text-primary-600 mr-3\" />\n                  <h3 className=\"text-lg font-semibold text-gray-900\">\n                    {feature.title}\n                  </h3>\n                </div>\n                <p className=\"text-gray-600\">\n                  {feature.description}\n                </p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      {/* How It Works Section */}\n      <section className=\"bg-white py-16\">\n        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n          <div className=\"text-center mb-12\">\n            <h2 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-4\">\n              How It Works\n            </h2>\n            <p className=\"text-lg text-gray-600 max-w-2xl mx-auto\">\n              Simple, secure, and anonymous reporting in just a few steps.\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">\n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">1</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Report Incident</h3>\n              <p className=\"text-gray-600\">\n                Submit a detailed report with location, description, and optional media attachments.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">2</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">AI Processing</h3>\n              <p className=\"text-gray-600\">\n                Our AI categorizes and prioritizes your report for appropriate response.\n              </p>\n            </div>\n            \n            <div className=\"text-center\">\n              <div className=\"bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4\">\n                <span className=\"text-2xl font-bold text-primary-600\">3</span>\n              </div>\n              <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Stay Updated</h3>\n              <p className=\"text-gray-600\">\n                Receive updates on your report and chat with authorities if needed.\n              </p>\n            </div>\n          </div>\n        </div>\n      </section>"}]</code-reference>