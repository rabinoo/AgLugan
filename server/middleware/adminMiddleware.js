function isAdminLoggedIn(req, res, next) {
    console.log('Session data in middleware:', req.session);

    if (req.session && (req.session.isAdmin || req.session.user_type === 'Admin')) {
        next();
    } else {
        res.status(401).json({ status: 'error', message: 'Unauthorized access' });
    }
}

module.exports = { isAdminLoggedIn };
