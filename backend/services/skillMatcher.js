const normalize = (value) => String(value || '').trim().toLowerCase();

const asRequirements = (skills, defaultWeight) => (skills || []).map((skill) => {
  if (typeof skill === 'string') return { name: skill, weight: defaultWeight };
  return { name: skill.name, weight: Number.isFinite(skill.weight) ? skill.weight : defaultWeight };
});

const matchSkills = (resumeSkills = [], job = {}) => {
  const candidateNames = new Set(resumeSkills.map((skill) => normalize(skill.name || skill)));
  const required = asRequirements(job.requiredSkills, 2);
  const preferred = asRequirements(job.preferredSkills, 1);
  const allRequirements = [...required, ...preferred];
  const totalWeight = allRequirements.reduce((sum, skill) => sum + skill.weight, 0);
  const matched = allRequirements.filter((skill) => candidateNames.has(normalize(skill.name)));
  const matchedSkills = [...new Set(matched.map((skill) => skill.name))];
  const missingSkills = [...new Set(required.filter((skill) => !candidateNames.has(normalize(skill.name))).map((skill) => skill.name))];

  return {
    score: totalWeight ? (matched.reduce((sum, skill) => sum + skill.weight, 0) / totalWeight) * 100 : 100,
    matchedSkills,
    missingSkills,
  };
};

module.exports = { matchSkills };