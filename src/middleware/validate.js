const Joi = require('joi');

// ─────────────────────────────────────────────────────────────────────────────
// validate  — dual-mode validation middleware
//   • API requests (Accept: application/json) → 400 JSON response
//   • SSR requests (form POST)                → flash + redirect back
// ─────────────────────────────────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (!error) return next();

    const messages = error.details.map((d) => d.message).join(', ');

    if (req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, message: messages });
    }

    req.flash('error_msg', messages);
    return res.redirect('back');
};

// ─────────────────────────────────────────────────────────────────────────────
// Joi schemas
// ─────────────────────────────────────────────────────────────────────────────
const schemas = {
    register: Joi.object({
        name:           Joi.string().required().min(3).max(50),
        email:          Joi.string().email().required(),
        password:       Joi.string().min(6).required(),
        city:           Joi.string().allow('').optional(),
        state:          Joi.string().allow('').optional(),
        street:         Joi.string().allow('').optional(),
        zipCode:        Joi.string().allow('').optional(),
        profilePicture: Joi.string().uri().allow('').optional(),
        github:         Joi.string().uri().allow('').optional(),
        linkedin:       Joi.string().uri().allow('').optional(),
        facebook:       Joi.string().uri().allow('').optional(),
        twitter:        Joi.string().uri().allow('').optional(),
        instagram:      Joi.string().uri().allow('').optional(),
        website:        Joi.string().uri().allow('').optional(),
    }),

    login: Joi.object({
        email:    Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    contact: Joi.object({
        name:    Joi.string().required(),
        email:   Joi.string().email().required(),
        subject: Joi.string().required(),
        message: Joi.string().required().min(10),
    }),

    project: Joi.object({
        title:        Joi.string().required().min(3).max(100),
        description:  Joi.string().required().min(10),
        technologies: Joi.string().required(),
        githubUrl:    Joi.string().uri().allow('').optional(),
        liveUrl:      Joi.string().uri().allow('').optional(),
        category:     Joi.string().valid('Web Development', 'Mobile App', 'Web & Mobile App', 'Backend Service & Algorithms').required(),
        featured:     Joi.any().optional(),
    }),

    announcement: Joi.object({
        announcement: Joi.string().required(),
        isActive:     Joi.boolean().optional(),
        endDate:      Joi.date().optional(),
    }),
};

module.exports = { validate, schemas };
