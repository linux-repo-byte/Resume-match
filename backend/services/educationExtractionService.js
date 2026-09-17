const { getNonEmptyLines } = require('./textPreprocessingService');

const SECTION_HEADINGS = /^(education|academic background|qualifications?)$/i;
const OTHER_SECTION = /^(experience|work experience|employment|projects?|skills?|certifications?|summary|profile|contact|awards?)$/i;
const DEGREE_PATTERN = /\b(b\.?(?:sc|a|e|tech)|m\.?(?:sc|a|e|tech)|ph\.?d|bachelor|master|doctorate|associate|diploma|degree)\b/i;

const extractEducation = (text) => {
  const lines = getNonEmptyLines(text);
  const records = [];
  let inSection = false;

  for (const line of lines) {
    if (SECTION_HEADINGS.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && OTHER_SECTION.test(line)) break;
    if (!inSection && !DEGREE_PATTERN.test(line)) continue;
    if (!DEGREE_PATTERN.test(line) && !/(university|college|institute|school)/i.test(line)) continue;

    const year = line.match(/\b(?:19|20)\d{2}\b(?:\s*[-–]\s*(?:19|20)\d{2}|\s*[-–]\s*present)?/i)?.[0] || '';
    const degree = line.match(DEGREE_PATTERN)?.[0] || '';
    const institution = line.replace(year, '').replace(degree, '').replace(/[|,\-–]+/g, ' ').trim();
    records.push({ degree: degree || null, institution: institution || null, period: year || null });
  }

  return records.filter((record, index, all) => all.findIndex((item) => JSON.stringify(item) === JSON.stringify(record)) === index);
};

module.exports = { extractEducation };