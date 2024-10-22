<?php
// Start the session to access user information
session_start();

header('Content-Type: application/json');

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Check if the user is logged in and retrieve the user_id from the session
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in."]);
    exit();
}

$user_id = $_SESSION['user_id'];  // Fetch user_id from session

// Get payment details from form submission
$payment_method = $_POST['payment_method'];
$amount = $_POST['amount'];
$name = $_POST['name'];
$phone_number = $_POST['gcash-number'] ?? $_POST['maya-number'];

// Insert payment into 'payments' table (include user_id)
$sql = "INSERT INTO payments (ride_id, amount, payment_method, phone_number, user_id, status) VALUES (NULL, ?, ?, ?, ?, 'pending')";
$stmt = $conn->prepare($sql);
$stmt->bind_param("dssi", $amount, $payment_method, $phone_number, $user_id); 

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Payment submitted successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
}

// Close connection
$conn->close();
?>