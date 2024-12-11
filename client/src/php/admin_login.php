<?php
// Start session
session_start();

// Set the response header to JSON
header('Content-Type: application/json');

// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "aglugan";

// Create connection to the database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Check if the user is already logged in
if (isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "success", "redirectUrl" => "../src/html/admin-dashboard.html"]);
    exit();
}

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ensure the required fields are set
    if (!isset($_POST['username']) || !isset($_POST['password'])) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit();
    }

    // Sanitize user inputs
    $username = htmlspecialchars($_POST['username']);
    $password = $_POST['password'];

    // Prepare the SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->bind_param("s", $username);

    // Execute the statement
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Fetch the user details
        $user = $result->fetch_assoc();

        // Verify the password
        if ($password === $user['password']) {
            // Password matches, regenerate session ID to prevent session fixation
            session_regenerate_id(true);

            // Store relevant user information in the session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];

            echo json_encode([
                "status" => "success",
                "redirectUrl" => '../html/admin-dashboard.html'
            ]);
        } else {
            // Invalid password
            echo json_encode(["status" => "error", "message" => "Invalid username or password."]);
        }
    } else {
        // Invalid username
        echo json_encode(["status" => "error", "message" => "Invalid username or password."]);
    }

    // Close the prepared statement
    $stmt->close();
}

// Close the connection
$conn->close();
?>