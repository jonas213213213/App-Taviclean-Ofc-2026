<?php
require_once 'config.php';
$conn = get_db_connection();

$queries = [
    "CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100)
    )",
    "CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        photo TEXT,
        contact VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        district VARCHAR(100),
        municipality VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS team (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100),
        photo TEXT,
        status VARCHAR(50) DEFAULT 'Ativo'
    )",
    "CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        date DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME,
        customer_id VARCHAR(50),
        customerName VARCHAR(255),
        serviceType VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Pendente',
        price DECIMAL(10,2),
        checklist TEXT,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    )",
    "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        message TEXT,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unread TINYINT(1) DEFAULT 1
    )"
];

echo "<h1>Instalador TaviClean PHP</h1>";

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color:green'>Sucesso: Tabela criada ou já existente.</p>";
    } else {
        echo "<p style='color:red'>Erro: " . $conn->error . "</p>";
    }
}

// Inserir Admin padrão se não existir (senha: admin123)
$pass = password_hash('admin123', PASSWORD_DEFAULT);
$conn->query("INSERT IGNORE INTO admin (username, password, name) VALUES ('admin', '$pass', 'Administrador')");

echo "<br><p><b>IMPORTANTE:</b> Elimine este ficheiro (install.php) após a instalação.</p>";
echo "<a href='index.php'>Ir para a página inicial</a>";
?>
