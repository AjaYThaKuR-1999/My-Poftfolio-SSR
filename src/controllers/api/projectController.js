const Project = require('../../models/Project');
const { mapProjectForView } = require('../ssr/projectController');

// @desc    Get all active projects (JSON API)
// @route   GET /api/v1/projects
// @access  Public
const apiGetProjects = async (req, res, next) => {
    try {
        const rawProjects = await Project.find({ isActive: true }).sort('order createdAt');
        const projects = rawProjects.map(p => mapProjectForView(p));
        
        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single active project (JSON API)
// @route   GET /api/v1/projects/:id
// @access  Public
const apiGetProject = async (req, res, next) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, isActive: true });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: mapProjectForView(project)
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create project (JSON API, Admin only)
// @route   POST /api/v1/projects
// @access  Private/Admin
const apiCreateProject = async (req, res, next) => {
    try {
        // Add ownerId
        req.body.ownerId = req.user.id;

        // Process technologies (split by comma and trim if it is a string)
        if (req.body.technologies && typeof req.body.technologies === 'string') {
            req.body.technologies = req.body.technologies
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech !== '');
        }

        // Process logo file (single)
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

        return res.status(201).json({
            success: true,
            data: mapProjectForView(project)
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update project (JSON API, Admin only)
// @route   PUT /api/v1/projects/:id
// @access  Private/Admin
const apiUpdateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Process technologies (split by comma and trim if it is a string)
        if (req.body.technologies && typeof req.body.technologies === 'string') {
            req.body.technologies = req.body.technologies
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech !== '');
        }

        // Process logo file (single, optional)
        if (req.files && req.files.logo && req.files.logo.length > 0) {
            req.body.logo = req.files.logo[0].filename;
        }

        // Process images files uploaded from Multer (overwrite existing if new files provided)
        const newImageFiles = req.files && req.files.images ? req.files.images : [];
        if (newImageFiles.length > 0) {
            req.body.images = newImageFiles.map(file => file.filename);
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
        if (req.body.featured !== undefined) {
            req.body.featured = req.body.featured === 'on' || req.body.featured === true || req.body.featured === 'true';
        }

        // Process order field
        if (req.body.order !== undefined) {
            if (req.body.order === '' || req.body.order === null) {
                req.body.order = 0;
            } else {
                req.body.order = Number(req.body.order);
            }
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            data: mapProjectForView(project)
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    apiGetProjects,
    apiGetProject,
    apiCreateProject,
    apiUpdateProject
};
