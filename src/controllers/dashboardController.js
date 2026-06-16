const path = require('path');
const Announcement = require('../models/Announcement');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    User Dashboard
// @route   GET /dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
    try {
        const adminUser = await User.findOne({ role: 'admin' });
        const adminResume = adminUser ? adminUser.resume : null;

        let dbAnnouncements;
        const selectedType = req.query.announcementType || '';
        
        if (req.user.role === 'admin') {
            const query = { isActive: true };
            if (selectedType && ['community', 'Resume', 'system update'].includes(selectedType)) {
                query.type = selectedType;
            }
            dbAnnouncements = await Announcement.find(query).sort('-createdAt');
        } else {
            dbAnnouncements = await Announcement.find({
                isActive: true,
                type: { $ne: 'Resume' },
                endDate: { $gte: new Date() }
            }).sort('-createdAt');
        }

        const announcements = dbAnnouncements.map(ann => {
            let type = ann.type || 'community';
            let title = 'Community Update';
            const text = ann.announcement || '';
            
            if (type === 'Resume') {
                title = 'Resume Activity';
            } else if (type === 'system update') {
                title = 'System Update';
            } else if (text.includes('welcome a new member') || text.startsWith('Let us welcome')) {
                type = 'welcome';
                title = 'New Member Joined!';
            } else if (text.includes('community has reached')) {
                type = 'milestone';
                title = 'Community Milestone!';
            }
            
            return {
                id: ann._id,
                title,
                content: text,
                type,
                createdAt: ann.createdAt,
                isActive: ann.isActive,
                endDate: ann.endDate
            };
        });

        res.render('dashboard/index', {
            title: 'Dashboard',
            announcements,
            user: req.user,
            adminResume,
            selectedType
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update User Profile
// @route   PUT /dashboard/profile
// @access  Private
exports.ssrUpdateProfile = async (req, res, next) => {
    try {
        const {
            name,
            email,
            location,
            bio,
            userType,
            seeking,
            profilePicture
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/dashboard');
        }

        // Check if email already exists on another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, isActive: true });
            if (emailExists) {
                req.flash('error_msg', 'Email is already in use by another account');
                return res.redirect('/dashboard');
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (userType) user.userType = userType;
        if (seeking) user.seeking = seeking;
        if (profilePicture) user.profilePicture = profilePicture;

        // Construct social profile links
        const socialProfileLinks = [];
        const platforms = ['github', 'linkedin', 'facebook', 'twitter', 'instagram', 'website'];
        platforms.forEach(platform => {
            if (req.body[platform] && req.body[platform].trim() !== '') {
                socialProfileLinks.push({ label: platform, link: req.body[platform].trim() });
            }
        });
        user.socialProfileLinks = socialProfileLinks;

        if (user.role === 'admin') {
            await user.save({ validateBeforeSave: false });
        } else {
            await user.save();
        }

        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// @desc    Create Announcement (Admin Only)
// @route   POST /dashboard/announcements
// @access  Private/Admin
exports.ssrCreateAnnouncement = async (req, res, next) => {
    try {
        const { announcement, isActive, endDate, type } = req.body;
        
        const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        await Announcement.create({
            userId: req.user.id,
            announcement,
            type: type || 'community',
            isActive: (isActive === 'true' || isActive === 'on'),
            endDate: end
        });

        req.flash('success_msg', 'Announcement created successfully!');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// @desc    Update Announcement (Admin Only)
// @route   POST /dashboard/announcements/:id?_method=PUT
// @access  Private/Admin
exports.ssrUpdateAnnouncement = async (req, res, next) => {
    try {
        const { announcement, endDate, type } = req.body;
        const { id } = req.params;

        const ann = await Announcement.findById(id);
        if (!ann) {
            req.flash('error_msg', 'Announcement not found');
            return res.redirect('/dashboard');
        }

        if (announcement !== undefined) ann.announcement = announcement;
        if (endDate) ann.endDate = new Date(endDate);
        if (type !== undefined) ann.type = type;

        await ann.save();

        req.flash('success_msg', 'Announcement updated successfully!');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// @desc    Delete Announcement (Admin Only)
// @route   POST /dashboard/announcements/:id?_method=DELETE
// @access  Private/Admin
exports.ssrDeleteAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ann = await Announcement.findById(id);
        if (!ann) {
            req.flash('error_msg', 'Announcement not found');
            return res.redirect('/dashboard');
        }
        
        // Soft delete: turn isActive status to false
        ann.isActive = false;
        await ann.save();

        req.flash('success_msg', 'Announcement deleted successfully!');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// @desc    Upload/Update Resume (Admin Only)
// @route   POST /dashboard/resume
// @access  Private/Admin
exports.ssrUploadResume = async (req, res, next) => {
    try {
        const { resume } = req.body;
        if (!resume) {
            req.flash('error_msg', 'Please select a resume file to upload');
            return res.redirect('/dashboard');
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/dashboard');
        }

        const isFirstTime = !user.resume;
        user.resume = resume;
        await user.save({ validateBeforeSave: false });

        // Generate dynamic formatted time/date
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        let announcementText = '';
        if (isFirstTime) {
            announcementText = `Resume is uploaded successfully on ${formattedDate} at ${formattedTime}.`;
        } else {
            announcementText = `Resume has been updated on ${formattedDate} at ${formattedTime}.`;
        }

        // Create Resume announcement for admin
        await Announcement.create({
            userId: req.user.id,
            announcement: announcementText,
            type: 'Resume',
            isActive: true,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiration
        });

        req.flash('success_msg', isFirstTime ? 'Resume uploaded successfully!' : 'Resume updated successfully!');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// @desc    Download Admin Resume & log download announcement
// @route   GET /dashboard/resume/download
// @access  Private
exports.ssrDownloadResume = async (req, res, next) => {
    try {
        // Find the admin user to get the resume file
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser || !adminUser.resume) {
            req.flash('error_msg', 'Owner resume is not available for download.');
            return res.redirect('/dashboard');
        }

        // Only create an announcement if the downloader is NOT the admin themselves
        if (req.user.role !== 'admin') {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            const formattedTime = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            const downloaderName = req.user.name;
            const downloaderEmail = req.user.email;
            const downloaderId = req.user.id;

            await Announcement.create({
                userId: downloaderId, // add their userId in doc
                announcement: `Your resume has been downloaded by ${downloaderName} (${downloaderEmail}, ID: ${downloaderId}) on ${formattedDate} at ${formattedTime}.`,
                type: 'Resume',
                isActive: true,
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiration
            });
        }

        const resumeRelativePath = adminUser.resume;
        const cleanRelativePath = resumeRelativePath.startsWith('/') ? resumeRelativePath.slice(1) : resumeRelativePath;
        const filePath = path.join(process.cwd(), 'public', cleanRelativePath);

        res.download(filePath, (err) => {
            if (err) {
                if (!res.headersSent) {
                    req.flash('error_msg', 'Could not download the resume file.');
                    return res.redirect('/dashboard');
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Registered Members List (Admin Only)
// @route   GET /users
// @access  Private/Admin
exports.ssrGetUsersList = async (req, res, next) => {
    try {
        const currentPage = parseInt(req.query.page, 10) || 1;
        if (currentPage < 1) return res.redirect('/users?page=1');
        const limit = 20;
        const skip = (currentPage - 1) * limit;

        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalPages = Math.ceil(totalUsers / limit) || 1;

        if (currentPage > totalPages && totalPages > 0) {
            return res.redirect(`/users?page=${totalPages}`);
        }

        const users = await User.find({ role: { $ne: 'admin' } })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.render('users/index', {
            title: 'Registered Members',
            users,
            currentPage,
            totalPages,
            totalUsers,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
};

