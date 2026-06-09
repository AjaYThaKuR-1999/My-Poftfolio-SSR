const express = require('express');
const router = express.Router();

// ── SSR Routes ────────────────────────────────────────────────────────────────
router.use('/',          require('./ssr/index'));
router.use('/auth',      require('./ssr/auth'));
router.use('/projects',  require('./ssr/projects'));
router.use('/dashboard', require('./ssr/dashboard'));

// ── API Routes ────────────────────────────────────────────────────────────────
router.use('/api/v1/auth', require('./api/auth'));
router.use('/api/v1/projects', require('./api/projects'));
router.use('/api/v1/announcements', require('./api/announcements'));

module.exports = router;
