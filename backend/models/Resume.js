const mongoose = require('mongoose');

/**
 * A Resume document represents one uploaded file belonging to a candidate.
 * Large text fields (`rawText`, `extractedText`) default to hidden
 * (`select: false`) so list views (history) stay lightweight — callers
 * must explicitly request them with `.select('+extractedText')` when the
 * candidate actually wants to view a resume's content.
 */
const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // --- File metadata (from fileService / multer) ---
    originalFileName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    filePath: { type: String, required: true }, // absolute path on disk
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true }, // bytes

    // --- Parsing outcome (from resumeParserService) ---
    status: {
      type: String,
      enum: ['processing', 'parsed', 'failed'],
      default: 'processing',
    },
    parseError: { type: String },

    rawText: { type: String, select: false }, // untouched parser output
    extractedText: { type: String, select: false }, // cleaned/preprocessed text

    textStats: {
      characterCount: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      lineCount: { type: Number, default: 0 },
    },

    analysis: { type: mongoose.Schema.Types.Mixed, default: null },
    analysisUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
