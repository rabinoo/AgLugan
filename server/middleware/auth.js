module.exports = (req, res, next) => {
    console.log('Session data:', req.session); // Debugging session data

    if (!req.session || !req.session.user_id) {
        return res.status(401).json({ status: 'error', message: 'User not logged in.' });
    }

    req.driver_id = req.session.user_id; 
    console.log('Driver IDs:', req.driver_id); 
    next();
};
