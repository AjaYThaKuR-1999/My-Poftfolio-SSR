const express = require('express');
const { getProjects, getProject, createProject, getNewProjectForm, getEditProjectForm, updateProject } = require('../../controllers/ssr/projectController');
const { protect, authorize } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validate');
const upload = require('../../utils/multer');

const router = express.Router();

router.get('/', getProjects);
router.get('/new', protect, authorize('admin'), getNewProjectForm);
router.get('/:id', getProject);
router.get('/:id/edit', protect, authorize('admin'), getEditProjectForm);

// Admin only routes
router.post('/', protect, authorize('admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'images', maxCount: 8 }]), validate(schemas.project), createProject);
router.put('/:id', protect, authorize('admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'images', maxCount: 8 }]), validate(schemas.project), updateProject);

module.exports = router;
