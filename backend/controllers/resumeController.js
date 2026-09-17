const asyncHandler = require('express-async-handler');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { parseResumeFile } = require('../services/resumeParserService');
const { analyzeResume } = require('../services/resumeAnalysisService');
const { deleteFileFromDisk, ALLOWED_MIME_TYPES } = require('../services/fileService');

/**
 * @desc    Upload a resume (PDF or DOCX), extract and store its text
 * @route   POST /api/resumes/upload
 * @access  Private/Candidate
 *
 * The file itself is already written to disk by multer (see fileService)
 * by the time this handler runs. This handler's job is: create the DB
 * record, run the parser, and update the record with the outcome.
 *
 * If parsing fails, the resume record is kept (status: 'failed') rather
 * than deleted — the candidate still uploaded a real file and should see
 * it in their history with a clear error, not have it silently vanish.
 */
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file was uploaded. Attach a PDF or DOCX under the "resume" field');
  }

  const { originalname, filename, path: filePath, size, mimetype } = req.file;

  let resume = await Resume.create({
    candidate: req.user._id,
    originalFileName: originalname,
    storedFileName: filename,
    filePath,
    fileType: ALLOWED_MIME_TYPES[mimetype],
    mimeType: mimetype,
    fileSize: size,
    status: 'processing',
  });

  try {
    const { rawText, cleanedText, stats } = await parseResumeFile(filePath, mimetype);
    resume.rawText = rawText;
    resume.extractedText = cleanedText;
    resume.textStats = stats;
    resume.analysis = analyzeResume(cleanedText);
    resume.analysisUpdatedAt = new Date();
    resume.status = 'parsed';
  } catch (err) {
    resume.status = 'failed';
    resume.parseError = err.message;
  }

  await resume.save();

  // Re-fetch through the default projection so the (potentially large)
  // text fields aren't echoed back in the upload response.
  const responseResume = await Resume.findById(resume._id);

  res.status(201).json({ success: true, resume: responseResume });
});

/**
 * @desc    List the logged-in candidate's resume upload history
 * @route   GET /api/resumes/my
 * @access  Private/Candidate
 */
const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ candidate: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: resumes.length, resumes });
});

/**
 * @desc    View one resume's metadata + extracted text
 * @route   GET /api/resumes/:id
 * @access  Private/Candidate (owner) or recruiter (attached application)
 */
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    candidate: req.user._id,
  }).select('+extractedText');

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  res.status(200).json({ success: true, resume });
});

/**
 * @desc    Return algorithmic analysis for one owned resume
 * @route   GET /api/resumes/:id/analysis
 * @access  Private/Candidate (owner only)
 */
const getResumeAnalysis = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    candidate: req.user._id,
  }).select('+extractedText');

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }
  if (resume.status !== 'parsed') {
    res.status(409);
    throw new Error('Resume text is not ready for analysis');
  }

  const analysis = analyzeResume(resume.extractedText);
  resume.analysis = analysis;
  resume.analysisUpdatedAt = new Date();
  await resume.save();

  res.status(200).json({ success: true, analysis });
});

/**
 * @desc    Download the original uploaded file
 * @route   GET /api/resumes/:id/download
 * @access  Private/Candidate (owner only)
 */
const downloadResume = asyncHandler(async (req, res) => {
  let resume = await Resume.findOne({ _id: req.params.id, candidate: req.user._id });

  if (!resume && req.user.role === 'recruiter') {
    const recruiterJobIds = await Job.distinct('_id', { recruiter: req.user._id });
    const application = await Application.exists({ resume: req.params.id, job: { $in: recruiterJobIds } });
    if (application) {
      resume = await Resume.findById(req.params.id);
    }
  }

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  res.download(resume.filePath, resume.originalFileName);
});

/**
 * @desc    Delete a resume (file on disk + database record)
 * @route   DELETE /api/resumes/:id
 * @access  Private/Candidate (owner only)
 */
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, candidate: req.user._id });

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  deleteFileFromDisk(resume.filePath);
  await resume.deleteOne();

  res.status(200).json({ success: true, message: 'Resume deleted' });
});

module.exports = { uploadResume, getMyResumes, getResumeById, getResumeAnalysis, downloadResume, deleteResume };
