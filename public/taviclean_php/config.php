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

// Sistema de Log
function write_log($message, $type = 'info') {
    $conn = get_db_connection();
    $timestamp = date('Y-m-d H:i:s');
    // Guardar em um arquivo também para redundância
    $log_entry = "[$timestamp] [$type] $message" . PHP_EOL;
    file_put_contents(__DIR__ . '/debug.log', $log_entry, FILE_APPEND);
    
    // Inserir na tabela de notificações para feedback UI
    $stmt = $conn->prepare("INSERT INTO notifications (title, message, unread) VALUES (?, ?, 1)");
    $title = strtoupper($type) . ": Log do Sistema";
    $stmt->bind_param("ss", $title, $message);
    $stmt->execute();
}

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper para Mensagens Flash (Notificações)
function set_flash_message($message, $type = 'success') {
    $_SESSION['flash_message'] = $message;
    $_SESSION['flash_type'] = $type;
}

// Helper para proteção de rotas
function check_auth() {
    if (!isset($_SESSION['admin_id'])) {
        header("Location: login.php");
        exit;
    }
}
?>
