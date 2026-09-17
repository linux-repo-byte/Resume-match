const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Application = require('../models/Application');

const getStats = asyncHandler(async (req, res) => {
  const [users, jobs, resumes, applications, scoreSummary] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Resume.countDocuments(),
    Application.countDocuments(),
    Application.aggregate([
      { $match: { 'match.finalScore': { $exists: true } } },
      { $group: { _id: null, averageScore: { $avg: '$match.finalScore' }, topScore: { $max: '$match.finalScore' } } },
    ]),
  ]);

  const roleCounts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  res.json({
    success: true,
    stats: {
      users,
      jobs,
      resumes,
      applications,
      averageMatchScore: Math.round(scoreSummary[0]?.averageScore || 0),
      topMatchScore: Math.round(scoreSummary[0]?.topScore || 0),
      roles: roleCounts.reduce((result, item) => ({ ...result, [item._id]: item.count }), {}),
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'candidate', company } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  const user = await User.create({ name, email, password, role, company: role === 'recruiter' ? company : undefined });
  res.status(201).json({ success: true, user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { name, email, password, role, company, isActive } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (company !== undefined) user.company = company;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;
  await user.save();
  res.json({ success: true, user });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
});

const listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('recruiter', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, jobs });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('recruiter', 'name email');
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  await Application.deleteMany({ job: job._id });
  res.json({ success: true, message: 'Job and related applications deleted' });
});

const listResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find().populate('candidate', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, resumes });
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findByIdAndDelete(req.params.id);
  if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
  await Application.deleteMany({ resume: resume._id });
  res.json({ success: true, message: 'Resume and related applications deleted' });
});

const listApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate('candidate', 'name email')
    .populate('job', 'title company')
    .populate('resume', 'originalFileName analysis')
    .sort({ createdAt: -1 });
  res.json({ success: true, applications });
});

const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true })
    .populate('candidate', 'name email').populate('job', 'title company');
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, application });
});

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, message: 'Application deleted' });
});

module.exports = {
  getStats, listUsers, createUser, updateUser, deleteUser,
  listJobs, updateJob, deleteJob,
  listResumes, deleteResume,
  listApplications, updateApplication, deleteApplication,
};
