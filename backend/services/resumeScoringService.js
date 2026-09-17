const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const scoreResume = ({ text, skills, education, experience, projects, keywords }) => {
  const wordCount = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  const completeness = [education.length > 0, experience.length > 0, projects.length > 0].filter(Boolean).length;
  const score =
    Math.min(skills.length, 10) * 5 +
    completeness * 10 +
    Math.min(experience.length, 3) * 5 +
    Math.min(projects.length, 3) * 3 +
    Math.min(keywords.length, 10) * 1 +
    (wordCount >= 150 ? 5 : wordCount >= 75 ? 3 : 0);

  return clamp(Math.round(score), 0, 100);
};

module.exports = { scoreResume };