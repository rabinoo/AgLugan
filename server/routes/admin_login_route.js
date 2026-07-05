const express = require('express');
const mysql = require('../config/sql-client');
const router = express.Router();

const dbConfig = require('../config/database');
const { authenticateCredentials, applyLoginSession } = require('../services/authService');

router.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password are required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            const authResult = await authenticateCredentials(connection, username, password);

            if (!authResult || authResult.kind !== 'admin') {
                return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
            }

            applyLoginSession(req, authResult);
            console.log('Session created:', req.session);

            res.json({ status: 'success', message: 'Login successful', redirectUrl: authResult.redirectUrl });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;


// Admin logout route
router.post('/admin-logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ status: 'error', message: 'Failed to log out' });
        }
        res.clearCookie('aglugan-session');
        res.json({ status: 'success', message: 'Logged out successfully' });
    });
});

module.exports = router;
