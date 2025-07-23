const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult, query } = require('express-validator');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const { categorizeReport, analyzeSentiment } = require('../services/aiService');
const memoryStore = require('../services/memoryStore');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return Report.db && Report.db.readyState === 1;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wav|mp3|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, video, audio, and PDF files are allowed'));
    }
  }
});

// Middleware to handle nested form data from multer
const handleNestedFormData = (req, res, next) => {
  if (req.body && typeof req.body.location !== 'object') {
    const location = {};
    for (const key in req.body) {
      if (key.startsWith('location[')) {
        const match = key.match(/location\[(.*?)\]/);
        if (match && match[1]) {
          location[match[1]] = req.body[key];
        }
      }
    }
    req.body.location = location;
  }
  next();
};

// Shared validation rules for creating and updating reports
const reportValidationRules = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').isIn([
    'harassment', 'assault', 'theft', 'vandalism', 'suspicious_activity',
    'emergency', 'safety_hazard', 'discrimination', 'bullying', 'other'
  ]).withMessage('Invalid category'),
  
  // Location validation
  body('location.coordinates').customSanitizer(value => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  }),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates are required'),
  body('location.coordinates.*').isFloat({ min: -180, max: 180 }).withMessage('Coordinates must be valid numbers'),
  
  // Optional location fields
  body('location.address').optional().trim().isLength({ max: 200 }),
  body('location.building').optional().trim().isLength({ max: 100 }),
  body('location.floor').optional().trim().isLength({ max: 20 }),

  // Incident time validation
  body('incidentTime').isISO8601().withMessage('Invalid date format'),

  // Custom validation for attachments (optional)
  body('attachments').optional().isArray({ max: 5 }).withMessage('You can upload a maximum of 5 files.')
];

// @route   POST /api/reports
// @desc    Submit a new incident report
// @access  Private
router.post('/', 
  auth, 
  upload.array('attachments', 5), 
  handleNestedFormData,
  reportValidationRules,
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      location,
      incidentTime
    } = req.body;

    // Get user info
    const user = req.user;

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];

    // Parse coordinates if sent as a string
    let coordinates = location.coordinates;
    if (typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates);
      } catch (e) {
        coordinates = undefined;
      }
    }

    // Create report data
    const reportData = {
      reporterId: user.userId,
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: coordinates || location.coordinates,
        address: location.address || '',
        building: location.building || '',
        floor: location.floor || ''
      },
      incidentTime: incidentTime || new Date(),
      attachments,
      isAnonymous: user.isAnonymous || true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (isMongoConnected()) {
      // Create report in MongoDB
      const report = await Report.create(reportData);

      // AI processing (async - don't block response)
      try {
        const aiCategory = await categorizeReport(description);
        const sentiment = await analyzeSentiment(description);
        
        report.aiCategory = aiCategory;
        report.sentiment = sentiment;
        await report.save();
      } catch (aiError) {
        console.error('AI processing error:', aiError);
        // Continue without AI processing
      }

      res.status(201).json({
        success: true,
        report: {
          id: report._id,
          title: report.title,
          category: report.category,
          status: report.status,
          createdAt: report.createdAt
        }
      });
    } else {
      // Create report in memory store
      const reportDataForMemory = {
        userId: user.userId,
        title,
        description,
        category,
        location: {
          address: location.address || '',
          building: location.building || '',
          floor: location.floor || '',
          coordinates: coordinates || location.coordinates
        },
        incidentTime: incidentTime || new Date().toISOString(),
        attachments,
        isAnonymous: user.isAnonymous || true
      };

      const report = memoryStore.createReport(reportDataForMemory);

      res.status(201).json({
        success: true,
        report: {
          id: report.id,
          title: report.title,
          category: report.category,
          status: report.status,
          createdAt: report.createdAt
        }
      });
    }

  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during report submission'
    });
  }
});

