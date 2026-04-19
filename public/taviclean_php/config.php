<?php
// Configuração da Base de Dados - Hostinger
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_taviclean'); // Substitua pelos seus dados
define('DB_USER', 'u123456789_user');     // Substitua pelos seus dados
define('DB_PASS', 'sua_senha_aqui');       // Substitua pelos seus dados

function get_db_connection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die("Falha na conexão: " . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper para proteção de rotas
function check_auth() {
    if (!isset($_SESSION['admin_id'])) {
        header("Location: login.php");
        exit;
    }
}
?>
