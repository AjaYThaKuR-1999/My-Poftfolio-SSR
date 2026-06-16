const Project = require('../../models/Project');

// Helper to map project structure for views
const mapProjectForView = (project) => {
    if (!project) return null;
    const p = project.toObject ? project.toObject() : { ...project };
    // Map primary image
    let rawImage = (p.images && p.images[0]) || 'no-photo.jpg';
    if (rawImage && !rawImage.startsWith('http') && !rawImage.startsWith('/')) {
        p.image = `/uploads/${rawImage}`;
    } else {
        p.image = rawImage;
    }
    // Map logo
    if (p.logo && p.logo !== '') {
        p.logoUrl = p.logo.startsWith('http') || p.logo.startsWith('/') ? p.logo : `/uploads/${p.logo}`;
    } else {
        p.logoUrl = '';
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
        const rawProjects = await Project.find({ isActive: true }).sort('order createdAt');
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

        // Process logo file (single image)
        if (req.files && req.files.logo && req.files.logo.length > 0) {
            req.body.logo = req.files.logo[0].filename;
        }

        // Process images files uploaded from Multer (upload.fields)
        const imageFiles = req.files && req.files.images ? req.files.images : [];
        if (imageFiles.length > 0) {
            req.body.images = imageFiles.map(file => file.filename);
        } else if (!req.body.images || (Array.isArray(req.body.images) && req.body.images.length === 0)) {
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

        // Process order field
        if (req.body.order === '' || req.body.order === null || req.body.order === undefined) {
            req.body.order = 0;
        } else {
            req.body.order = Number(req.body.order);
        }

        // Default isActive to true
        req.body.isActive = true;

        const project = await Project.create(req.body);

        req.flash('success_msg', 'Project created successfully');
        res.redirect('/projects');
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

        // Process logo file (single, optional — only update if new logo uploaded)
        if (req.files && req.files.logo && req.files.logo.length > 0) {
            req.body.logo = req.files.logo[0].filename;
        }

        // Process images files (combine kept existingImages and newly uploaded files)
        let images = [];
        if (req.body.existingImages) {
            images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }
        const newImageFiles = req.files && req.files.images ? req.files.images : [];
        if (newImageFiles.length > 0) {
            const newImages = newImageFiles.map(file => file.filename);
            images = [...images, ...newImages];
        }
        if (images.length === 0) {
            images = ['no-photo.jpg'];
        }
        req.body.images = images;

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

        // Process order field
        if (req.body.order === '' || req.body.order === null || req.body.order === undefined) {
            req.body.order = 0;
        } else {
            req.body.order = Number(req.body.order);
        }

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
