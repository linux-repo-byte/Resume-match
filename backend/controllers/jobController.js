const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/resumeAnalysisService');
const { matchResumeToJob } = require('../services/matchingEngine');
const { expireJobs } = require('../services/jobExpiryService');

const normalizeSkills = (skills) => {
  const values = Array.isArray(skills) ? skills : String(skills || '').split(',');
  const seen = new Set();
  return values
    .map((skill) => (typeof skill === 'string' ? { name: skill, weight: 1 } : skill))
    .map((skill) => ({ name: String(skill.name || '').trim(), weight: Number(skill.weight) || 1 }))
    .filter((skill) => skill.name && !seen.has(skill.name.toLowerCase()) && seen.add(skill.name.toLowerCase()));
};

const jobPayload = (body) => ({
  title: body.title,
  company: body.company,
  location: body.location,
  salary: body.salary || 'Negotiable',
  employmentType: body.employmentType,
  description: body.description,
  requiredSkills: normalizeSkills(body.requiredSkills),
  preferredSkills: normalizeSkills(body.preferredSkills),
  requiredExperience: Number(body.requiredExperience) || 0,
  educationRequirement: body.educationRequirement,
  status: body.status || 'open',
  expiresAt: body.expiresAt || undefined,
});

const getCandidateResume = async (candidateId) => {
  const resume = await Resume.findOne({ candidate: candidateId, status: 'parsed' })
    .sort({ createdAt: -1 })
    .select('+extractedText');
  if (!resume) return null;
  return {
    resume,
    analysis: resume.analysis || analyzeResume(resume.extractedText),
  };
};

const addCompatibility = (job, candidateResume) => {
  const item = job.toObject ? job.toObject() : job;
  if (!candidateResume) return item;
  return {
    ...item,
    compatibility: matchResumeToJob({
      resumeText: candidateResume.resume.extractedText,
      resumeAnalysis: candidateResume.analysis,
      job: item,
    }),
  };
};

const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...jobPayload(req.body), recruiter: req.user._id });
  res.status(201).json({ success: true, job });
});

const getJobs = asyncHandler(async (req, res) => {
  await expireJobs();
  const filters = {};
  const andFilters = [];
  if (req.user.role === 'candidate') filters.status = 'open';
  else if (req.query.status) filters.status = req.query.status;
  if (req.query.location) filters.location = new RegExp(req.query.location, 'i');
  if (req.query.employmentType) filters.employmentType = req.query.employmentType;
  if (req.query.q) {
    const search = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    andFilters.push({ $or: [{ title: search }, { company: search }, { description: search }, { location: search }] });
  }
  if (req.query.skill) {
    andFilters.push({ $or: [
      { 'requiredSkills.name': new RegExp(req.query.skill, 'i') },
      { 'preferredSkills.name': new RegExp(req.query.skill, 'i') },
    ] });
  }
  if (andFilters.length) filters.$and = andFilters;

  const [jobs, candidateResume] = await Promise.all([
    Job.find(filters).populate('recruiter', 'name company').sort({ createdAt: -1 }),
    req.user.role === 'candidate' ? getCandidateResume(req.user._id) : null,
  ]);
  res.status(200).json({ success: true, count: jobs.length, jobs: jobs.map((job) => addCompatibility(job, candidateResume)) });
});

const getMyJobs = asyncHandler(async (req, res) => {
  await expireJobs();
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: jobs.length, jobs });
});

const getJobById = asyncHandler(async (req, res) => {
  await expireJobs();
  const job = await Job.findById(req.params.id).populate('recruiter', 'name company');
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  if (req.user.role === 'candidate' && job.status !== 'open') {
    res.status(404);
    throw new Error('Job is no longer available');
  }
  const candidateResume = req.user.role === 'candidate' ? await getCandidateResume(req.user._id) : null;
  res.status(200).json({ success: true, job: addCompatibility(job, candidateResume) });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  Object.assign(job, jobPayload(req.body));
  await job.save();
  res.status(200).json({ success: true, job });
});

const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['open', 'closed'].includes(status)) {
    res.status(400);
    throw new Error('Status must be open or closed');
  }
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiter: req.user._id },
    { status },
    { new: true, runValidators: true }
  );
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.status(200).json({ success: true, job });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  res.status(200).json({ success: true, message: 'Job deleted' });
});

module.exports = { createJob, getJobs, getMyJobs, getJobById, updateJob, updateJobStatus, deleteJob };