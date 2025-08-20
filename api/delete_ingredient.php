<?php
include '../includes/db.php';

// 初始化响应数组
$response = ['success' => false];

// 获取DELETE数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (isset($data['id'])) {
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("DELETE FROM ingredients WHERE id = :id");
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
        $stmt->execute();
        
        $response['success'] = true;
        $response['message'] = '食材删除成功';
    } catch (PDOException $e) {
        $response['error'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['error'] = 'Missing ingredient ID';
}

// 输出响应
header('Content-Type: application/json');
echo json_encode($response);