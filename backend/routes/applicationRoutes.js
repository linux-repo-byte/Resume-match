const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  downloadApplicationResume,
  updateApplicationStatus,
  downloadCoverLetter,
  getCandidateDashboard,
} = require('../controllers/applicationController');

const router = express.Router();
router.use(protect);
router.get('/dashboard', authorize('candidate'), getCandidateDashboard);
router.get('/mine', authorize('candidate'), getMyApplications);
router.post('/job/:jobId', authorize('candidate'), applyToJob);
router.get('/job/:jobId', authorize('recruiter'), getJobApplications);
router.get('/:id/resume', authorize('recruiter'), downloadApplicationResume);
router.get('/:id/cover-letter', authorize('recruiter'), downloadCoverLetter);
router.patch('/:id/status', authorize('recruiter'), updateApplicationStatus);

module.exports = router;