const tokenize = (text) => String(text || '').toLowerCase().match(/[a-z0-9+#.-]+/g) || [];

const createTermFrequency = (text) => {
  const tokens = tokenize(text);
  const counts = new Map();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  const total = tokens.length || 1;
  return Object.fromEntries([...counts.entries()].map(([term, count]) => [term, count / total]));
};

const createTfidfVectors = (documents) => {
  const termFrequencies = documents.map(createTermFrequency);
  const vocabulary = new Set(termFrequencies.flatMap((document) => Object.keys(document)));

  const vectors = termFrequencies.map((document) => {
    const vector = {};
    for (const term of vocabulary) {
      const documentFrequency = termFrequencies.filter((item) => item[term] !== undefined).length;
      const inverseDocumentFrequency = Math.log((documents.length + 1) / (documentFrequency + 1)) + 1;
      vector[term] = (document[term] || 0) * inverseDocumentFrequency;
    }
    return vector;
  });

  return vectors;
};

module.exports = { tokenize, createTermFrequency, createTfidfVectors };