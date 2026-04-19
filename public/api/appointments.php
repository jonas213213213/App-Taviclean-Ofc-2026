<?php
require_once 'config.php';
$conn = get_db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM appointments");
    $appts = [];
    while($row = $result->fetch_assoc()) {
        $row['checklist'] = $row['checklist'] ? json_decode($row['checklist']) : [];
        $row['price'] = (float)$row['price'];
        $appts[] = $row;
    }
    send_json($appts);
} 

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $checklist = json_encode($data['checklist'] ?? []);
    
    $stmt = $conn->prepare("REPLACE INTO appointments (id, date, startTime, endTime, customerName, customerPhoto, serviceType, address, city, status, price, checklist, contact, email, typology, isSpecial, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("sssssssssdsssssss", 
        $data['id'], $data['date'], $data['startTime'], $data['endTime'], 
        $data['customerName'], $data['customerPhoto'], $data['serviceType'], 
        $data['address'], $data['city'], $data['status'], $data['price'], 
        $checklist, $data['contact'], $data['email'], $data['typology'], 
        $data['isSpecial'], $data['comment']
    );
    
    $stmt->execute();
    send_json(["success" => true]);
} 

elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
    $stmt->bind_param("s", $id);
    $stmt->execute();
    send_json(["success" => true]);
}
?>
