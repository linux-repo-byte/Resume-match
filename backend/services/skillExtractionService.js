const defaultSkillDataset = require('../config/skillDataset');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractSkills = (text, skillDataset = defaultSkillDataset) => {
  const source = String(text || '');

  return skillDataset.reduce((skills, skill) => {
    const aliases = skill.aliases?.length ? skill.aliases : [skill.name];
    const occurrences = aliases.reduce((total, alias) => {
      const expression = new RegExp(`(?<![\\w+#])${escapeRegex(alias)}(?![\\w+#])`, 'gi');
      return total + (source.match(expression) || []).length;
    }, 0);

    if (occurrences > 0) {
      skills.push({ name: skill.name, category: skill.category, occurrences });
    }
    return skills;
  }, []);
};

module.exports = { extractSkills };