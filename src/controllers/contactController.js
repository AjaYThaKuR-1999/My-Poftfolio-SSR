const HelpRequest = require('../models/HelpRequest');
const Appointment = require('../models/Appointment');

// Submit Help Request
const submitRequest = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (subject === 'appointment') {
            if (!req.user) {
                req.flash('error_msg', 'Please login to book an appointment');
                return res.redirect('/auth/login');
            }
            req.flash('success_msg', 'Please fill out the appointment details below');
            return res.redirect('/dashboard'); 
        }

        if (!req.user) {
            req.flash('error_msg', 'Please login to submit a request');
            return res.redirect('/auth/login');
        }

        const request = await HelpRequest.create({
            name,
            email,
            subject,
            message,
            user: req.user.id
        });

        req.flash('success_msg', 'Your request has been sent successfully!');
        res.redirect('back');
    } catch (err) {
        next(err);
    }
};

// Submit General Connection Request
const submitConnect = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        
        // Log the connection request (can be extended to email/db later)
        console.log(`[Connect Request] From: ${name} (${email}) - Message: ${message}`);

        req.flash('success_msg', 'Thank you for connecting! I will get back to you soon.');
        res.redirect('back');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submitRequest,
    submitConnect
};
