const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('../config/sql-client');
const auth = require('../middleware/auth');

const router = express.Router();

const dbConfig = require('../config/database');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Configure storage for local development only. Vercel needs external object storage.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads', 'profile_pictures');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, ''); 
    cb(null, `${timestamp}-${sanitizedFileName}`);
  },
});

const upload = multer({
  storage: isVercel ? multer.memoryStorage() : storage,
});

// Profile Update Endpoint
router.post('/update-profile', auth, upload.single('profile_picture'), async (req, res) => {
    const userId = req.session.user_id;

    // Verify if the user is authenticated
    if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized access.' });
    }

    const { name, email } = req.body;

    if (req.file && isVercel) {
        return res.status(400).json({
            status: 'error',
            message: 'Profile image uploads need external storage when deployed on Vercel.',
        });
    }

    const profilePicture = req.file ? `/uploads/profile_pictures/${req.file.filename}` : null;

    try {
        const connection = await mysql.createConnection(dbConfig);

        try {
            // Construct the SQL query based on provided inputs
            const updateFields = [];
            const updateValues = [];

            if (name) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }

            if (email) {
                updateFields.push('email = ?');
                updateValues.push(email);
            }

            if (profilePicture) {
                updateFields.push('profile_picture = ?');
                updateValues.push(profilePicture);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ status: 'error', message: 'No data to update.' });
            }

            const updateQuery = `
                UPDATE users 
                SET ${updateFields.join(', ')}
                WHERE user_id = ?
            `;

            updateValues.push(userId);

            // Execute the update query
            await connection.execute(updateQuery, updateValues);

            res.json({
                status: 'success',
                message: 'Profile updated successfully.',
                profile_picture_url: profilePicture,
            });
        } finally {
            await connection.end();
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
});

module.exports = router;
