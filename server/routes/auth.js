const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const memoryStore = require('../services/memoryStore');
const AdminRequest = require('../models/AdminRequest');

const router = express.Router();

// Add request logging middleware at the top of the file
router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} - Body:`, req.body);
  next();
});

// Check if MongoDB is connected
const isMongoConnected = () => {
  return User.db.readyState === 1;
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (optional email/password)
// @access  Public
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
    
    // Generate anonymous ID
    const anonymousId = uuidv4();
    
    // Use MongoDB if available, otherwise use memory store
    if (isMongoConnected()) {
      // Check if email already exists (if provided)
      if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
      }

      // Create user
      const userData = {
        anonymousId,
        campusId,
        isAnonymous: !email // Anonymous if no email provided
      };

      if (email) {
        userData.email = email;
      }

      if (password) {
        userData.password = password; // Let the pre-save hook handle hashing
      }

      const user = await User.create(userData);

      // Generate token
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
    } else {
      // Use memory store
      if (email) {
        const existingUser = memoryStore.findUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
      }

      // Create user in memory store
      const userData = {
        anonymousId,
        campusId,
        isAnonymous: !email,
        email: email || null,
        password: password ? await bcrypt.hash(password, 10) : null,
        role: 'user'
      };

      const user = memoryStore.createUser(userData);

      // Generate token
      const token = generateToken(user.id, user.role);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          anonymousId: user.anonymousId,
          email: user.email,
          role: user.role,
          isAnonymous: user.isAnonymous,
          campusId: user.campusId
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Enhanced /login route with detailed logging
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('Login attempt:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user) {
        console.error('User not found for email:', email);
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials (user not found)'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.error('Password mismatch for user:', email);
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials (password mismatch)'
        });
      }

      await user.updateLastActive();

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
    } else {
      // Use memory store
      const user = memoryStore.findUserByEmail(email);
      if (!user || !user.password) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user.id, user.role);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          anonymousId: user.anonymousId,
          email: user.email,
          role: user.role,
          isAnonymous: user.isAnonymous,
          campusId: user.campusId
        }
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
      stack: error.stack
    });
  }
});

// @route   POST /api/auth/anonymous
// @desc    Create anonymous user session
// @access  Public
router.post('/anonymous', [
  body('campusId').optional().isString().withMessage('Campus ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { campusId } = req.body;
    
    // Generate anonymous ID
    const anonymousId = uuidv4();
    
    if (isMongoConnected()) {
      // Create anonymous user
      const user = await User.createAnonymousUser(anonymousId, campusId);

      // Generate token
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          anonymousId: user.anonymousId,
          role: user.role,
          isAnonymous: user.isAnonymous,
          campusId: user.campusId
        }
      });
    } else {
      // Use memory store
      const userData = {
        anonymousId,
        campusId,
        isAnonymous: true,
        email: null,
        password: null,
        role: 'user'
      };

      const user = memoryStore.createUser(userData);

      // Generate token
      const token = generateToken(user.id, user.role);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          anonymousId: user.anonymousId,
          role: user.role,
          isAnonymous: user.isAnonymous,
          campusId: user.campusId
        }
      });
    }

  } catch (error) {
    console.error('Anonymous auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during anonymous authentication'
    });
  }
});

// Enhanced /admin-login route with detailed logging
router.post('/admin-login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user) {
        console.error('Admin user not found for email:', email);
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials (user not found)'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.error('Admin password mismatch for user:', email);
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials (password mismatch)'
        });
      }

      if (user.role !== 'admin' && user.role !== 'moderator') {
        console.error('User does not have admin/moderator role:', email, user.role);
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
    } else {
      // Use memory store
      const user = memoryStore.findUserByEmail(email);
      if (!user || !user.password) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password (with special handling for new admin accounts)
      let isMatch = false;
      if (user.email === 'normal@admin.com' && password === 'admin') {
        isMatch = true;
      } else if (user.email === 'Iapprove@admin.com' && password === 'approve') {
        isMatch = true;
      } else {
        isMatch = await bcrypt.compare(password, user.password);
      }
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Only allow existing admins or moderators to login
      if (user.role !== 'admin' && user.role !== 'moderator') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Administrative privileges required.'
        });
      }

      // Generate token
      const token = generateToken(user.id, user.role);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          anonymousId: user.anonymousId,
          email: user.email,
          role: user.role,
          isAnonymous: user.isAnonymous,
          campusId: user.campusId
        }
      });
    }

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login',
      error: error.message,
      stack: error.stack
    });
  }
});

// @route   POST /api/auth/request-admin
// @desc    Request admin privileges
// @access  Private
router.post('/request-admin', auth, [
  body('reason').isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('role').notEmpty().withMessage('Role is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('experience').notEmpty().withMessage('Experience is required'),
  body('responsibilities').notEmpty().withMessage('Responsibilities is required'),
  body('urgency').isIn(['low', 'medium', 'high', 'critical']).withMessage('Valid urgency level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { reason, role, department, experience, responsibilities, urgency, contactInfo } = req.body;
    const user = req.user;

    if (isMongoConnected()) {
      // Check for existing pending request
      const existing = await AdminRequest.findOne({ userId: user.userId, status: 'pending' });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending admin request'
        });
      }
      // Create new admin request
      const request = await AdminRequest.create({
        userId: user.userId,
        reason,
        role,
        department,
        experience,
        responsibilities,
        urgency,
        contactInfo: contactInfo || ''
      });
      return res.status(201).json({
        success: true,
        message: 'Admin request submitted successfully',
        request: {
          id: request._id,
          status: request.status,
          createdAt: request.createdAt
        }
      });
    } else {
      // Use memory store
      const existingRequests = memoryStore.getAdminRequests('pending');
      const hasPendingRequest = existingRequests.some(req => req.userId === user.userId);
      
      if (hasPendingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending admin request'
        });
      }

      // Create admin request with survey data
      const requestData = {
        reason,
        role,
        department,
        experience,
        responsibilities,
        urgency,
        contactInfo: contactInfo || ''
      };
      const request = memoryStore.createAdminRequest(user.userId, requestData);

      res.status(201).json({
        success: true,
        message: 'Admin request submitted successfully',
        request: {
          id: request.id,
          status: request.status,
          createdAt: request.createdAt
        }
      });
    }

  } catch (error) {
    console.error('Admin request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin request'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        anonymousId: user.anonymousId,
        email: user.email,
        role: user.role,
        isAnonymous: user.isAnonymous,
        campusId: user.campusId,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('notifications').optional().isBoolean(),
  body('locationSharing').optional().isBoolean(),
  body('language').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { notifications, locationSharing, language } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (notifications !== undefined) user.preferences.notifications = notifications;
    if (locationSharing !== undefined) user.preferences.locationSharing = locationSharing;
    if (language) user.preferences.language = language;

    await user.save();

    res.json({
      success: true,
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 