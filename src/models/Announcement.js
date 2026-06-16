const mongoose = require('mongoose');

const announcementsModel = mongoose.model(
    'announcement', new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        announcement: {
            type: String
        },
        type: {
            type: String,
            enum: ['community', 'Resume', 'system update'],
            default: 'community'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        endDate: {
            type : Date // 1 week later after creation
        }
    },
        { timestamps: true, versionKey: false }
    )
);

module.exports = announcementsModel;