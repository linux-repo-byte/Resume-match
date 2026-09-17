const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { createJob, getJobs, getMyJobs, getJobById, updateJob, updateJobStatus, deleteJob } = require('../controllers/jobController');

const router = express.Router();
router.use(protect, authorize('candidate', 'recruiter'));
router.get('/', getJobs);
router.get('/mine', authorize('recruiter'), getMyJobs);
router.post('/', authorize('recruiter'), createJob);
router.get('/:id', getJobById);
router.put('/:id', authorize('recruiter'), updateJob);
router.patch('/:id/status', authorize('recruiter'), updateJobStatus);
router.delete('/:id', authorize('recruiter'), deleteJob);

module.exports = router;