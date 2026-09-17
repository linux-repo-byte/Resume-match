const { cleanText } = require('./textPreprocessingService');
const { extractSkills } = require('./skillExtractionService');
const { extractEducation } = require('./educationExtractionService');
const { extractExperience } = require('./experienceExtractionService');
const { extractProjects } = require('./projectExtractionService');
const { analyzeKeywords } = require('./keywordAnalysisService');
const { scoreResume } = require('./resumeScoringService');

const analyzeResume = (text, options = {}) => {
  const normalizedText = cleanText(text);
  const skills = extractSkills(normalizedText, options.skillDataset);
  const education = extractEducation(normalizedText);
  const experience = extractExperience(normalizedText);
  const projects = extractProjects(normalizedText);
  const keywords = analyzeKeywords(normalizedText);

  return {
    skills,
    education,
    experience,
    projects,
    keywords,
    resumeScore: scoreResume({ text: normalizedText, skills, education, experience, projects, keywords }),
  };
};

module.exports = { analyzeResume };