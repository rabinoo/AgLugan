const express = require('express');
const db = require('../config/db');
const router = express.Router();

router.get('/passenger-statistics', async (req, res) => {
    try {
        // Fetch data from the passenger_statistics table
        const [rows] = await db.query(
            `SELECT day_of_week, time_slot, bookings_count
             FROM passenger_statistics
             ORDER BY CASE day_of_week
                 WHEN 'Monday' THEN 1
                 WHEN 'Tuesday' THEN 2
                 WHEN 'Wednesday' THEN 3
                 WHEN 'Thursday' THEN 4
                 WHEN 'Friday' THEN 5
                 WHEN 'Saturday' THEN 6
                 ELSE 7
             END, time_slot`
        );

        // Return the data as JSON
        res.json(rows);
    } catch (error) {
        console.error('Error fetching passenger statistics:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
