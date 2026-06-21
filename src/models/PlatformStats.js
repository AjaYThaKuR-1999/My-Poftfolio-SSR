const mongoose = require('mongoose');

const PlatformStatsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'global'
    },
    totalVisits: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('PlatformStats', PlatformStatsSchema);
