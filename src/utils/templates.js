// Generate welcome email template
const welcomeEmail = async (name, email) => {
    return {
        subject: `Welcome to our community, ${name}!`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #6366f1;">Welcome to our Community, ${name}! 🎉</h2>
                <p>We are absolutely thrilled to have you join us here. Your account has been successfully registered.</p>
                <p>Explore projects, connect with the community, and let us know if you need any help.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The Developer Team</strong></p>
            </div>
        `
    };
};

module.exports = { welcomeEmail };
