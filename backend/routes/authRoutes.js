const express = require('express');
const { registerUser, loginUser, getMe, updateMe, updateProfilePicture, getProfilePicture } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfilePicture } = require('../services/profilePictureService');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.get('/profile-picture', protect, getProfilePicture);
router.post('/profile-picture', protect, (req, res, next) => {
	uploadProfilePicture.single('profilePicture')(req, res, (error) => {
		if (error) return res.status(400).json({ success: false, message: error.message || 'Profile picture upload failed' });
		next();
	});
}, updateProfilePicture);

module.exports = router;
