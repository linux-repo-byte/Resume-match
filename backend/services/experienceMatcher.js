const extractYear = (value) => Number(String(value || '').match(/(?:19|20)\d{2}/)?.[0] || 0);

const estimateExperienceYears = (experience = []) => experience.reduce((total, item) => {
  const start = extractYear(item.period);
  const endMatch = String(item.period || '').match(/(?:19|20)\d{2}\s*[-–to]+\s*((?:19|20)\d{2})/i);
  const end = endMatch ? Number(endMatch[1]) : new Date().getFullYear();
  return total + (start ? Math.max(0, end - start) : 0);
}, 0);

const matchExperience = (experience = [], requiredYears = 0) => {
  const candidateYears = estimateExperienceYears(experience);
  if (!requiredYears) return { score: 100, candidateYears };
  return { score: Math.min(100, (candidateYears / requiredYears) * 100), candidateYears };
};

module.exports = { estimateExperienceYears, matchExperience };