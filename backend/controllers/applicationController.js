const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/resumeAnalysisService');
const { matchResumeToJob } = require('../services/matchingEngine');
const PDFDocument = require('pdfkit');
const { expireJobs } = require('../services/jobExpiryService');

const MIN_RECOMMENDATION_SCORE = 50;

const getCandidateResume = async (candidateId, resumeId) => {
  const filter = { candidate: candidateId, status: 'parsed' };
  if (resumeId) filter._id = resumeId;
  const resume = await Resume.findOne(filter).sort({ createdAt: -1 }).select('+extractedText');
  return resume ? { resume, analysis: resume.analysis || analyzeResume(resume.extractedText) } : null;
};

const applyToJob = asyncHandler(async (req, res) => {
  await expireJobs();
  const [job, candidateResume] = await Promise.all([
    Job.findOne({ _id: req.params.jobId, status: 'open' }),
    getCandidateResume(req.user._id, req.body.resumeId),
  ]);
  if (!job) {
    res.status(404);
    throw new Error('Open job not found');
  }
  if (!candidateResume) {
    res.status(400);
    throw new Error('Upload and parse a resume before applying');
  }

  const match = matchResumeToJob({
    resumeText: candidateResume.resume.extractedText,
    resumeAnalysis: candidateResume.analysis,
    job,
  });
  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    resume: candidateResume.resume._id,
    coverLetter: req.body.coverLetter,
    match,
  });
  await application.populate('job', 'title company location');
  res.status(201).json({ success: true, application });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate('job', 'title company location employmentType status')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: applications.length, applications });
});

const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }
  const applications = await Application.find({ job: job._id })
    .populate('candidate', 'name email')
    .populate('resume', 'originalFileName textStats')
    .sort({ 'match.finalScore': -1, createdAt: -1 });
  res.status(200).json({ success: true, count: applications.length, applications });
});

const downloadApplicationResume = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'recruiter')
    .populate('resume', 'filePath originalFileName');
  if (!application || !application.job || String(application.job.recruiter) !== String(req.user._id) || !application.resume) {
    res.status(404);
    throw new Error('Application resume not found');
  }
  res.download(application.resume.filePath, application.resume.originalFileName);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('job', 'recruiter');
  if (!application || String(application.job.recruiter) !== String(req.user._id)) {
    res.status(404);
    throw new Error('Application not found');
  }
  application.status = req.body.status;
  await application.save();
  res.status(200).json({ success: true, application });
});

const downloadCoverLetter = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'recruiter title company')
    .populate('candidate', 'name');
  if (!application || !application.job || String(application.job.recruiter) !== String(req.user._id)) {
    res.status(404);
    throw new Error('Application not found');
  }
  if (!application.coverLetter) {
    res.status(404);
    throw new Error('No cover letter was submitted');
  }

  const candidateName = application.candidate?.name || 'Candidate';
  const filename = `${candidateName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'candidate'}-cover-letter.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const document = new PDFDocument({ margin: 56 });
  document.pipe(res);
  document.fontSize(18).font('Helvetica-Bold').text('Cover Letter');
  document.moveDown(0.75).fontSize(11).font('Helvetica').text(`Candidate: ${candidateName}`);
  document.text(`Role: ${application.job.title || 'Position'}`);
  if (application.job.company) document.text(`Company: ${application.job.company}`);
  document.moveDown(1.25).fontSize(11).text(application.coverLetter, { lineGap: 4 });
  document.end();
});

const getCandidateDashboard = asyncHandler(async (req, res) => {
  await expireJobs();
  const [candidateResume, applications, jobs] = await Promise.all([
    getCandidateResume(req.user._id),
    Application.find({ candidate: req.user._id }).populate('job', 'title company location').sort({ createdAt: -1 }).limit(5),
    Job.find({ status: 'open' }).sort({ createdAt: -1 }).limit(50),
  ]);
  const recommendations = candidateResume
    ? jobs.map((job) => ({ ...job.toObject(), compatibility: matchResumeToJob({ resumeText: candidateResume.resume.extractedText, resumeAnalysis: candidateResume.analysis, job }) }))
      .filter((job) => job.compatibility.finalScore >= MIN_RECOMMENDATION_SCORE)
      .sort((left, right) => right.compatibility.finalScore - left.compatibility.finalScore)
      .slice(0, 5)
    : [];
  const missingSkills = [...new Set(recommendations.flatMap((job) => job.compatibility.missingSkills))];
  const skillCoverage = recommendations.length
    ? Math.round(recommendations.reduce((sum, job) => sum + job.compatibility.skillScore, 0) / recommendations.length)
    : 0;

  res.status(200).json({
    success: true,
    dashboard: {
      resumeScore: candidateResume?.analysis?.resumeScore || 0,
      skillCoverage,
      detectedSkills: candidateResume?.analysis?.skills || [],
      missingSkills,
      skillGap: missingSkills.length,
      recommendedJobs: recommendations,
      recentApplications: applications,
    },
  });
});

module.exports = { applyToJob, getMyApplications, getJobApplications, downloadApplicationResume, updateApplicationStatus, downloadCoverLetter, getCandidateDashboard };