const User = require('../../models/User');
const generateToken = require('../../utils/jwt');
const { sendMail } = require('../../utils/email');
const { welcomeEmail } = require('../../utils/templates');
const Announcements = require('../../models/Announcement');

// Register user — API
const apiRegister = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            location,
            bio,
            userType,
            seeking,
            profilePicture,
            github,
            linkedin,
            facebook,
            twitter,
            instagram,
            website
        } = req.body;

        const existingUser = await User.findOne({ email, isActive: true });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const socialProfileLinks = [];
        if (github) socialProfileLinks.push({ label: 'github', link: github });
        if (linkedin) socialProfileLinks.push({ label: 'linkedin', link: linkedin });
        if (facebook) socialProfileLinks.push({ label: 'facebook', link: facebook });
        if (twitter) socialProfileLinks.push({ label: 'twitter', link: twitter });
        if (instagram) socialProfileLinks.push({ label: 'instagram', link: instagram });
        if (website) socialProfileLinks.push({ label: 'website', link: website });

        const user = await User.create({
            name,
            email,
            password,
            location,
            bio,
            userType,
            seeking,
            profilePicture,
            socialProfileLinks,
            role: 'user'
        });
        if (user) {
            await createWelcomeAnnouncement(user.name);

            const usersCount = await User.countDocuments({ isActive: true });
            await findOrUpdateMemberCountAnnouncement(usersCount);

            const { subject, html } = await welcomeEmail(user.name, user.email);
            sendMail(user.name, user.email, subject, html);
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Login user — API
const apiLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account deactivated' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Get current logged-in user — API
const apiGetMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// Helper: Create welcome announcement
const createWelcomeAnnouncement = async (userName) => {
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return Announcements.create({
        announcement: `🎉 Let us welcome a new member, ${userName} to our community. Thanks for joining us here. 🙌`,
        endDate: oneWeekFromNow,
        type: 'community'
    });
};

// Helper: Update member count announcement
const findOrUpdateMemberCountAnnouncement = async (usersCount) => {
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const existingAnnouncement = await Announcements.findOne({ announcement: { $regex: /^🎉 Our community has reached \d+ members/i } });
    const updatedAnnouncementText = `🎉 Our community has reached ${usersCount} members! Thank you all for being here.`;

    if (!existingAnnouncement) {
        return Announcements.create({
            announcement: updatedAnnouncementText,
            endDate: oneWeekFromNow,
            type: 'community'
        });
    } else if (existingAnnouncement.isActive && existingAnnouncement.endDate > new Date()) {
        return Announcements.findByIdAndUpdate(existingAnnouncement._id, {
            announcement: updatedAnnouncementText,
            endDate: oneWeekFromNow
        });
    } else {
        return Announcements.findByIdAndUpdate(existingAnnouncement._id, {
            announcement: updatedAnnouncementText,
            isActive: true,
            endDate: oneWeekFromNow
        });
    }
};

// Logout — API
const apiLogout = (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully. Please discard your token.' });
};

// Get all registered users (excluding admins) — API (Admin only)
const apiGetUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};

// Update logged-in user profile — API
const apiUpdateMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const {
            name,
            email,
            password,
            location,
            bio,
            userType,
            seeking,
            profilePicture,
            github,
            linkedin,
            facebook,
            twitter,
            instagram,
            website
        } = req.body;

        // If email is changing, check for uniqueness
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, isActive: true });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (password) user.password = password; // pre('save') will hash this automatically
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;
        if (userType !== undefined) user.userType = userType;
        if (seeking !== undefined) user.seeking = seeking;

        // Update social links
        const socials = { github, linkedin, facebook, twitter, instagram, website };
        Object.entries(socials).forEach(([label, link]) => {
            if (link !== undefined) {
                const existingIdx = user.socialProfileLinks.findIndex(s => s.label === label);
                if (link === '') {
                    // Remove if empty
                    if (existingIdx !== -1) user.socialProfileLinks.splice(existingIdx, 1);
                } else {
                    if (existingIdx !== -1) {
                        user.socialProfileLinks[existingIdx].link = link;
                    } else {
                        user.socialProfileLinks.push({ label, link });
                    }
                }
            }
        });

        if (user.role === 'admin') {
            await user.save({ validateBeforeSave: false });
        } else {
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    apiRegister,
    apiLogin,
    apiGetMe,
    apiLogout,
    apiGetUsers,
    apiUpdateMe
};
