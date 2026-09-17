const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Verifies the Bearer token from the Authorization header, loads the
 * corresponding user (minus password), and attaches it to req.user.
 * Any route using this middleware requires a valid, non-expired JWT.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('This account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed or expired');
  }
});

module.exports = { protect };
