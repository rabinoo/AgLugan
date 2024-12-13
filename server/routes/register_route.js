const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

const router = express.Router();

// Verify ID number
router.post('/verify-id', async (req, res) => {
    const { idNumber, userType } = req.body;

    if (!idNumber || !userType) {
        return res.status(400).json({ status: 'error', message: 'ID Number and User Type are required.' });
    }

    const column = userType === 'Student' ? 'student_id_num' : 'faculty_id_num';

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Check if the ID number is already registered in the `users` table
        const [registeredRows] = await connection.execute(
            `SELECT * FROM users WHERE id_number = ?`,
            [idNumber]
        );

        if (registeredRows.length > 0) {
            await connection.end();
            return res.status(409).json({ status: 'error', message: 'ID number already registered.' });
        }

        // Check if the ID number exists in the `id_numbers` table
        const [rows] = await connection.execute(
            `SELECT * FROM id_numbers WHERE ${column} = ?`,
            [idNumber]
        );
        await connection.end();

        if (rows.length > 0) {
            res.json({ status: 'success', message: 'ID number verified.' });
        } else {
            res.status(404).json({ status: 'error', message: 'ID number not found.' });
        }
    } catch (error) {
        console.error('Error verifying ID number:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

// Register user
router.post('/register', async (req, res) => {
    const { name, username, email, password, phone_number, user_type, id_number } = req.body;

    if (!name || !username || !email || !password || !phone_number || !id_number || !user_type) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await connection.execute(
                'INSERT INTO users (name, username, email, password_hash, phone_number, user_type, id_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, username, email, hashedPassword, phone_number, user_type, id_number]
            );

            if (result.affectedRows === 1) {
                return res.json({ status: 'success', message: 'Registration successful' });
            } else {
                return res.status(500).json({ status: 'error', message: 'Error registering user.' });
            }
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ status: 'error', message: 'Server error during registration.' });
    }
});

module.exports = router;
