const Joi = require('joi');

// ─────────────────────────────────────────────────────────────────────────────
// validate  — dual-mode validation middleware
//   • API requests (Accept: application/json) → 400 JSON response
//   • SSR requests (form POST)                → flash + redirect back
// ─────────────────────────────────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            const val = req.body[key];
            if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
                try {
                    req.body[key] = JSON.parse(val);
                } catch (e) {
                    // Fail silently and let Joi validate the original string
                }
            }
        }
        
        // Clean up empty liveUrls if present
        if (req.body.liveUrls) {
            if (Array.isArray(req.body.liveUrls)) {
                req.body.liveUrls = req.body.liveUrls.filter(item => item && item.link && item.link.trim() !== '');
                if (req.body.liveUrls.length === 0) {
                    req.body.liveUrls = [];
                }
            } else if (typeof req.body.liveUrls === 'object') {
                const arrayRepresentation = Object.values(req.body.liveUrls)
                    .filter(item => item && item.link && item.link.trim() !== '');
                if (arrayRepresentation.length > 0) {
                    req.body.liveUrls = arrayRepresentation;
                } else {
                    req.body.liveUrls = [];
                }
            }
        }
    }
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (!error) return next();

    const messages = error.details.map((d) => d.message).join(', ');

    if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: messages });
    }

    req.flash('error_msg', messages);
    console.log('[DEBUG] Validation failed. Request headers:', req.headers);
    console.log('[DEBUG] Referer header value:', req.header('Referer'));
    const backURL = req.header('Referer') || '/projects';
    console.log('[DEBUG] Redirecting to backURL:', backURL);
    return res.redirect(backURL);
};

// ─────────────────────────────────────────────────────────────────────────────
// Joi schemas
// ─────────────────────────────────────────────────────────────────────────────
const schemas = {
    register: Joi.object({
        name: Joi.string().required().min(3).max(50),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        location: Joi.string().allow('').optional(),
        bio: Joi.string().max(250).allow('').optional(),
        userType: Joi.string().valid('developer', 'recruiter', 'project_provider', 'hobbyist', 'other').required(),
        seeking: Joi.string().valid('hiring_talent', 'freelance_work', 'collaboration', 'networking', 'exploration', 'other').required(),
        profilePicture: Joi.string().allow('').optional(),
        github: Joi.string().uri().allow('').optional(),
        linkedin: Joi.string().uri().allow('').optional(),
        facebook: Joi.string().uri().allow('').optional(),
        twitter: Joi.string().uri().allow('').optional(),
        instagram: Joi.string().uri().allow('').optional(),
        website: Joi.string().uri().allow('').optional(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    project: Joi.object({
        title: Joi.string().required().min(3).max(100),
        description: Joi.string().required().min(10),
        technologies: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
        githubUrl: Joi.string().uri().allow('').optional(),
        liveUrl: Joi.string().uri().allow('').optional(),
        gitHubRepoLink: Joi.string().uri().allow('').optional(),
        liveUrls: Joi.array().items(Joi.object({
            label: Joi.string().allow('').optional(),
            link: Joi.string().uri().required()
        })).optional(),
        logo: Joi.string().allow('').optional(),
        images: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        existingImages: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
        category: Joi.string().valid('Web Development', 'Mobile App', 'Web & Mobile App', 'Backend Service & Algorithms').required(),
        projectType: Joi.string().valid('personal', 'professional').default('personal').optional(),
        featured: Joi.any().optional(),
        order: Joi.number().integer().allow(null, '').optional(),
        isActive: Joi.boolean().optional(),
        ownerId: Joi.string().optional()
    }),

    announcement: Joi.object({
        announcement: Joi.string().required(),
        isActive: Joi.boolean().optional(),
        endDate: Joi.date().optional(),
        type: Joi.string().valid('community', 'Resume', 'system update').optional()
    }),

    updateProfile: Joi.object({
        name: Joi.string().min(3).max(50).optional(),
        email: Joi.string().email().optional(),
        location: Joi.string().allow('').optional(),
        bio: Joi.string().max(250).allow('').optional(),
        userType: Joi.string().valid('developer', 'recruiter', 'project_provider', 'hobbyist', 'other').optional(),
        seeking: Joi.string().valid('hiring_talent', 'freelance_work', 'collaboration', 'networking', 'exploration', 'other').optional(),
        profilePicture: Joi.string().allow('').optional(),
        github: Joi.string().uri().allow('').optional(),
        linkedin: Joi.string().uri().allow('').optional(),
        facebook: Joi.string().uri().allow('').optional(),
        twitter: Joi.string().uri().allow('').optional(),
        instagram: Joi.string().uri().allow('').optional(),
        website: Joi.string().uri().allow('').optional(),
    }),
};

module.exports = { validate, schemas };
