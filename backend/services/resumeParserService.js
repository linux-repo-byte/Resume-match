const { extractTextFromPDF } = require('./pdfParserService');
const { extractTextFromDOCX } = require('./docxParserService');
const { cleanText, getTextStats } = require('./textPreprocessingService');

/**
 * Resume Parser Orchestrator
 * --------------------------
 * The only file in this module that knows about *both* file types.
 * Individual parser services stay ignorant of each other; this is the
 * seam where "file type -> parser" routing happens, so adding a new
 * format later (e.g. .txt or .rtf) means adding one entry here plus one
 * new parser service — nothing else changes.
 */

const PARSERS_BY_MIME_TYPE = {
  'application/pdf': extractTextFromPDF,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extractTextFromDOCX,
};

/**
 * Parses a resume file end-to-end: extraction + preprocessing + stats.
 * @param {string} filePath - absolute path to the file on disk
 * @param {string} mimeType - the file's MIME type (from multer/req.file)
 * @returns {Promise<{rawText: string, cleanedText: string, stats: object}>}
 */
const parseResumeFile = async (filePath, mimeType) => {
  const extract = PARSERS_BY_MIME_TYPE[mimeType];

  if (!extract) {
    throw new Error(`Unsupported file type for parsing: ${mimeType}`);
  }

  const rawText = await extract(filePath);

  if (!rawText || !rawText.trim()) {
    throw new Error('No extractable text was found in this file');
  }

  const cleanedText = cleanText(rawText);
  const stats = getTextStats(cleanedText);

  return { rawText, cleanedText, stats };
};

module.exports = { parseResumeFile };
