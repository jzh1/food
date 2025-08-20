<?php
// 包含数据库连接文件
include '../includes/db.php';

// 获取菜单名称参数
$menuName = isset($_GET['menu']) ? $_GET['menu'] : '小江爱吃';

// 初始化响应数组
$response = [];

try {
    // 获取数据库连接
    $pdo = getDBConnection();
    
    // 准备SQL查询，通过菜单名称获取菜品
    $stmt = $pdo->prepare("SELECT d.* FROM dishes d
                           JOIN menu_dish_relations mdr ON d.id = mdr.dish_id
                           JOIN menu_items mi ON mdr.menu_id = mi.id
                           WHERE mi.name = :menuName");
    
    // 绑定参数
    $stmt->bindParam(':menuName', $menuName, PDO::PARAM_STR);
    
    // 执行查询
    $stmt->execute();
    
    // 获取查询结果
    $dishes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 设置响应数据
    $response = $dishes;
    
} catch (PDOException $e) {
    // 处理数据库错误
    $response['error'] = 'Database error: ' . $e->getMessage();
}

// 设置HTTP响应头
header('Content-Type: application/json');

// 输出JSON响应
echo json_encode($response);
?>