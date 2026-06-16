const Announcement = require('../../models/Announcement');

// List all Active announcements
const listAnnouncements = async (req, res) => {
    try {
        const query = {
            isActive: true,
            endDate: {
                $gte: new Date()
            }
        };
        // Exclude Resume announcements for non-admin users
        if (!req.user || req.user.role !== 'admin') {
            query.type = { $ne: 'Resume' };
        }
        const result = await Announcement.find(query);
        return res.status(200).json({
            status: 200,
            message: "Announcements list fetched successfully",
            result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

// Listing User specific announcements
const listUserAnnouncements = async (req, res) => {
    try {
        const result = await Announcement.find({
            userId: req.user.id,
            isActive: true,
            endDate: {
                $gte: new Date()
            }
        });
        return res.status(200).json({
            status: 200,
            message: "User specific announcements list fetched successfully",
            result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

// Cron job for updating the isActive status of announcements
const updateAnnouncementStatus = async () => {
    try {
        await Announcement.updateMany({
            endDate: {
                $lt: new Date()
            }
        }, {
            isActive: false
        });
        console.log("Announcements status updated successfully");
    } catch (error) {
        console.log(error);
    }
}

// Create announcement
const createAnnouncement = async (req, res) => {
    try {
        const {
            announcement,
            endDate,
            isActive,
            type
        } = req.body;
        const newAnnouncement = await Announcement.create({
            userId: req.user.id,
            announcement,
            type: type || 'community',
            isActive: isActive !== undefined ? isActive : true,
            endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        return res.status(201).json({
            status: 201,
            message: "Announcement created successfully",
            result: newAnnouncement
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

// Update announcement
const updateAnnouncement = async (req, res) => {
    try {
        const {
            announcement,
            endDate,
            isActive,
            type
        } = req.body;
        const updated = await Announcement.findByIdAndUpdate(
            req.params.id, {
            announcement,
            isActive,
            endDate,
            type
        }, {
            new: true,
            runValidators: true
        }
        );
        if (!updated) {
            return res.status(404).json({
                status: 404,
                message: "Announcement not found"
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Announcement updated successfully",
            result: updated
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

// Delete announcement, Soft Delete.
const deleteAnnouncement = async (req, res) => {
    try {
        const deleted = await Announcement.findByIdAndUpdate(req.params.id, {
            isActive: false
        });
        if (!deleted) {
            return res.status(404).json({
                status: 404,
                message: "Announcement not found"
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Announcement deleted successfully",
            result: deleted
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

module.exports = {
    listAnnouncements,
    listUserAnnouncements,
    updateAnnouncementStatus,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
}