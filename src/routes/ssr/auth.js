const express = require('express');
const { ssrRegister, ssrLogin, ssrLogout } = require('../../controllers/ssr/userController');
const { validate, schemas } = require('../../middleware/validate');
const Announcement = require('../../models/Announcement');

const router = express.Router();

// ── View pages ────────────────────────────────────────────────────────────────
router.get('/login', async (req, res, next) => {
    try {
        const announcements = await Announcement.find({ isActive: true, endDate: { $gte: new Date() } }).sort({ createdAt: -1 });
        res.render('auth/login', { title: 'Login', announcements });
    } catch (err) {
        next(err);
    }
});

router.get('/register', async (req, res, next) => {
    try {
        const announcements = await Announcement.find({ isActive: true, endDate: { $gte: new Date() } }).sort({ createdAt: -1 });
        res.render('auth/register', { title: 'Register', announcements });
    } catch (err) {
        next(err);
    }
});

// ── SSR form submissions ──────────────────────────────────────────────────────
router.post('/register', validate(schemas.register), ssrRegister);
router.post('/login',    validate(schemas.login),    ssrLogin);
router.get('/logout',    ssrLogout);

module.exports = router;
