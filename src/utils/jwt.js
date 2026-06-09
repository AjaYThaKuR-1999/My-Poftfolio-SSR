const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {string} userId 
 * @returns {string} token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '12h' });
};

module.exports = generateToken;

