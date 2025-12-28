const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const moderator = require('../middleware/moderator');
const memoryStore = require('../services/memoryStoreSingleton');
const AdminRequest = require('../models/AdminRequest');
const ChatRoom = require('../models/ChatRoom');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return Report.db && Report.db.readyState === 1;
};

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', auth, admin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // Get statistics from MongoDB
      const totalUsers = await User.countDocuments();
      const totalReports = await Report.countDocuments();
      const pendingReports = await Report.countDocuments({ status: 'pending' });
      const resolvedReports = await Report.countDocuments({ status: 'resolved' });
      const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0.0';
      
      // Get recent reports (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentReports = await Report.countDocuments({
        createdAt: { $gte: yesterday }
      });

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalReports,
          pendingReports,
          resolvedReports,
          resolutionRate,
          recentReports,
          activeChats: 0 // TODO: Implement chat counting
        }
      });
    } else {
      // Use memory store
      const stats = memoryStore.getStats();
      const allReports = memoryStore.getAllReports();
      
      // Calculate recent reports (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentReports = allReports.filter(report => 
        new Date(report.createdAt) >= yesterday
      ).length;

      res.json({
        success: true,
        stats: {
          totalUsers: stats.totalUsers,
          totalReports: stats.totalReports,
          pendingReports: stats.pendingReports,
          resolvedReports: stats.resolvedReports,
          resolutionRate: stats.resolutionRate,
          recentReports,
          activeChats: 0 // TODO: Implement chat counting
        }
      });
    }
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get statistics
    const totalReports = await Report.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const pendingReports = await Report.countDocuments({
      status: 'pending',
      createdAt: { $gte: start, $lte: end }
    });

    const resolvedReports = await Report.countDocuments({
      status: 'resolved',
      createdAt: { $gte: start, $lte: end }
    });

    // Get category breakdown
    const categoryStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get priority breakdown
    const priorityStats = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent reports
    const recentReports = await Report.find({
      createdAt: { $gte: start, $lte: end }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('assignedTo', 'anonymousId email role');

    res.json({
      success: true,
      dashboard: {
        totalReports,
        pendingReports,
        resolvedReports,
        categoryStats,
        priorityStats,
        recentReports: recentReports.map(report => ({
          id: report._id,
          title: report.title,
          category: report.category,
          priority: report.priority,
          status: report.status,
          createdAt: report.createdAt,
          assignedTo: report.assignedTo
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports (admin view)
// @access  Private (Admin only)
router.get('/reports', auth, admin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('status').optional().isString(),
  query('priority').optional().isString(),
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
      priority,
      startDate,
      endDate
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
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
          aiCategory: report.aiCategory,
          priority: report.priority,
          sentiment: report.sentiment,
          status: report.status,
          location: report.location,
          incidentTime: report.incidentTime,
          attachments: report.attachments,
          adminNotes: report.adminNotes,
          publicUpdates: report.publicUpdates,
          assignedTo: report.assignedTo,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
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
      let allReports = memoryStore.getAllReports();
      
      // Apply filters
      if (category) {
        allReports = allReports.filter(report => report.category === category);
      }
      if (status) {
        allReports = allReports.filter(report => report.status === status);
      }
      if (priority) {
        allReports = allReports.filter(report => report.priority === priority);
      }
      if (startDate || endDate) {
        allReports = allReports.filter(report => {
          const reportDate = new Date(report.createdAt);
          if (startDate && reportDate < new Date(startDate)) return false;
          if (endDate && reportDate > new Date(endDate)) return false;
          return true;
        });
      }
      
      // Sort by creation date (newest first)
      allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      const total = allReports.length;
      const paginatedReports = allReports.slice(skip, skip + parseInt(limit));
      
      res.json({
        success: true,
        reports: paginatedReports.map(report => ({
          id: report.id,
          title: report.title,
          description: report.description,
          category: report.category,
          priority: report.priority,
          status: report.status,
          location: report.location,
          incidentTime: report.incidentTime,
          attachments: report.attachments || [],
          publicUpdates: report.publicUpdates || [],
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
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
    console.error('Get admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/admin/reports/:id/status
// @desc    Update report status
// @access  Private (Admin only)
router.patch('/reports/:id/status', auth, admin, [
  body('status').isIn(['pending', 'under_review', 'investigating', 'resolved', 'closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (isMongoConnected()) {
      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      report.status = status;
      report.updatedAt = new Date();
      await report.save();

      res.json({
        success: true,
        report: {
          id: report._id,
          status: report.status,
          updatedAt: report.updatedAt
        }
      });
    } else {
      // Use memory store
      const updatedReport = memoryStore.updateReport(id, { status });
      if (!updatedReport) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      res.json({
        success: true,
        report: {
          id: updatedReport.id,
          status: updatedReport.status,
          updatedAt: updatedReport.updatedAt
        }
      });
    }

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/reports/:id/note
// @desc    Add admin note to report
// @access  Private (Admin only)
router.post('/reports/:id/note', auth, admin, [
  body('note').isLength({ min: 1, max: 1000 }).withMessage('Note must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { note } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.addAdminNote(note, req.user.userId);

    res.json({
      success: true,
      message: 'Admin note added successfully'
    });

  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/reports/:id/update
// @desc    Add public update to report
// @access  Private (Admin only)
router.post('/reports/:id/update', auth, admin, [
  body('message').isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { message } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.addPublicUpdate(message);

    res.json({
      success: true,
      message: 'Public update added successfully'
    });

  } catch (error) {
    console.error('Add public update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin only)
router.get('/analytics', auth, admin, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Daily reports trend
    const dailyTrend = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Category distribution
    const categoryDistribution = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPriority: { $avg: { $cond: [
            { $eq: ['$priority', 'critical'] }, 4,
            { $cond: [
              { $eq: ['$priority', 'high'] }, 3,
              { $cond: [
                { $eq: ['$priority', 'medium'] }, 2, 1
              ]}
            ]}
          ]}}
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Resolution time analysis
    const resolutionTime = await Report.aggregate([
      {
        $match: {
          status: 'resolved',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        dailyTrend,
        categoryDistribution,
        resolutionTime: resolutionTime[0] || {
          avgResolutionTime: 0,
          minResolutionTime: 0,
          maxResolutionTime: 0
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });
    const anonymousUsers = await User.countDocuments({ isAnonymous: true });
    const registeredUsers = await User.countDocuments({ isAnonymous: false });

    res.json({
      success: true,
      users: {
        total: totalUsers,
        active: activeUsers,
        anonymous: anonymousUsers,
        registered: registeredUsers
      }
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/requests
// @desc    Get all admin requests
// @access  Private (Moderator only)
router.get('/requests', auth, moderator, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // Get all admin requests from MongoDB, populate user info
      const requests = await AdminRequest.find().populate('userId', 'email anonymousId');
      const requestsWithUserInfo = requests.map(request => ({
        ...request.toObject(),
        user: request.userId ? {
          email: request.userId.email,
          anonymousId: request.userId.anonymousId
        } : null
      }));
      return res.json({
        success: true,
        requests: requestsWithUserInfo
      });
    } else {
      // Use memory store
      const requests = memoryStore.getAdminRequests();
      
      // Add user information to each request
      const requestsWithUserInfo = requests.map(request => {
        const user = memoryStore.findUserById(request.userId);
        return {
          ...request,
          user: user ? {
            email: user.email,
            anonymousId: user.anonymousId
          } : null
        };
      });

      res.json({
        success: true,
        requests: requestsWithUserInfo
      });
    }
  } catch (error) {
    console.error('Admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin requests'
    });
  }
});

// @route   POST /api/admin/requests/:requestId/approve
// @desc    Approve an admin request
// @access  Private (Moderator only)
router.post('/requests/:requestId/approve', auth, moderator, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const adminUser = req.user;

    if (isMongoConnected()) {
      // Approve admin request in MongoDB
      const request = await AdminRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Admin request not found' });
      }
      request.status = 'approved';
      request.reviewedBy = adminUser.userId;
      request.reviewNotes = notes || '';
      request.reviewedAt = new Date();
      await request.save();
      // Promote user to admin
      await User.findByIdAndUpdate(request.userId, { role: 'admin' });
      return res.json({
        success: true,
        message: 'Admin request approved successfully',
        request
      });
    } else {
      // Use memory store
      const request = memoryStore.approveAdminRequest(requestId, adminUser.userId, notes || '');
      
      if (request) {
        res.json({
          success: true,
          message: 'Admin request approved successfully',
          request
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Admin request not found'
        });
      }
    }
  } catch (error) {
    console.error('Admin request approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving admin request'
    });
  }
});

// @route   POST /api/admin/requests/:requestId/reject
// @desc    Reject an admin request
// @access  Private (Moderator only)
router.post('/requests/:requestId/reject', auth, moderator, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const adminUser = req.user;

    if (isMongoConnected()) {
      // Reject admin request in MongoDB
      const request = await AdminRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Admin request not found' });
      }
      request.status = 'rejected';
      request.reviewedBy = adminUser.userId;
      request.reviewNotes = notes || '';
      request.reviewedAt = new Date();
      await request.save();
      return res.json({
        success: true,
        message: 'Admin request rejected successfully',
        request
      });
    } else {
      // Use memory store
      const request = memoryStore.rejectAdminRequest(requestId, adminUser.userId, notes || '');
      
      if (request) {
        res.json({
          success: true,
          message: 'Admin request rejected successfully',
          request
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Admin request not found'
        });
      }
    }
  } catch (error) {
    console.error('Admin request rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting admin request'
    });
  }
});

// Assign a report to an admin
router.post('/reports/:reportId/assign', auth, admin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const adminUser = req.user;
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    if (report.assignedTo) {
      // Already assigned
      const assignedAdmin = await User.findById(report.assignedTo);
      return res.status(400).json({
        success: false,
        message: `Already taken by ${assignedAdmin?.email || 'another admin'}`
      });
    }
    report.assignedTo = adminUser.userId;
    await report.save();
    res.json({ success: true, message: 'Report assigned to you', report });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({ success: false, message: 'Server error during report assignment' });
  }
});

// @route   GET /api/admin/active-chats
// @desc    Get count of active chat rooms (not resolved/closed)
// @access  Private
router.get('/active-chats', auth, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find();
    let activeCount = 0;
    for (const room of chatRooms) {
      const report = await Report.findById(room.reportId);
      if (report && report.status !== 'resolved' && report.status !== 'closed') {
        activeCount++;
      }
    }
    res.json({ activeChats: activeCount });
  } catch (error) {
    console.error('Error fetching active chats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 