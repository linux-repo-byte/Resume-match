const cosineSimilarity = (left = {}, right = {}) => {
  const terms = new Set([...Object.keys(left), ...Object.keys(right)]);
  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (const term of terms) {
    const leftValue = left[term] || 0;
    const rightValue = right[term] || 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue ** 2;
    rightMagnitude += rightValue ** 2;
  }

  if (!leftMagnitude || !rightMagnitude) return 0;
  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
};

module.exports = { cosineSimilarity };