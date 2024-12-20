<?php
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Prevent browser from caching the page
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not logged in."]);
    exit();
}

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Internal server error."]);
    error_log("Connection failed: " . $conn->connect_error);
    exit();
}

// Get the user ID from the session
$user_id = $_SESSION['user_id'];

// Fetch the user's name and email from the `users` table
$user_sql = "SELECT name, email FROM users WHERE user_id = ?";
$stmt = $conn->prepare($user_sql);
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Internal server error."]);
    error_log("Prepare statement failed: " . $conn->error);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$user_result = $stmt->get_result();
$user_data = $user_result->fetch_assoc();

// If no user data is found, log an error
if (!$user_data) {
    echo json_encode(["status" => "error", "message" => "User data not found."]);
    error_log("User data not found for user ID: " . $user_id);
    $stmt->close();
    $conn->close();
    exit();
}

// Fetch available rides for this user
$query = "SELECT ride_id, start_location, end_location, status, time_range, waiting_time FROM rides WHERE status IN ('scheduled', 'loading')";
$rides_result = $conn->query($query);

$rides = [];
if ($rides_result && $rides_result->num_rows > 0) {
    while ($row = $rides_result->fetch_assoc()) {
        $rides[] = $row;
    }
} else {
    error_log("No rides found in the query result.");
}

// Fetch payment history for the logged-in user
$payment_sql = "SELECT ride_id, amount, payment_method, status FROM payments WHERE user_id = ?";
$payment_stmt = $conn->prepare($payment_sql);
if (!$payment_stmt) {
    echo json_encode(["status" => "error", "message" => "Internal server error."]);
    error_log("Prepare statement failed for payments: " . $conn->error);
    $stmt->close();
    $conn->close();
    exit();
}

$payment_stmt->bind_param("i", $user_id);
$payment_stmt->execute();
$payment_result = $payment_stmt->get_result();
$payments = [];
while ($row = $payment_result->fetch_assoc()) {
    $payments[] = $row;
}

// Combine user, ride, and payment history data into a single response
$response = [
    "status" => "success",
    "user" => $user_data,
    "rides" => $rides,
    "payments" => $payments
];

// Return the data as JSON
echo json_encode($response);

// Close the statements and connection
$stmt->close();
$payment_stmt->close();
$conn->close();
?>
