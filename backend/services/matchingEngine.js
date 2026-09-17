const { createTfidfVectors } = require('./tfidf');
const { cosineSimilarity } = require('./cosineSimilarity');
const { matchSkills } = require('./skillMatcher');
const { matchExperience } = require('./experienceMatcher');
const { matchEducation } = require('./educationMatcher');
const { getMatchingWeights } = require('../config/matchingConfig');

const jobText = (job) => [
  job.title,
  job.description,
  job.requiredSkills?.map((skill) => skill.name || skill).join(' '),
  job.preferredSkills?.map((skill) => skill.name || skill).join(' '),
  job.educationRequirement,
].filter(Boolean).join(' ');

const matchResumeToJob = ({ resumeText = '', resumeAnalysis = {}, job, weights = getMatchingWeights() }) => {
  const [resumeVector, jobVector] = createTfidfVectors([resumeText, jobText(job)]);
  const skillMatch = matchSkills(resumeAnalysis.skills, job);
  const experienceMatch = matchExperience(resumeAnalysis.experience, job.requiredExperience);
  const educationScore = matchEducation(resumeAnalysis.education, job.educationRequirement);
  const similarityScore = cosineSimilarity(resumeVector, jobVector) * 100;
  const finalScore = (skillMatch.score * weights.skill) +
    (similarityScore * weights.similarity) +
    (experienceMatch.score * weights.experience) +
    (educationScore * weights.education);

  return {
    skillScore: Math.round(skillMatch.score),
    similarityScore: Math.round(similarityScore),
    experienceScore: Math.round(experienceMatch.score),
    educationScore: Math.round(educationScore),
    finalScore: Math.round(finalScore),
    matchedSkills: skillMatch.matchedSkills,
    missingSkills: skillMatch.missingSkills,
  };
};

module.exports = { matchResumeToJob, jobText };