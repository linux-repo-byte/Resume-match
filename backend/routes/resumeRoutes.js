const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../services/fileService');
const {
  uploadResume,
  getMyResumes,
  getResumeById,
  getResumeAnalysis,
  downloadResume,
  deleteResume,
} = require('../controllers/resumeController');

const router = express.Router();

router.use(protect);

/**
 * Wraps multer's `upload.single()` so file-type/size rejections come back
 * as a clean 400 JSON response instead of falling through to the generic
 * 500 error handler (multer's own errors don't set res.statusCode).
 */
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }
    next();
  });
};

router.post('/upload', authorize('candidate'), handleUpload, uploadResume);
router.get('/my', authorize('candidate'), getMyResumes);
router.get('/:id/analysis', authorize('candidate'), getResumeAnalysis);
router.get('/:id', authorize('candidate'), getResumeById);
router.get('/:id/download', authorize('candidate', 'recruiter'), downloadResume);
router.delete('/:id', authorize('candidate'), deleteResume);

module.exports = router;
