/**
 * Text Preprocessing Service
 * --------------------------
 * Takes whatever raw text a parser produced (PDF or DOCX) and normalizes it
 * into a consistent shape: predictable line endings, no runs of blank
 * lines, no trailing whitespace. This is deliberately kept "dumb" —
 * no skill extraction, no section detection, no NLP — so that the next
 * phase (skill extraction / job matching) can build on top of clean,
 * predictable text without this service needing to change.
 */

/**
 * Normalizes raw extracted text:
 * - unifies line endings to \n
 * - converts tabs to single spaces
 * - trims trailing whitespace on each line
 * - collapses runs of multiple blank lines into one
 * - trims leading/trailing blank lines from the whole document
 */
const cleanText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ ]{2,}/g, ' ').trim());

  const collapsed = [];
  for (const line of lines) {
    const prevIsBlank = collapsed.length > 0 && collapsed[collapsed.length - 1] === '';
    if (line === '' && prevIsBlank) continue; // skip repeated blank lines
    collapsed.push(line);
  }

  return collapsed.join('\n').trim();
};

/**
 * Splits cleaned text into non-empty, trimmed lines. Exposed separately
 * because future section/skill detection will likely want to iterate
 * line-by-line rather than re-deriving this from raw text each time.
 */
const getNonEmptyLines = (cleanedText) => {
  if (!cleanedText) return [];
  return cleanedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

/**
 * Computes lightweight stats about the cleaned text. These are stored
 * alongside the resume for quick display in the UI (e.g. "412 words")
 * without re-processing the full text on every page load.
 */
const getTextStats = (cleanedText) => {
  const text = cleanedText || '';
  const words = text.split(/\s+/).filter(Boolean);
  const lines = getNonEmptyLines(text);

  return {
    characterCount: text.length,
    wordCount: words.length,
    lineCount: lines.length,
  };
};

module.exports = { cleanText, getNonEmptyLines, getTextStats };
