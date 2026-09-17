const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * PDF Parsing Service
 * -------------------
 * Single responsibility: turn a .pdf file on disk into raw text.
 * No cleanup/normalization happens here — that's textPreprocessingService's job —
 * and no knowledge of DOCX, HTTP, or the database lives in this file.
 */

/**
 * Extracts raw text from a PDF file.
 * @param {string} filePath - absolute path to the .pdf file on disk
 * @returns {Promise<string>} raw, unprocessed text extracted from the PDF
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const { text } = await pdfParse(dataBuffer);
  return text || '';
};

module.exports = { extractTextFromPDF };
