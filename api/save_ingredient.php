<?php
// 包含数据库连接文件
include '../includes/db.php';

// 初始化响应数组
$response = ['success' => false];

// 获取POST数据
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data) {
    try {
        // 获取数据库连接
        $pdo = getDBConnection();
        
        // 开始事务
        $pdo->beginTransaction();
        
        // 检查是否有ID，有则更新，无则插入
        if (!empty($data['id'])) {
            // 更新现有食材
            $stmt = $pdo->prepare("UPDATE ingredients SET name = :name, category = :category, weight = :weight, unit = :unit, expiry_date = :expiry_date, description = :description, image_url = :image_url, storage_method = :storage_method, status = :status WHERE id = :id");
            $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
        } else {
            // 插入新食材
            $stmt = $pdo->prepare("INSERT INTO ingredients (name, category, weight, unit, expiry_date, description, image_url, storage_method, status) VALUES (:name, :category, :weight, :unit, :expiry_date, :description, :image_url, :storage_method, :status)");
        }
        
        // 绑定参数
        $name = isset($data['name']) ? trim($data['name']) : '';
        if ($name === '') {
            throw new PDOException('食材名称为必填项');
        }
        $category = isset($data['category']) && trim($data['category']) !== '' ? trim($data['category']) : '未分类';
        $weight = isset($data['weight']) && $data['weight'] !== '' ? number_format((float)$data['weight'], 2, '.', '') : number_format(0, 2, '.', '');
        $unit = isset($data['unit']) && trim($data['unit']) !== '' ? trim($data['unit']) : 'kg';
        $expiry_date = isset($data['expiry_date']) && $data['expiry_date'] !== '' ? $data['expiry_date'] : date('Y-m-d');
        $description = isset($data['description']) ? trim($data['description']) : null;
        $image_url = isset($data['image_url']) ? trim($data['image_url']) : null;
        $storage_method = isset($data['storage_method']) ? trim($data['storage_method']) : null;
        $status = isset($data['status']) ? trim($data['status']) : '正常';

        $stmt->bindParam(':name', $name, PDO::PARAM_STR);
        $stmt->bindParam(':category', $category, PDO::PARAM_STR);
        $stmt->bindParam(':weight', $weight, PDO::PARAM_STR);
        $stmt->bindParam(':unit', $unit, PDO::PARAM_STR);
        $stmt->bindParam(':expiry_date', $expiry_date, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);
        $stmt->bindParam(':image_url', $image_url, PDO::PARAM_STR);
        $stmt->bindParam(':storage_method', $storage_method, PDO::PARAM_STR);
        $stmt->bindParam(':status', $status, PDO::PARAM_STR);
        
        // 执行查询
        $stmt->execute();
        
        // 提交事务
        $pdo->commit();
        
        $response['success'] = true;
        $response['message'] = !empty($data['id']) ? '食材更新成功' : '食材新增成功';
        
    } catch (PDOException $e) {
        // 回滚事务
        $pdo->rollBack();
        $response['error'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['error'] = 'No data received';
}

// 输出响应
header('Content-Type: application/json');
echo json_encode($response);
