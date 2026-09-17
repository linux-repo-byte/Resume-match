const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (candidate or recruiter by default)
 * @route   POST /api/auth/register
 * @access  Public
 *
 * NOTE: For this foundation phase, anyone can sign up as 'candidate' or
 * 'recruiter'. Admin accounts should NOT be self-registrable in a real
 * deployment — either seed the first admin manually in the database, or
 * add a separate protected "create admin" endpoint restricted to
 * existing admins. That guard is left as a clearly marked TODO below.
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, company } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const requestedRole = role || 'candidate';

  // TODO: once an admin dashboard exists, block public admin self-registration
  // by requiring an authenticated admin to create other admins instead.
  if (requestedRole === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be self-registered');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: requestedRole,
    company: requestedRole === 'recruiter' ? company : undefined,
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

/**
 * @desc    Authenticate a user and return a JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // password has `select: false` on the schema, so explicitly request it
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/**
 * @desc    Get the currently logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private (any authenticated role)
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the `protect` middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/**
 * @desc    Update the currently logged-in user's profile
 * @route   PATCH /api/auth/me
 * @access  Private (any authenticated role)
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, email, password, company } = req.body;
  const user = req.user;

  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400);
      throw new Error('Name is required');
    }
    user.name = name.trim();
  }

  if (email !== undefined) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      res.status(400);
      throw new Error('Please provide a valid email');
    }
    const emailTaken = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (emailTaken) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }
    user.email = normalizedEmail;
  }

  if (password !== undefined) {
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    user.password = password;
  }

  if (user.role === 'recruiter' && company !== undefined) {
    user.company = company.trim();
  }

  await user.save();
  res.status(200).json({ success: true, user });
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select an image to upload');
  }

  req.user.profilePicture = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  };
  req.user.profilePictureUpdatedAt = new Date();
  await req.user.save();
  res.status(200).json({ success: true, user: req.user });
});

const getProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+profilePicture.data +profilePicture.contentType');
  if (!user?.profilePicture?.data || !user.profilePicture.contentType) {
    res.status(404);
    throw new Error('Profile picture not found');
  }

  res.type(user.profilePicture.contentType).send(user.profilePicture.data);
});

module.exports = { registerUser, loginUser, getMe, updateMe, updateProfilePicture, getProfilePicture };
