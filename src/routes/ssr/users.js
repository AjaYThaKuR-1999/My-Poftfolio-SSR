const express = require('express');
const { ssrGetUsersList } = require('../../controllers/dashboardController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), ssrGetUsersList);

module.exports = router;
