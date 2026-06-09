const express = require('express');
const {
    listAnnouncements,
    listUserAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../../controllers/api/announcementsController');
const { protectApi, authorize } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

router.get('/', listAnnouncements);
router.get('/user', protectApi, listUserAnnouncements);

// Admin-only routes
router.post('/', protectApi, authorize('admin'), validate(schemas.announcement), createAnnouncement);
router.put('/:id', protectApi, authorize('admin'), validate(schemas.announcement), updateAnnouncement);
router.delete('/:id', protectApi, authorize('admin'), deleteAnnouncement);

module.exports = router;
