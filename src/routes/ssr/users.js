const express = require('express');
const { ssrGetUsersList, ssrGetUserDetails } = require('../../controllers/ssr/dashboardController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), ssrGetUsersList);
router.get('/:id', protect, authorize('admin'), ssrGetUserDetails);

module.exports = router;

