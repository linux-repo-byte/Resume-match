const mammoth = require('mammoth');

/**
 * DOCX Parsing Service
 * --------------------
 * Single responsibility: turn a .docx file on disk into raw text.
 * Mirrors pdfParserService's shape so resumeParserService can treat both
 * parsers interchangeably.
 */

/**
 * Extracts raw text from a DOCX file.
 * @param {string} filePath - absolute path to the .docx file on disk
 * @returns {Promise<string>} raw, unprocessed text extracted from the document
 */
const extractTextFromDOCX = async (filePath) => {
  const { value } = await mammoth.extractRawText({ path: filePath });
  return value || '';
};

module.exports = { extractTextFromDOCX };
