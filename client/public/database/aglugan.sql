-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 19, 2024 at 04:06 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aglugan`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2a$04$M3NnIAEnldkiWwL5g.UdHOplYUQpdYgCQuhajCXMUi97Dqdkh7Vua'),
(3, 'admin2', '$2a$04$M3NnIAEnldkiWwL5g.UdHOplYUQpdYgCQuhajCXMUi97Dqdkh7Vua'),
(4, 'admin3', 'admin123');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE IF NOT EXISTS `bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `ride_id` int NOT NULL,
  `booking_status` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`booking_id`),
  KEY `ride_id` (`ride_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `ride_id`, `booking_status`, `created_at`) VALUES
(1, 10077, 'BOOKED', '2024-12-18 17:54:33'),
(2, 10078, 'BOOKED', '2024-12-18 18:01:14'),
(3, 10079, 'BOOKED', '2024-12-18 18:43:05'),
(4, 10079, 'BOOKED', '2024-12-18 18:47:48'),
(5, 10078, 'BOOKED', '2024-12-19 00:36:28');

-- --------------------------------------------------------

--
-- Table structure for table `id_numbers`
--

DROP TABLE IF EXISTS `id_numbers`;
CREATE TABLE IF NOT EXISTS `id_numbers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_id_num` varchar(50) DEFAULT NULL,
  `student_id_num` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `id_numbers`
--

INSERT INTO `id_numbers` (`id`, `faculty_id_num`, `student_id_num`) VALUES
(1, '2351426', NULL),
(2, NULL, '2222725'),
(3, NULL, '2234223'),
(4, NULL, '2222723'),
(5, NULL, '22224982'),
(6, '2978909', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `passenger_statistics`
--

DROP TABLE IF EXISTS `passenger_statistics`;
CREATE TABLE IF NOT EXISTS `passenger_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_slot` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookings_count` int DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `passenger_statistics`
--

INSERT INTO `passenger_statistics` (`id`, `day_of_week`, `time_slot`, `bookings_count`, `updated_at`) VALUES
(1, 'Monday', '6:00 AM - 7:00 AM', 15, '2024-12-10 02:58:00'),
(2, 'Monday', '7:00 AM - 8:00 AM', 25, '2024-12-10 02:58:00'),
(3, 'Tuesday', '6:00 AM - 7:00 AM', 10, '2024-12-10 02:58:00'),
(4, 'Tuesday', '7:00 AM - 8:00 AM', 30, '2024-12-10 02:58:00'),
(5, 'Saturday', '9:00 AM - 10:00 AM', 5, '2024-12-10 02:58:00');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `ride_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','Gcash','Maya') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` int NOT NULL,
  `user_id` int NOT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `ride_id` (`ride_id`),
  KEY `fk_user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `ride_id`, `amount`, `payment_method`, `status`, `phone_number`, `user_id`, `payment_date`) VALUES
(26, 1059, 13.00, 'cash', 'pending', 0, 24, '2024-12-11 10:01:51'),
(27, 1053, 13.00, 'Maya', 'pending', 2147483647, 24, '2024-12-11 10:01:51'),
(28, 1048, 18.00, 'cash', 'pending', 0, 27, '2024-12-11 10:01:51'),
(29, 1048, 18.00, 'cash', 'pending', 0, 27, '2024-12-11 10:01:51'),
(30, 1018, 18.00, 'cash', 'pending', 0, 31, '2024-12-12 14:40:38'),
(31, 1058, 18.00, 'cash', 'pending', 0, 32, '2024-12-12 14:42:54'),
(32, 1059, 18.00, 'cash', 'pending', 0, 37, '2024-12-13 00:02:16'),
(33, 10078, 18.00, 'cash', 'pending', 0, 36, '2024-12-19 00:36:30');

-- --------------------------------------------------------

--
-- Table structure for table `rides`
--

DROP TABLE IF EXISTS `rides`;
CREATE TABLE IF NOT EXISTS `rides` (
  `ride_id` int NOT NULL AUTO_INCREMENT,
  `plate_number` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `start_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('In Queue','Scheduled','Inactive','Done','Cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fare` decimal(10,2) NOT NULL,
  `waiting_time` time(6) NOT NULL,
  `time_range` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seat_status` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ride_id`),
  KEY `passenger_id` (`plate_number`),
  KEY `driver_id` (`driver_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10081 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rides`
--

INSERT INTO `rides` (`ride_id`, `plate_number`, `driver_id`, `start_location`, `end_location`, `status`, `fare`, `waiting_time`, `time_range`, `seat_status`) VALUES
(10080, 'YAA 3508', 39, 'Igorot Garden', 'Phase 1', 'In Queue', 13.00, '00:15:00.000000', '2024-12-19 01:00-01:15', '0/23'),
(10079, 'YAA 3508', 39, 'Igorot Garden', 'Barangay Hall', 'Done', 12.00, '00:15:00.000000', '2024-12-19 00:45-01:00', '0/23'),
(10078, 'YAA 3508', 39, 'Barangay Hall', 'SM Baguio', 'Done', 12.00, '00:15:00.000000', '2024-12-19 00:30-00:45', '1'),
(10077, 'YAA 3508', 39, 'Igorot Garden', 'SLU Mary Heights', 'Done', 13.00, '00:15:00.000000', '2024-12-19 00:15-00:30', '0/23'),
(10076, 'YAA 3508', 39, 'Igorot Garden', 'SLU Mary Heights', 'Done', 13.00, '00:15:00.000000', '2024-12-18 23:15-23:30', '0/23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_type` enum('Student','Faculty/Staff','Driver') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_picture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `driver_id` (`driver_id`),
  KEY `name` (`name`(250))
) ENGINE=MyISAM AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `username`, `email`, `password_hash`, `phone_number`, `user_type`, `profile_picture`, `id_number`, `driver_id`) VALUES
(28, 'Aisea Marie Factor', 'Aisea', 'asieamarie@gmail.com', '$2b$10$8wSIRmu0rB8mecY6TsA/7uNTBaViMYvuVfaEteiRS5lakMOTyXJxu', '9183724988', 'Student', '/uploads/profile_pictures/1733847649371-4043260_avatar_male_man_portrait_icon.ico', NULL, NULL),
(30, 'Martin Kapitan', 'Martin', 'kapitanmartin@gmail.com', '$2b$10$6p4PWt5901vHTalFLmlEdOTCiomaEYLk/zRvMtD8zB7RZiByL5u1y', '9234693982', 'Driver', NULL, NULL, NULL),
(36, 'Claude API', 'Claude', 'claudeai@gmail.com', '$2b$10$6MtXay.RGLeDo/AWvdrmHuSIVOIIU7tngsKxYePLhdFiCB7eGivM2', '9845345678', 'Student', '/uploads/profile_pictures/1734534060201-Profile-YGN_1.png', '2222723', NULL),
(38, 'Karding Kenkoy', 'Karding', '', '$2b$10$NvtxuNTJQ3nmPC1TBQzgtu5OZvM0Rdos9ZmbP7NjLeHuJ1nWsexHq', NULL, 'Driver', NULL, NULL, 103),
(39, 'Rolando Morzoe', 'Rolando', 'rolandospy@gmail.com', '$2b$10$AcPYFZ87FlEow0ggDupZyeTTa3llokZTQc19yoShBbyJ5fnvZO3B6', '9483276877', 'Driver', NULL, '', 104);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE IF NOT EXISTS `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int DEFAULT NULL,
  `capacity` int NOT NULL,
  `plate_number` varchar(1234) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`vehicle_id`),
  KEY `driver_id` (`driver_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `driver_id`, `capacity`, `plate_number`) VALUES
(8, 39, 23, 'YAA 3508');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
