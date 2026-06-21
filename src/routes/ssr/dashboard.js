const express = require('express');
const { getDashboard, ssrUpdateProfile, ssrCreateAnnouncement, ssrUpdateAnnouncement, ssrDeleteAnnouncement, ssrUploadResume, ssrDownloadResume } = require('../../controllers/ssr/dashboardController');
const { protect, authorize } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validate');
const upload = require('../../utils/multer');

const router = express.Router();

// Helper middleware to handle profile picture file input mapping
const handleProfilePictureUpload = (req, res, next) => {
    if (req.file) {
        req.body.profilePicture = `/uploads/${req.file.filename}`;
    }
    next();
};

// Helper middleware to handle resume file input mapping
const handleResumeUpload = (req, res, next) => {
    if (req.file) {
        req.body.resume = `/uploads/${req.file.filename}`;
    }
    next();
};

router.get('/', protect, getDashboard);
router.get('/resume/download', protect, ssrDownloadResume);
router.put('/profile', protect, upload.single('profilePicture'), handleProfilePictureUpload, validate(schemas.updateProfile), ssrUpdateProfile);
router.post('/resume', protect, authorize('admin'), upload.document.single('resume'), handleResumeUpload, ssrUploadResume);

// Announcement Management (Admin Only)
router.post('/announcements', protect, authorize('admin'), validate(schemas.announcement), ssrCreateAnnouncement);
router.put('/announcements/:id', protect, authorize('admin'), validate(schemas.announcement), ssrUpdateAnnouncement);
router.delete('/announcements/:id', protect, authorize('admin'), ssrDeleteAnnouncement);

module.exports = router;
