const express = require('express');
const router = express.Router();
const Project = require('../../models/Project');
const Message = require('../../models/Message');
const User = require('../../models/User');
const { mapProjectForView } = require('../../controllers/ssr/projectController');

// @desc    Home Page
// @route   GET /
router.get('/', async (req, res, next) => {
    try {
        // Only show featured projects — max 6 fetched (5 cards + 1 'View All' slot)
        const rawProjects = await Project.find({ isActive: true, featured: true })
            .sort('order createdAt')
            .limit(6);

        const featuredProjects = rawProjects.map(p => mapProjectForView(p));

        const adminUser = await User.findOne({ role: 'admin' });
        const adminProfilePicture = adminUser ? adminUser.profilePicture : null;
        const adminResume = adminUser ? adminUser.resume : null;

        let messages = [];
        if (req.user && adminUser) {
            // Mark received messages from admin as read
            await Message.updateMany(
                { sender: adminUser._id, reciever: req.user.id, isRead: false },
                { isRead: true }
            );

            messages = await Message.find({
                $or: [
                    { sender: req.user.id, reciever: adminUser._id },
                    { sender: adminUser._id, reciever: req.user.id }
                ]
            }).sort({ createdAt: 1 });
        }

        res.render('index', {
            title: 'Backend Developer Portfolio',
            description: 'Professional Backend Software Developer Portfolio showcasing projects and skills.',
            featuredProjects,
            messages,
            adminProfilePicture,
            adminResume,
            isHomePage: true
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
