const express = require('express');
const { apiGetProjects, apiGetProject, apiCreateProject, apiUpdateProject } = require('../../controllers/api/projectController');
const { protectApi, authorize } = require('../../middleware/auth');
const { validate, schemas } = require('../../middleware/validate');
const upload = require('../../utils/multer');

const router = express.Router();

router.get('/', apiGetProjects);
router.get('/:id', apiGetProject);

// Admin only routes
router.post('/', protectApi, authorize('admin'), upload.array('images', 5), validate(schemas.project), apiCreateProject);
router.put('/:id', protectApi, authorize('admin'), upload.array('images', 5), validate(schemas.project), apiUpdateProject);

module.exports = router;
