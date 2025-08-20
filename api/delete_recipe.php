<?php
// 包含数据库连接文件
include '../includes/db.php';

// 初始化响应数组
$response = ['success' => false];

// 获取POST数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data && !empty($data['id'])) {
    try {
        // 获取数据库连接
        $pdo = getDBConnection();
        
        // 准备SQL查询，删除菜谱
        $stmt = $pdo->prepare("DELETE FROM dishes WHERE id = :id");
        
        // 绑定参数
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
        
        // 执行查询
        $stmt->execute();
        
        // 设置成功响应
        $response['success'] = true;
        
    } catch (PDOException $e) {
        // 处理数据库错误
        $response['error'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['error'] = 'No ID received';
}

// 设置HTTP响应头
header('Content-Type: application/json');

// 输出JSON响应
echo json_encode($response);
?>