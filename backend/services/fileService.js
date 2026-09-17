const fs = require('fs');
const path = require('path');
const multer = require('multer');

/**
 * File Handling Service
 * ----------------------
 * Owns everything related to *storing bytes on disk*: where resumes live,
 * how they're named, which file types/sizes are accepted, and how to
 * remove them later. Parsing the file's content is a separate concern —
 * see pdfParserService.js / docxParserService.js.
 */

// Resumes are stored under backend/uploads/resumes/<candidateId>/<uniqueName>.
// Kept out of any web-servable static path — files are only ever streamed
// back through an authenticated, ownership-checked controller route.
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'resumes');

// Maps accepted MIME types to a short, internal file-type tag used
// throughout the app (stored on the Resume model, used to pick a parser).
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ensureUploadDirForUser = (userId) => {
  const dir = path.join(UPLOAD_ROOT, String(userId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dir = ensureUploadDirForUser(req.user._id);
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] || path.extname(file.originalname).replace('.', '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    return cb(null, true);
  }
  cb(new Error('Only PDF and DOCX files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

/**
 * Deletes a file from disk if it exists. Safe to call on a path that's
 * already gone — used both for cleanup on delete and for rollback if
 * parsing/DB save fails after the file was written.
 */
const deleteFileFromDisk = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  upload,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  deleteFileFromDisk,
  UPLOAD_ROOT,
};
