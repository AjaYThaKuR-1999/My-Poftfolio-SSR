const express = require('express');
const { apiRegister, apiLogin, apiGetMe, apiLogout, apiGetUsers, apiUpdateMe } = require('../../controllers/api/userController');
const { protectApi, authorize } = require('../../middleware/auth');
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

// @route   POST   /api/v1/auth/register
router.post('/register', upload.single('profilePicture'), handleProfilePictureUpload, validate(schemas.register), apiRegister);

// @route   POST   /api/v1/auth/login
router.post('/login', apiLogin);

// @route   GET    /api/v1/auth/me
router.get('/me', protectApi, apiGetMe);

// @route   PUT    /api/v1/auth/me
router.put('/me', protectApi, upload.single('profilePicture'), handleProfilePictureUpload, validate(schemas.updateProfile), apiUpdateMe);

// @route   POST   /api/v1/auth/logout
router.post('/logout', protectApi, apiLogout);

// @route   GET    /api/v1/auth/users
router.get('/users', protectApi, authorize('admin'), apiGetUsers);

module.exports = router;
