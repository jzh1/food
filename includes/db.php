<?php
// 包含配置文件
require_once 'config.php';

// 创建数据库连接
function getDBConnection() {
    if (!extension_loaded('pdo_mysql')) {
        throw new PDOException('数据库连接失败: 未启用pdo_mysql扩展');
    }
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    $user = DB_USER;
    $pass = DB_PASS;
    $db = DB_NAME;
    $hosts = [DB_HOST, '127.0.0.1', 'localhost'];
    $sockets = ['/var/run/mysqld/mysqld.sock', '/tmp/mysql.sock'];
    $attempts = [];
    foreach ($hosts as $h) {
        if ($h) {
            $attempts[] = "mysql:host=" . $h . ";dbname=" . $db . ";charset=utf8mb4";
        }
    }
    foreach ($sockets as $s) {
        if (file_exists($s)) {
            $attempts[] = "mysql:unix_socket=" . $s . ";dbname=" . $db . ";charset=utf8mb4";
        }
    }
    $lastError = null;
    foreach ($attempts as $dsn) {
        try {
            $conn = new PDO($dsn, $user, $pass, $options);
            return $conn;
        } catch (PDOException $e) {
            $lastError = $e;
        }
    }
    throw new PDOException('数据库连接失败: ' . ($lastError ? $lastError->getMessage() : '未知错误'));
}
?>
