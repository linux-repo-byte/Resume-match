const MATCHING_WEIGHTS = Object.freeze({
  skill: 0.5,
  similarity: 0.25,
  experience: 0.15,
  education: 0.1,
});

const getMatchingWeights = () => {
  const configured = {
    skill: Number(process.env.MATCH_WEIGHT_SKILL),
    similarity: Number(process.env.MATCH_WEIGHT_SIMILARITY),
    experience: Number(process.env.MATCH_WEIGHT_EXPERIENCE),
    education: Number(process.env.MATCH_WEIGHT_EDUCATION),
  };
  const values = Object.values(configured);
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return MATCHING_WEIGHTS;
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return MATCHING_WEIGHTS;
  return Object.fromEntries(Object.entries(configured).map(([key, value]) => [key, value / total]));
};

module.exports = { MATCHING_WEIGHTS, getMatchingWeights };