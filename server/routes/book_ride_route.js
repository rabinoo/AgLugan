const express = require('express');
const mysql = require('../config/sql-client');
const router = express.Router();
const dbConfig = require('../config/database');

const db = mysql.createPool(dbConfig);

// Booking endpoint
router.post('/direct-booking', (req, res) => {
    const { ride_id } = req.body;

    if (!ride_id) {
        return res.status(400).json({
            success: false,
            message: 'Ride ID is required'
        });
    }

    db.getConnection((connectionError, connection) => {
        if (connectionError) {
            console.error('Database connection error:', connectionError);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }

        connection.query(
            "SELECT * FROM rides WHERE ride_id = ? AND status = 'In Queue'",
            [ride_id],
            (error, rideResults) => {
                if (error) {
                    connection.release();
                    console.error('Database error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Database error occurred'
                    });
                }

                if (rideResults.length === 0) {
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'Ride not available for booking'
                    });
                }

                const ride = rideResults[0];
                const currentSeats = parseInt(ride.seat_status, 10) || 0;

                if (currentSeats >= 23) {
                    connection.release();
                    return res.status(400).json({
                        success: false,
                        message: 'No seats available on this ride'
                    });
                }

                connection.beginTransaction((err) => {
                    if (err) {
                        connection.release();
                        return res.status(500).json({
                            success: false,
                            message: 'Transaction error'
                        });
                    }

                    connection.query(
                        'UPDATE rides SET seat_status = seat_status + 1 WHERE ride_id = ?',
                        [ride_id],
                        (updateError) => {
                            if (updateError) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({
                                        success: false,
                                        message: 'Failed to update ride'
                                    });
                                });
                            }

                            connection.query(
                                "INSERT INTO bookings (ride_id, booking_status, created_at) VALUES (?, 'BOOKED', NOW())",
                                [ride_id],
                                (bookingError, bookingResult) => {
                                    if (bookingError) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            res.status(500).json({
                                                success: false,
                                                message: 'Failed to create booking'
                                            });
                                        });
                                    }

                                    connection.commit((commitError) => {
                                        if (commitError) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                res.status(500).json({
                                                    success: false,
                                                    message: 'Failed to commit transaction'
                                                });
                                            });
                                        }

                                        connection.release();
                                        res.json({
                                            success: true,
                                            message: 'Booking successful',
                                            booking_id: bookingResult.insertId
                                        });
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    });
});

module.exports = router;
