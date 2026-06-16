const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    projectType: {
        type: String,
        enum: ['personal', 'professional'],
        required: true
    },
    category: {
        type: String,
        enum: ['Web Development', 'Mobile App', 'Web & Mobile App', 'Backend Service & Algorithms'],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    logo: {
        type: String,
        default: ''
    },
    images: {
        type: [String]
    },
    technologies: {
        type: [String],
        trim: true,
        index: true
    },
    liveUrls: [{
        label: String,
        link: String
    }],
    gitHubRepoLink: {
        type: String
    },
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Project', ProjectSchema);