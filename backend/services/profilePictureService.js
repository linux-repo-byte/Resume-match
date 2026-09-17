const multer = require('multer');

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) return callback(null, true);
    callback(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'));
  },
});

module.exports = { uploadProfilePicture };
