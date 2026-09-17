const EDUCATION_LEVELS = ['high school', 'diploma', 'associate', 'bachelor', 'master', 'doctorate', 'phd'];

const levelOf = (value) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('phd') || normalized.includes('doctor')) return 6;
  if (normalized.includes('master') || /\bm\.?s|\bm\.?a|\bm\.?e|\bm\.?tech\b/i.test(normalized)) return 5;
  if (normalized.includes('bachelor') || /\bb\.?s|\bb\.?a|\bb\.?e|\bb\.?tech\b/i.test(normalized)) return 4;
  return EDUCATION_LEVELS.findIndex((level) => normalized.includes(level));
};

const matchEducation = (education = [], requirement = '') => {
  if (!requirement || !String(requirement).trim()) return 100;
  const requiredLevel = levelOf(requirement);
  const candidateText = education.map((item) => `${item.degree || ''} ${item.institution || ''}`).join(' ').toLowerCase();
  if (requiredLevel >= 0 && education.some((item) => levelOf(`${item.degree || ''} ${item.institution || ''}`) >= requiredLevel)) return 100;
  const words = String(requirement).toLowerCase().match(/[a-z]+/g) || [];
  const matches = words.filter((word) => candidateText.includes(word)).length;
  return words.length ? (matches / words.length) * 100 : 0;
};

module.exports = { matchEducation };