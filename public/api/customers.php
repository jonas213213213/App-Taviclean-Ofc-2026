<?php
require_once 'config.php';
$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM customers");
    $customers = [];
    while($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }
    send_json($customers);
} 

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $conn->prepare("REPLACE INTO customers (id, name, photo, contact, email, address, district, municipality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", 
        $data['id'], $data['name'], $data['photo'], $data['contact'], 
        $data['email'], $data['address'], $data['district'], $data['municipality']
    );
    $stmt->execute();
    send_json(["success" => true]);
} 

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    send_json(["success" => true]);
}
?>
