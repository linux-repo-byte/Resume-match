const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getStats, listUsers, createUser, updateUser, deleteUser,
  listJobs, updateJob, deleteJob,
  listResumes, deleteResume,
  listApplications, updateApplication, deleteApplication,
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.get('/users', listUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/jobs', listJobs);
router.patch('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/resumes', listResumes);
router.delete('/resumes/:id', deleteResume);
router.get('/applications', listApplications);
router.patch('/applications/:id', updateApplication);
router.delete('/applications/:id', deleteApplication);

module.exports = router;
