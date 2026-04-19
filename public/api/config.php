<?php
// Ativar reporte de erros para ajudar no diagnóstico (Desativar em produção após funcionar)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não mostrar erros diretamente no output para não quebrar o JSON

// Configuração da Base de Dados para Hostinger (MySQL)
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_taviclean'); // Substitua pelo seu nome de BD da Hostinger
define('DB_USER', 'u123456789_user');     // Substitua pelo seu user de BD da Hostinger
define('DB_PASS', 'sua_senha_aqui');       // Substitua pela sua senha de BD da Hostinger

// Headers de CORS e JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=utf-8');

// Responder a pedidos OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

function get_db_connection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            send_json(["error" => "Falha na conexão: " . $conn->connect_error], 500);
        }
        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        send_json(["error" => "Erro de conexão: " . $e->getMessage()], 500);
    }
}

// Helper para enviar JSON com código de status
function send_json($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}
?>
