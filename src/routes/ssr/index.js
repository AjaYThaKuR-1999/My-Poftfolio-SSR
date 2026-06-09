const express = require('express');
const router = express.Router();

const { submitRequest, submitConnect } = require('../../controllers/contactController');
const { validate, schemas } = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');

const Project = require('../../models/Project');
const { mapProjectForView } = require('../../controllers/ssr/projectController');

// @desc    Home Page
// @route   GET /
router.get('/', async (req, res, next) => {
    try {
        // Query featured projects first
        let rawProjects = await Project.find({ isActive: true, featured: true }).sort({ createdAt: -1 }).limit(6);
        
        // Fallback: if there are fewer than 6 featured projects, fill the rest with any active projects
        if (rawProjects.length < 6) {
            const featuredIds = rawProjects.map(p => p._id);
            const additionalProjects = await Project.find({ 
                isActive: true, 
                _id: { $nin: featuredIds } 
            }).sort({ createdAt: -1 }).limit(6 - rawProjects.length);
            
            rawProjects = [...rawProjects, ...additionalProjects];
        }

        const projects = rawProjects.map(p => mapProjectForView(p));
        res.render('index', {
            title: 'Backend Developer Portfolio',
            description: 'Professional Backend Software Developer Portfolio showcasing projects and skills.',
            projects
        });
    } catch (err) {
        next(err);
    }
});

// @desc    Contact Submission
// @route   POST /contact
router.post('/contact', protect, validate(schemas.contact), submitRequest);

// @desc    General Connect Submission
// @route   POST /connect
router.post('/connect', validate(schemas.contact), submitConnect);

module.exports = router;
