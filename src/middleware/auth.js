const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper: verify a JWT and return the decoded payload (or null)
// ─────────────────────────────────────────────────────────────────────────────
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// protect  — for SSR routes (reads token from httpOnly cookie)
// If not authenticated → redirects to /auth/login
// ─────────────────────────────────────────────────────────────────────────────
exports.protect = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        req.flash('error_msg', 'Please log in to continue');
        return res.redirect('/auth/login');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        req.flash('error_msg', 'Session expired, please log in again');
        return res.redirect('/auth/login');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
        req.flash('error_msg', 'Account not found or deactivated');
        return res.redirect('/auth/login');
    }

    req.user = user;
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// protectApi  — for API routes (reads Bearer token from Authorization header)
// If not authenticated → returns 401 JSON
// ─────────────────────────────────────────────────────────────────────────────
exports.protectApi = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Not authorised — invalid or expired token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Account not found or deactivated' });
    }

    req.user = user;
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// authorize  — role-based guard, works for both SSR and API
// Usage:  router.get('/admin', protect, authorize('admin'), handler)
// ─────────────────────────────────────────────────────────────────────────────
exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        // If the request expects JSON (API clients) return JSON, else redirect
        if (req.headers.accept?.includes('application/json')) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not allowed to access this resource`,
            });
        }
        req.flash('error_msg', 'You are not authorised to access this page');
        return res.redirect('/');
    }
    next();
};

// ─────────────────────────────────────────────────────────────────────────────
// checkUser  — passive middleware: silently resolves the logged-in user for
// every SSR page so EJS templates always have access to `user` via res.locals
// ─────────────────────────────────────────────────────────────────────────────
exports.checkUser = async (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = await User.findById(decoded.id).catch(() => null);
            res.locals.user = req.user;
        } else {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};
