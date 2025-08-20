<?php
// 包含数据库连接文件
include '../includes/db.php';

// 设置跨域请求头
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理OPTIONS请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// 初始化响应数组
$response = ['success' => false];

try {
    // 获取数据库连接
    $pdo = getDBConnection();
    
    // 根据请求方法处理不同操作
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // 获取菜品ID参数
        $dishId = isset($_GET['dish_id']) ? intval($_GET['dish_id']) : 0;
        
        if ($dishId > 0) {
            // 准备SQL查询，获取指定菜品的所有评论
            $stmt = $pdo->prepare("SELECT * FROM reviews WHERE dish_id = :dishId ORDER BY created_at DESC");
            
            // 绑定参数
            $stmt->bindParam(':dishId', $dishId, PDO::PARAM_INT);
            
            // 执行查询
            $stmt->execute();
            
            // 获取查询结果
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response['success'] = true;
            $response['reviews'] = $reviews;
        } else {
            $response['error'] = '无效的菜品ID';
        }
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // 获取POST数据
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // 验证数据
        if (isset($data['dish_id']) && isset($data['content'])) {
            $dishId = intval($data['dish_id']);
            $content = trim($data['content']);
            
            if ($dishId > 0 && !empty($content)) {
                // 准备SQL插入语句
                $stmt = $pdo->prepare("INSERT INTO reviews (dish_id, content) VALUES (:dishId, :content)");
                
                // 绑定参数
                $stmt->bindParam(':dishId', $dishId, PDO::PARAM_INT);
                $stmt->bindParam(':content', $content, PDO::PARAM_STR);
                
                // 执行插入
                $stmt->execute();
                
                $response['success'] = true;
                $response['message'] = '评论添加成功';
            } else {
                $response['error'] = '无效的评论数据';
            }
        } else {
            $response['error'] = '缺少必要的评论数据';
        }
    }
    
} catch (PDOException $e) {
    // 处理数据库错误
    $response['error'] = '数据库错误: ' . $e->getMessage();
}

// 设置HTTP响应头
header('Content-Type: application/json');

// 输出JSON响应
echo json_encode($response);
?>