const Appointment = require('../models/Appointment');
const HelpRequest = require('../models/HelpRequest');
const Announcement = require('../models/Announcement');
const Project = require('../models/Project');

// @desc    User Dashboard
// @route   GET /dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
    try {
        let appointments = [];
        let helpRequests = [];
        const dbAnnouncements = await Announcement.find({ isActive: true, endDate: { $gte: new Date() } }).sort('-createdAt');
        const announcements = dbAnnouncements.map(ann => {
            let type = 'info';
            let title = 'System Update';
            const text = ann.announcement || '';
            if (text.includes('welcome a new member') || text.startsWith('Let us welcome')) {
                type = 'welcome';
                title = 'New Member Joined!';
            } else if (text.includes('community has reached')) {
                type = 'milestone';
                title = 'Community Milestone!';
            }
            return {
                title,
                content: text,
                type,
                createdAt: ann.createdAt
            };
        });

        if (req.user.role === 'admin') {
            appointments = await Appointment.find().populate('user', 'name email').sort('-createdAt');
            helpRequests = await HelpRequest.find().populate('user', 'name email').sort('-createdAt');
        } else {
            appointments = await Appointment.find({ user: req.user.id }).sort('-createdAt');
            helpRequests = await HelpRequest.find({ user: req.user.id }).sort('-createdAt');
        }

        res.render('dashboard/index', {
            title: 'Dashboard',
            appointments,
            helpRequests,
            announcements,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};
