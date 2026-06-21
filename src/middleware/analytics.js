const User = require('../models/User');

exports.trackUserActivity = async (req, res, next) => {
    try {
        if (req.user) {
            // Update lastActive time (throttled to once per hour: 3600000ms)
            const now = new Date();
            const lastActiveTime = req.user.lastActive ? new Date(req.user.lastActive).getTime() : 0;
            if (now.getTime() - lastActiveTime > 60 * 60 * 1000) {
                req.user.lastActive = now;
                await User.findByIdAndUpdate(req.user.id, { lastActive: now });
            }
        }
    } catch (err) {
        console.error('[Analytics Middleware Error]:', err);
    }
    next();
};
