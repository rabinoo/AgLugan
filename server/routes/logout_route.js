const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ status: 'error', message: 'Failed to log out' });
        }

        // Clear the session cookie
        res.clearCookie('aglugan-session', { path: '/' });
        return res.json({ status: 'success', message: 'Logged out successfully' });
    });
});

module.exports = router;
