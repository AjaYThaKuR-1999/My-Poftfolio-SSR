// Submit General Connection Request
const submitConnect = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;
        
        // Log the connection request (can be extended to email/db later)
        console.log(`[Connect Request] From: ${name} (${email}) - Message: ${message}`);

        req.flash('success_msg', 'Thank you for connecting! I will get back to you soon.');
        const backURL = req.header('Referer') || '/';
        res.redirect(backURL);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submitConnect
};
