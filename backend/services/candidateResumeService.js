const User = require('../models/User');
const Resume = require('../models/Resume');
const { analyzeResume } = require('./resumeAnalysisService');

const resolveSelectedResume = async (candidateId) => {
  const user = await User.findById(candidateId).select('selectedResume');
  if (!user) return null;

  const selectText = (query) => query.select('+extractedText');
  let resume = user.selectedResume
    ? await selectText(Resume.findOne({
      _id: user.selectedResume,
      candidate: candidateId,
      status: 'parsed',
    }))
    : null;

  if (!resume) {
    resume = await selectText(Resume.findOne({ candidate: candidateId, status: 'parsed' }).sort({ createdAt: -1 }));
    if (resume) {
      user.selectedResume = resume._id;
      await user.save();
    } else if (user.selectedResume) {
      user.selectedResume = null;
      await user.save();
    }
  }

  return resume ? { resume, analysis: resume.analysis || analyzeResume(resume.extractedText) } : null;
};

const setSelectedResume = async (candidateId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId, status: 'parsed' });
  if (!resume) return null;

  await User.updateOne({ _id: candidateId }, { selectedResume: resume._id });
  return resume;
};

module.exports = { resolveSelectedResume, setSelectedResume };