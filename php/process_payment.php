<?php
// Start the session to access user information
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "User not logged in."]);
    exit();
}

// Set the response header to JSON
header('Content-Type: application/json');

// Enable error logging for debugging (write errors to a log file)
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt'); // Adjust the path if needed
error_reporting(E_ALL); // Enable all error reporting
ini_set('display_errors', 0); // Disable displaying errors in production

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

$user_id = $_SESSION['user_id'];  // Fetch user_id from session

// Get payment details from form submission
$payment_method = $_POST['payment_method'] ?? '';
$amount = $_POST['amount'] ?? 0;
$ride_id = $_POST['ride_id'] ?? null;  // Ride ID is optional

// Handle payment method to get the phone number based on GCash or Maya
$phone_number = null;
if ($payment_method === "gcash") {
    $phone_number = $_POST['gcash_number'] ?? '';
} elseif ($payment_method === "maya") {
    $phone_number = $_POST['maya_number'] ?? '';
}

// Validate required fields for non-cash methods
if (($payment_method === "gcash" || $payment_method === "maya") && (empty($amount) || empty($phone_number))) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit();
}

// Validate mobile number (must start with "09" and be followed by 9 digits)
if (($payment_method === "gcash" || $payment_method === "maya") && !preg_match('/^09\d{9}$/', $phone_number)) {
    echo json_encode(["status" => "error", "message" => "Invalid mobile number. Must start with '09' and be followed by 9 digits."]);
    exit();
}

// Insert payment into 'payments' table
if ($payment_method === "cash") {
    // Cash payments don't require a phone number
    $sql = "INSERT INTO payments (ride_id, amount, payment_method, user_id, status) VALUES (?, ?, ?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("dssi", $ride_id, $amount, $payment_method, $user_id);
} else {
    // Non-cash payments (GCash or Maya) require phone number
    $sql = "INSERT INTO payments (ride_id, amount, payment_method, phone_number, user_id, status) VALUES (?, ?, ?, ?, ?, 'pending')";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("dsssi", $ride_id, $amount, $payment_method, $phone_number, $user_id);
}

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Payment submitted successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
}

// Close connection
$stmt->close();
$conn->close();
?>
