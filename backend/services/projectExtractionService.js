const { getNonEmptyLines } = require('./textPreprocessingService');

const PROJECT_SECTION = /^(projects?|personal projects|academic projects)$/i;
const SECTION_HEADING = /^(education|academic background|experience|work experience|employment|skills?|certifications?|summary|profile|contact|awards?)$/i;

const extractProjects = (text) => {
  const lines = getNonEmptyLines(text);
  const projects = [];
  let inSection = false;
  let current = null;

  const flush = () => {
    if (current) projects.push(current);
    current = null;
  };

  for (const line of lines) {
    if (PROJECT_SECTION.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && SECTION_HEADING.test(line)) {
      flush();
      break;
    }
    if (!inSection) continue;

    if (!line.startsWith('-') && !line.startsWith('*') && line.length < 100) {
      flush();
      current = { name: line, description: [] };
    } else if (current) {
      current.description.push(line.replace(/^[-*•]\s*/, ''));
    }
  }
  flush();

  return projects.map((project) => ({ name: project.name, description: project.description.join(' ') || null }));
};

module.exports = { extractProjects };