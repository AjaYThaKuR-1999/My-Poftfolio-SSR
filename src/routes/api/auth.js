const express = require('express');
const { apiRegister, apiLogin, apiGetMe, apiLogout } = require('../../controllers/api/userController');
const { protectApi } = require('../../middleware/auth');

const router = express.Router();

// @route   POST   /api/v1/auth/register
router.post('/register', apiRegister);

// @route   POST   /api/v1/auth/login
router.post('/login', apiLogin);

// @route   GET    /api/v1/auth/me
router.get('/me', protectApi, apiGetMe);

// @route   POST   /api/v1/auth/logout
router.post('/logout', protectApi, apiLogout);

module.exports = router;
