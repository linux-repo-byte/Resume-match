const { getNonEmptyLines } = require('./textPreprocessingService');

const EXPERIENCE_SECTION = /^(experience|work experience|employment history|professional experience)$/i;
const SECTION_HEADING = /^(education|academic background|projects?|skills?|certifications?|summary|profile|contact|awards?|achievements?)$/i;
const PERIOD_PATTERN = /\b(?:19|20)\d{2}\b\s*(?:[-–]|to)\s*(?:(?:19|20)\d{2}|present|current)\b/i;

const extractExperience = (text) => {
  const lines = getNonEmptyLines(text);
  const records = [];
  let inSection = false;
  let current = null;

  const flush = () => {
    if (current) records.push(current);
    current = null;
  };

  for (const line of lines) {
    if (EXPERIENCE_SECTION.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && SECTION_HEADING.test(line)) {
      flush();
      break;
    }
    if (!inSection && !PERIOD_PATTERN.test(line)) continue;

    if (PERIOD_PATTERN.test(line) || (!line.startsWith('-') && line.length < 100 && current)) {
      flush();
      const period = line.match(PERIOD_PATTERN)?.[0] || null;
      const titleAndCompany = line.replace(period || '', '').replace(/[|,]+/g, ' | ').split('|').map((part) => part.trim()).filter(Boolean);
      current = {
        title: titleAndCompany[0] || line,
        company: titleAndCompany[1] || null,
        period,
        description: [],
      };
      continue;
    }

    if (current) current.description.push(line.replace(/^[-*•]\s*/, ''));
  }
  flush();

  return records.map((record) => ({ ...record, description: record.description.join(' ') || null }));
};

module.exports = { extractExperience };