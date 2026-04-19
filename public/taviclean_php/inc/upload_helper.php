<?php
require_once 'config.php';
check_auth();

function upload_image($file, $target_dir = "uploads/") {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!in_array($extension, $allowed)) {
        return null;
    }

    $filename = uniqid() . '.' . $extension;
    $target_file = $target_dir . $filename;

    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        return $target_file;
    }

    return null;
}
?>
