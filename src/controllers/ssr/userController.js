const User = require('../../models/User');
const generateToken = require('../../utils/jwt');
const { sendMail } = require('../../utils/email');
const { welcomeEmail } = require('../../utils/templates');
const Announcements = require('../../models/Announcement');

// Helper: attach JWT as an httpOnly cookie
const attachCookie = (res, token) => {
    const options = {
        expires: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        httpOnly: true,
        sameSite: 'lax',
    };
    if (process.env.NODE_ENV === 'production') options.secure = true;
    res.cookie('token', token, options);
};

// Register user — SSR
const ssrRegister = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            city,
            state,
            street,
            zipCode,
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
            req.flash('error_msg', 'Email already exists');
            return res.redirect('/auth/register');
        }

        const address = {};
        if (city) address.city = city;
        if (state) address.state = state;
        if (street) address.street = street;
        if (zipCode) address.zipCode = zipCode;

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
            address,
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
        attachCookie(res, token);

        req.flash('success_msg', `Welcome, ${user.name}!`);
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// Login user — SSR
const ssrLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error_msg', 'Please provide email and password');
            return res.redirect('/auth/login');
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/auth/login');
        }

        if (!user.isActive) {
            req.flash('error_msg', 'Your account has been deactivated');
            return res.redirect('/auth/login');
        }

        const token = generateToken(user._id);
        attachCookie(res, token);
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

// Logout user — SSR
const ssrLogout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });
    res.redirect('/');
};

// Helper: Create welcome announcement
const createWelcomeAnnouncement = async (userName) => {
    const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return Announcements.create({
        announcement: `Let us welcome a new member ${userName} to our community. Thanks for joining us here.`,
        endDate: oneWeekFromNow
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
            endDate: oneWeekFromNow
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

module.exports = {
    ssrRegister,
    ssrLogin,
    ssrLogout
};
