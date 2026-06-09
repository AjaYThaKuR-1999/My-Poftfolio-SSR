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