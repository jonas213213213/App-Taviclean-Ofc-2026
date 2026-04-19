<?php
require_once 'config.php';
$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM notifications ORDER BY time DESC");
    $notifications = [];
    while($row = $result->fetch_assoc()) {
        $row['unread'] = (bool)$row['unread'];
        $notifications[] = $row;
    }
    send_json($notifications);
} 

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $unread = $data['unread'] ? 1 : 0;
    $stmt = $conn->prepare("REPLACE INTO notifications (id, title, message, time, unread) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $data['id'], $data['title'], $data['message'], $data['time'], $unread);
    $stmt->execute();
    send_json(["success" => true]);
}
?>
