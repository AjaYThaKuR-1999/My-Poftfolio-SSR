const express = require('express');
const router = express.Router();

const { submitConnect } = require('../../controllers/contactController');
const { validate, schemas } = require('../../middleware/validate');
const { protect } = require('../../middleware/auth');

const Project = require('../../models/Project');
const { mapProjectForView } = require('../../controllers/ssr/projectController');

// @desc    Home Page
// @route   GET /
router.get('/', async (req, res, next) => {
    try {
        // Only show featured projects — max 6 fetched (5 cards + 1 'View All' slot)
        const rawProjects = await Project.find({ isActive: true, featured: true })
            .sort('order createdAt')
            .limit(6);

        const featuredProjects = rawProjects.map(p => mapProjectForView(p));
        res.render('index', {
            title: 'Backend Developer Portfolio',
            description: 'Professional Backend Software Developer Portfolio showcasing projects and skills.',
            featuredProjects
        });
    } catch (err) {
        next(err);
    }
});

// @desc    General Connect Submission
// @route   POST /connect
router.post('/connect', validate(schemas.contact), submitConnect);

module.exports = router;
