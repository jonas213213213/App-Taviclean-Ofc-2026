<?php
require_once 'config.php';
$conn = get_db_connection();

$queries = [
    "CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        photo TEXT,
        contact VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        district VARCHAR(100),
        municipality VARCHAR(100)
    )",
    "CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        date VARCHAR(20) NOT NULL,
        startTime VARCHAR(10) NOT NULL,
        endTime VARCHAR(10),
        customerName VARCHAR(255) NOT NULL,
        customerPhoto TEXT,
        serviceType VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        status VARCHAR(50),
        price DECIMAL(10,2),
        checklist TEXT,
        contact VARCHAR(50),
        email VARCHAR(255),
        typology VARCHAR(50),
        isSpecial VARCHAR(10),
        comment TEXT
    )",
    "CREATE TABLE IF NOT EXISTS team (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100),
        photo TEXT,
        status VARCHAR(50)
    )",
    "CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        message TEXT,
        time VARCHAR(50),
        unread TINYINT(1) DEFAULT 1
    )"
];

echo "<h2>Inicializando Base de Dados...</h2>";

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "<p style='color:green'>Tabela criada com sucesso.</p>";
    } else {
        echo "<p style='color:red'>Erro ao criar tabela: " . $conn->error . "</p>";
    }
}

echo "<br><p><b>Importante:</b> Após rodar este script, apague o arquivo <code>api/setup.php</code> por segurança.</p>";
?>