// @route   GET /api/reports
// @desc    Get reports (filtered by user role)
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('status').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      category,
      status,
      startDate,
      endDate
    } = req.query;

    const user = req.user;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    // Regular users can only see their own reports
    if (user.role === 'user') {
      query.reporterId = user.userId;
    }

    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (isMongoConnected()) {
      // Get reports from MongoDB
      const reports = await Report.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'anonymousId email role');

      // Get total count
      const total = await Report.countDocuments(query);

      res.json({
        success: true,
        reports: reports.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          category: report.category,
          status: report.status,
          priority: report.priority,
          location: report.location,
        incidentTime: report.incidentTime,
          createdAt: report.createdAt,
          assignedTo: report.assignedTo,
          attachments: report.attachments || [],
          publicUpdates: report.publicUpdates || []
        })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    } else {
      // Use memory store
      let userReports = memoryStore.findReportsByUserId(user.userId);
      
      // Apply filters
      if (category) {
        userReports = userReports.filter(report => report.category === category);
      }
      if (status) {
        userReports = userReports.filter(report => report.status === status);
      }
      if (startDate || endDate) {
        userReports = userReports.filter(report => {
          const reportDate = new Date(report.createdAt);
          if (startDate && reportDate < new Date(startDate)) return false;
          if (endDate && reportDate > new Date(endDate)) return false;
          return true;
        });
      }
      
      // Sort by creation date (newest first)
      userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      const total = userReports.length;
      const paginatedReports = userReports.slice(skip, skip + parseInt(limit));
      
      res.json({
        success: true,
        reports: paginatedReports.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          category: report.category,
          status: report.status,
          priority: report.priority,
          location: report.location,
          incidentTime: report.incidentTime,
          createdAt: report.createdAt,
          attachments: report.attachments || [],
          publicUpdates: report.publicUpdates || []
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get specific report
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const report = await Report.findById(id)
      .populate('assignedTo', 'anonymousId email role')
      .populate('adminNotes.addedBy', 'anonymousId email role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access permissions
    if (user.role === 'user' && report.reporterId.toString() !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      report: {
        id: report._id,
        title: report.title,
        description: report.description,
        category: report.category,
        aiCategory: report.aiCategory,
        priority: report.priority,
        sentiment: report.sentiment,
        status: report.status,
        location: report.location,
        incidentTime: report.incidentTime,
        attachments: report.attachments,
        publicUpdates: report.publicUpdates,
        adminNotes: user.role !== 'user' ? report.adminNotes : [],
        assignedTo: report.assignedTo,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update a report
// @access  Private (reporter only)
router.put('/:id', 
  auth, 
  upload.array('attachments', 5), 
  handleNestedFormData,
  reportValidationRules,
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log the validation errors for easier debugging
    console.error('Update Report Validation Errors:', errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Only the original reporter can edit their report
    if (report.reporterId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to edit this report' });
    }

    const { title, description, category, incidentTime, location } = req.body;

    // Update fields
    report.title = title;
    report.description = description;
    report.category = category;
    if (location) {
      report.location.coordinates = location.coordinates;
      report.location.address = location.address || '';
      report.location.building = location.building || '';
      report.location.floor = location.floor || '';
    }
    if (incidentTime) report.incidentTime = incidentTime;

    // For this implementation, we are not handling attachment edits to keep it simple.
    // A full implementation would handle adding/removing files.

    report.updatedAt = Date.now();

    const updatedReport = await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      report: updatedReport
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reports/heatmap/data
// @desc    Get heatmap data
// @access  Private
router.get('/heatmap/data', auth, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('categories').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, categories } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();
    const categoryList = categories ? categories.split(',') : [];

    const heatmapData = await Report.getHeatmapData(start, end, categoryList);

    res.json({
      success: true,
      heatmapData: heatmapData.map(report => ({
        coordinates: report.location.coordinates,
        category: report.category,
        priority: report.priority,
        createdAt: report.createdAt
      }))
    });

  } catch (error) {
    console.error('Heatmap data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/nearby
// @desc    Get reports near a location
// @access  Private
router.get('/nearby', auth, [
  query('longitude').isFloat().withMessage('Longitude is required'),
  query('latitude').isFloat().withMessage('Latitude is required'),
  query('radius').optional().isInt({ min: 100, max: 10000 }).withMessage('Radius must be between 100 and 10000 meters'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      longitude,
      latitude,
      radius = 1000,
      limit = 20
    } = req.query;

    const nearbyReports = await Report.getReportsNearLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(radius),
      parseInt(limit)
    );

    res.json({
      success: true,
      reports: nearbyReports.map(report => ({
        id: report._id,
        title: report.title,
        category: report.category,
        priority: report.priority,
        location: report.location,
        createdAt: report.createdAt
      }))
    });

  } catch (error) {
    console.error('Nearby reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 