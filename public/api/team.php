<?php
require_once 'config.php';
$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM team");
    $team = [];
    while($row = $result->fetch_assoc()) {
        $team[] = $row;
    }
    send_json($team);
} 

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $conn->prepare("REPLACE INTO team (id, name, role, photo, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $data['id'], $data['name'], $data['role'], $data['photo'], $data['status']);
    $stmt->execute();
    send_json(["success" => true]);
} 

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    $stmt = $conn->prepare("DELETE FROM team WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    send_json(["success" => true]);
}
?>
