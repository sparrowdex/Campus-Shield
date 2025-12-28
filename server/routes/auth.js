const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const auth = require("../middleware/auth");
const memoryStore = require('../services/memoryStoreSingleton');
const AdminRequest = require("../models/AdminRequest");
const authService = require("../services/authService");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

// Add request logging middleware at the top of the file
router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} - Body:`, req.body);
  next();
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    campusId: z.string().optional(),
  }),
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with an email and password, or as an anonymous user.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (at least 6 characters).
 *               campusId:
 *                 type: string
 *                 description: ID of the campus the user belongs to.
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     anonymousId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isAnonymous:
 *                       type: boolean
 *                     campusId:
 *                       type: string
 *       400:
 *         description: Bad request (e.g., validation error, user already exists).
 *       500:
 *         description: Server error.
 */
router.post(
  "/register",
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.registerUser(req.body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in a user with their email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     anonymousId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isAnonymous:
 *                       type: boolean
 *                     campusId:
 *                       type: string
 *       400:
 *         description: Invalid credentials.
 *       500:
 *         description: Server error.
 */
router.post(
  "/login",
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

const anonymousSchema = z.object({
  body: z.object({
    campusId: z.string().optional(),
  }),
});

/**
 * @swagger
 * /auth/anonymous:
 *   post:
 *     summary: Create an anonymous user session
 *     description: Creates a session for a user without registration.
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campusId:
 *                 type: string
 *                 description: ID of the campus the user belongs to.
 *     responses:
 *       201:
 *         description: Anonymous session created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     anonymousId:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isAnonymous:
 *                       type: boolean
 *                     campusId:
 *                       type: string
 *       500:
 *         description: Server error.
 */
router.post(
  "/anonymous",
  validate(anonymousSchema),
  async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.loginAnonymousUser(req.body.campusId);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

/**
 * @swagger
 * /auth/admin-login:
 *   post:
 *     summary: Log in an administrator or moderator
 *     description: Log in a user with administrative privileges.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Admin user logged in successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid credentials.
 *       403:
 *         description: Access denied.
 *       500:
 *         description: Server error.
 */
router.post(
  "/admin-login",
  validate(adminLoginSchema),
  async (req, res, next) => {
    try {
      const { user, accessToken, refreshToken } = await authService.loginAdmin(req.body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

const requestAdminSchema = z.object({
  body: z.object({
    reason: z.string().min(10, "Reason must be between 10 and 500 characters").max(500, "Reason must be between 10 and 500 characters"),
    role: z.string().min(1, "Role is required"),
    department: z.string().min(1, "Department is required"),
    experience: z.string().min(1, "Experience is required"),
    responsibilities: z.string().min(1, "Responsibilities is required"),
    urgency: z.enum(["low", "medium", "high", "critical"]),
    contactInfo: z.string().optional(),
  }),
});

/**
 * @swagger
 * /auth/request-admin:
 *   post:
 *     summary: Request admin privileges
 *     description: Allows an authenticated user to request admin or moderator roles by providing a reason and other details.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - role
 *               - department
 *               - experience
 *               - responsibilities
 *               - urgency
 *             properties:
 *               reason:
 *                 type: string
 *                 description: The reason for the admin request.
 *               role:
 *                 type: string
 *                 description: The role being requested.
 *               department:
 *                 type: string
 *                 description: The department of the user.
 *               experience:
 *                 type: string
 *                 description: The user's relevant experience.
 *               responsibilities:
 *                 type: string
 *                 description: The responsibilities the user will have.
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: The urgency of the request.
 *               contactInfo:
 *                 type: string
 *                 description: Optional contact information.
 *     responses:
 *       201:
 *         description: Admin request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 request:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request (e.g., pending request already exists).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.post(
  "/request-admin",
  auth,
  validate(requestAdminSchema),
  async (req, res, next) => {
    try {
      const request = await authService.requestAdmin(req.user.userId, req.body);
      return res.status(201).json({
        success: true,
        message: "Admin request submitted successfully",
        request,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Obtains a new access token by providing a valid refresh token. The refresh token is expected to be in an HTTP-only cookie.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Unauthorized (e.g., invalid or missing refresh token).
 */
router.post("/refresh-token", async (req, res, next) => {
    try {
        const { accessToken, newRefreshToken } = await authService.refreshAuthToken(req.cookies.refreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            accessToken,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, async (req, res, next) => {
    try {
        await authService.logoutUser(req.user.userId);
        res.clearCookie('refreshToken');
        res.json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

const preferencesSchema = z.object({
  body: z.object({
    notifications: z.boolean().optional(),
    locationSharing: z.boolean().optional(),
    language: z.string().optional(),
  }),
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put(
  "/preferences",
  auth,
  validate(preferencesSchema),
  async (req, res, next) => {
    try {
      const preferences = await authService.updateUserPreferences(req.user.userId, req.body);
      res.json({
        success: true,
        preferences,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
