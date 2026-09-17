const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @desc    List all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 *
 * This route exists mainly as a working example of `protect` + `authorize`
 * stacked together, for future admin-panel and recruiter routes to copy.
 */
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  })
);

/**
 * @desc    Example recruiter-or-admin-only route (placeholder)
 * @route   GET /api/users/recruiter-area
 * @access  Private/Recruiter,Admin
 */
router.get(
  '/recruiter-area',
  protect,
  authorize('recruiter', 'admin'),
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: `Welcome ${req.user.name}, recruiter-area placeholder route.`,
    });
  })
);

module.exports = router;
