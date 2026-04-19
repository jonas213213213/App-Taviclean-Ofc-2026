<?php
// Configuração da Base de Dados para Hostinger (MySQL)
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_taviclean'); // Substitua pelo seu nome de BD da Hostinger
define('DB_USER', 'u123456789_user');     // Substitua pelo seu user de BD da Hostinger
define('DB_PASS', 'sua_senha_aqui');       // Substitua pela sua senha de BD da Hostinger

function get_db_connection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die(json_encode(["error" => "Falha na conexão: " . $conn->connect_error]));
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Helper para enviar JSON
function send_json($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
?>
