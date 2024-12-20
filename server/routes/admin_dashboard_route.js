const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const router = express.Router();
const { isAdminLoggedIn } = require('../middleware/adminMiddleware');

// Apply middleware
router.use(isAdminLoggedIn);

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aglugan',
};

// Helper function for time comparison
function isTimeInRange(currentTime, startTime, endTime) {
    const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + parseInt(minutes);
    };

    const current = parseTime(currentTime);
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    return current >= start && current <= end;
}

// Test route
router.get('/test-route', (req, res) => {
    res.json({ message: 'Router is working' });
});

// Get rides
router.get('/rides', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const searchQuery = req.query.search ? `%${req.query.search}%` : null;

        let query = `
            SELECT 
                r.ride_id,
                r.start_location,
                r.end_location,
                r.status,
                r.fare,
                r.time_range,
                r.seat_status,
                v.plate_number
            FROM rides r
            LEFT JOIN vehicles v ON r.driver_id = v.driver_id
            WHERE r.status != 'Inactive'
        `;

        const params = searchQuery
            ? [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
            : [];

        if (searchQuery) {
            query += ` AND (
                r.ride_id LIKE ? OR
                r.start_location LIKE ? OR
                r.end_location LIKE ? OR
                r.status LIKE ? OR
                r.seat_status LIKE ? OR
                v.plate_number LIKE ?
            )`;
        }

        query += ' ORDER BY r.ride_id DESC';

        const [rides] = await connection.execute(query, params);
        await connection.end();

        res.json(rides);
    } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get vusers
router.get('/vusers', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const searchQuery = req.query.search ? `%${req.query.search}%` : null;

        let query = `
            SELECT user_id, name, username, email, user_type, phone_number, id_number 
            FROM users
        `;
        let params = [];

        if (searchQuery) {
            query += ` WHERE 
                name LIKE ? OR 
                email LIKE ? OR 
                user_type LIKE ?
            `;
            params = [searchQuery, searchQuery, searchQuery];
        }

        const [users] = await connection.execute(query, params);
        await connection.end();
        res.json(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add Driver
router.post('/add-driver', async (req, res) => {
    const { username, name, password, driverId, plateNumber, vehicleCapacity } = req.body;

    if (!username || !name || !password || !driverId || !plateNumber || !vehicleCapacity) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Check if the driver name already exists
        const [existingDriverName] = await connection.execute(
            'SELECT * FROM users WHERE name = ?',
            [name]
        );
        if (existingDriverName.length > 0) {
            await connection.end();
            return res.status(409).json({ message: 'Driver name already exists.' });
        }

        // Check if the username already exists in the 'users' table
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (existingUser.length > 0) {
            await connection.end();
            return res.status(409).json({ message: 'Username already exists.' });
        }

        // Check if the driver_id exists in the 'vehicles' table
        const [existingDriverId] = await connection.execute(
            'SELECT * FROM vehicles WHERE driver_id = ?',
            [driverId]
        );

        if (existingDriverId.length > 0) {
            await connection.end();
            return res.status(409).json({ message: 'Driver ID already exists in vehicles table.' });
        }

        // Check if the plate number is already assigned to another driver
        const [existingPlateNumber] = await connection.execute(
            'SELECT * FROM vehicles WHERE plate_number = ?',
            [plateNumber]
        );
        
        if (existingPlateNumber.length > 0) {
            await connection.end();
            return res.status(409).json({ message: 'Plate number already assigned to another driver.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Use placeholder email if not provided
        const placeholderEmail = `${username}@drivermail.com`;

        // Insert into 'users' table
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, name, email, password_hash, user_type) VALUES (?, ?, ?, ?, ?)',
            [username, name, placeholderEmail, hashedPassword, 'Driver']
        );

        // Get the last inserted user ID
        const userId = userResult.insertId;

        // Insert into 'vehicles' table with the user_id as driver_id
        await connection.execute(
            'INSERT INTO vehicles (driver_id, plate_number, capacity) VALUES (?, ?, ?)',
            [userId, plateNumber, vehicleCapacity]
        );

        await connection.end();
        res.json({ message: 'Driver and vehicle added successfully.' });
    } catch (error) {
        console.error('Error adding driver:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.post('/add-id', async (req, res) => {
    const { idNumber, idType } = req.body;
    if (!idNumber || !idType) {
        return res.status(400).json({ message: 'ID number and user type are required.' });
    }

    const column = idType === 'Student' ? 'student_id_num' : 'faculty_id_num';

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check if ID already exists
        const [existingRows] = await connection.execute(
            `SELECT * FROM id_numbers WHERE ${column} = ?`, 
            [idNumber]
        );

        if (existingRows.length > 0) {
            await connection.end();
            return res.status(400).json({ message: 'ID Already Exists' });
        }

        // If ID doesn't exist, proceed with insertion
        await connection.execute(
            `INSERT INTO id_numbers (${column}) VALUES (?)`, 
            [idNumber]
        );
        
        await connection.end();
        res.json({ message: 'ID number added successfully.' });
    } catch (error) {
        console.error('Error adding ID number:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update ride status
router.put('/update-ride-status', async function (req, res) {
    try {
        console.log('Refresh ride status route hit');
        const connection = await mysql.createConnection(dbConfig);

        // Fetch current ride statuses from the database
        const [rides] = await connection.execute(`
            SELECT 
                r.ride_id,
                r.start_location,
                r.end_location,
                r.status,
                r.fare,
                r.time_range,
                r.seat_status,
                v.plate_number
            FROM rides r
            LEFT JOIN vehicles v ON r.driver_id = v.driver_id
            WHERE r.status != 'Inactive'
            ORDER BY r.ride_id DESC
        `);

        await connection.end();

        console.log('Fetched ride statuses:', rides);

        // Send the fetched rides back to the frontend
        res.json(rides);

    } catch (error) {
        console.error('Error fetching ride statuses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Delete Ride
router.delete('/delete-ride/:rideId', async (req, res) => {
    const { rideId } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM rides WHERE ride_id = ?', [rideId]);
        await connection.end();

        res.json({ message: 'Ride deleted successfully.' });
    } catch (error) {
        console.error('Error deleting ride:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete User
router.delete('/delete-user/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is required.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);
        await connection.end();

        if (result.affectedRows > 0) {
            res.json({ status: 'success', message: 'User deleted successfully.' });
        } else {
            res.status(404).json({ status: 'error', message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

module.exports = router;