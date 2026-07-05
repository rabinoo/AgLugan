const express = require('express');
const mysql = require('../config/sql-client');
const path = require('path');
const router = express.Router();

const dbConfig = require('../config/database');
const { authenticateCredentials, applyLoginSession } = require('../services/authService');

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/src/html/login.html'));
});

// Login API endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt received:', req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username and password are required'
            });
        }

        const connection = await mysql.createConnection(dbConfig);

        try {
            console.log('Querying login credentials for username:', username);

            const authResult = await authenticateCredentials(connection, username, password);

            if (!authResult) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid username or password'
                });
            }

            applyLoginSession(req, authResult);

            console.log('Login successful, session:', req.session);

            return res.json({
                status: 'success',
                message: 'Login successful',
                redirectUrl: authResult.redirectUrl
            });

        } finally {
            await connection.end();
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Server error occurred'
        });
    }
});

router.get('/test', (req, res) => {
    res.json({ message: 'Test route is working!' });
});

module.exports = router;
