const STOP_WORDS = new Set('a an and are as at be by for from in into is it of on or that the their this to was were with your you'.split(' '));

const analyzeKeywords = (text, limit = 20) => {
  const counts = new Map();
  const words = String(text || '').toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) || [];

  for (const word of words) {
    const normalized = word.replace(/[.-]+$/, '');
    if (!normalized || STOP_WORDS.has(normalized)) continue;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));
};

module.exports = { analyzeKeywords };