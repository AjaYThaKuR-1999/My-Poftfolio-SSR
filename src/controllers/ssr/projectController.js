const Project = require('../../models/Project');

// Helper to map project structure for views
const mapProjectForView = (project) => {
    if (!project) return null;
    const p = project.toObject ? project.toObject() : { ...project };
    let rawImage = (p.images && p.images[0]) || 'no-photo.jpg';
    if (rawImage && !rawImage.startsWith('http') && !rawImage.startsWith('/')) {
        p.image = `/uploads/${rawImage}`;
    } else {
        p.image = rawImage;
    }
    p.githubUrl = p.gitHubRepoLink || '';
    p.liveUrl = (p.liveUrls && p.liveUrls[0] && p.liveUrls[0].link) || '';
    return p;
};

exports.mapProjectForView = mapProjectForView;

// @desc    Get all projects
// @route   GET /projects
// @access  Public
exports.getProjects = async (req, res, next) => {
    try {
        const rawProjects = await Project.find({ isActive: true }).sort('-createdAt');
        const projects = rawProjects.map(p => mapProjectForView(p));
        res.render('projects/index', {
            title: 'Our Projects',
            projects
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single project
// @route   GET /projects/:id
// @access  Public
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, isActive: true });

        if (!project) {
            return res.status(404).render('404', { title: 'Project Not Found' });
        }

        res.render('projects/show', {
            title: project.title,
            project: mapProjectForView(project)
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Show add project form (Admin only)
// @route   GET /projects/new
// @access  Private/Admin
exports.getNewProjectForm = (req, res) => {
    res.render('projects/new', {
        title: 'Add New Project'
    });
};

// @desc    Create project (Admin only)
// @route   POST /projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
    try {
        // Add ownerId to req.body
        req.body.ownerId = req.user.id;

        // Process technologies (split by comma and trim)
        if (req.body.technologies && typeof req.body.technologies === 'string') {
            req.body.technologies = req.body.technologies
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech !== '');
        }

        // Process images files uploaded from Multer
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.filename);
        } else {
            req.body.images = ['no-photo.jpg'];
        }

        // Map form githubUrl to gitHubRepoLink
        if (req.body.githubUrl) {
            req.body.gitHubRepoLink = req.body.githubUrl;
        }

        // Map form liveUrl to liveUrls array
        if (req.body.liveUrl) {
            req.body.liveUrls = [{ label: 'Live Demo', link: req.body.liveUrl }];
        }

        // Process featured checkbox
        req.body.featured = req.body.featured === 'on' || req.body.featured === true || req.body.featured === 'true';

        // Default isActive to true
        req.body.isActive = true;

        const project = await Project.create(req.body);

        req.flash('success_msg', 'Project created successfully');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// @desc    Show edit project form (Admin only)
// @route   GET /projects/:id/edit
// @access  Private/Admin
exports.getEditProjectForm = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).render('404', { title: 'Project Not Found' });
        }

        const mappedProject = mapProjectForView(project);
        // Format technologies array back to comma-separated string for edit input value
        mappedProject.technologiesRaw = project.technologies ? project.technologies.join(', ') : '';
        // Extract raw image filename if possible
        mappedProject.rawImageFilename = (project.images && project.images[0]) || 'no-photo.jpg';

        res.render('projects/edit', {
            title: `Edit Project - ${project.title}`,
            project: mappedProject
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update project (Admin only)
// @route   PUT /projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).render('404', { title: 'Project Not Found' });
        }

        // Process technologies (split by comma and trim)
        if (req.body.technologies && typeof req.body.technologies === 'string') {
            req.body.technologies = req.body.technologies
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech !== '');
        }

        // Process images files uploaded from Multer (overwrite existing if new files provided)
        if (req.files && req.files.length > 0) {
            req.body.images = req.files.map(file => file.filename);
        }

        // Map form githubUrl to gitHubRepoLink
        if (req.body.githubUrl !== undefined) {
            req.body.gitHubRepoLink = req.body.githubUrl || '';
        }

        // Map form liveUrl to liveUrls array
        if (req.body.liveUrl !== undefined) {
            if (req.body.liveUrl) {
                req.body.liveUrls = [{ label: 'Live Demo', link: req.body.liveUrl }];
            } else {
                req.body.liveUrls = [];
            }
        }

        // Process featured checkbox
        req.body.featured = req.body.featured === 'on' || req.body.featured === true || req.body.featured === 'true';

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        req.flash('success_msg', 'Project updated successfully');
        res.redirect(`/projects/${project._id}`);
    } catch (err) {
        next(err);
    }
};
