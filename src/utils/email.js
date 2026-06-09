/**
 * Send an email (mock implementation)
 * @param {string} name 
 * @param {string} email 
 * @param {string} subject 
 * @param {string} html 
 */
const sendMail = async (name, email, subject, html) => {
    console.log(`[Email Service] Sending email to ${name} (${email})`);
    console.log(`[Email Service] Subject: ${subject}`);
    // In a real application, integration with nodemailer, SendGrid, etc. goes here
    return true;
};

module.exports = { sendMail };
