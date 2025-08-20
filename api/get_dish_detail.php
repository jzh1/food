<?php
// 包含数据库连接文件
include '../includes/db.php';

// 初始化响应数组
$response = ['success' => false];

// 获取菜品ID参数
$dishId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($dishId > 0) {
    try {
        // 获取数据库连接
        $pdo = getDBConnection();
        
        // 准备SQL查询，获取菜品详情
        $stmt = $pdo->prepare("SELECT * FROM dishes WHERE id = :dishId");
        
        // 绑定参数
        $stmt->bindParam(':dishId', $dishId, PDO::PARAM_INT);
        
        // 执行查询
        $stmt->execute();
        
        // 获取查询结果
        $dish = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($dish) {
            $response['success'] = true;
            $response['dish'] = $dish;
        } else {
            $response['error'] = '未找到菜品信息';
        }
        
    } catch (PDOException $e) {
        // 处理数据库错误
        $response['error'] = '数据库错误: ' . $e->getMessage();
    }
} else {
    $response['error'] = '无效的菜品ID';
}

// 设置HTTP响应头
header('Content-Type: application/json');

// 输出JSON响应
echo json_encode($response);
?>