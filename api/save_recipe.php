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
            // 更新现有菜谱 - 添加新字段
            $stmt = $pdo->prepare("UPDATE dishes SET name = :name, category = :category, price = :price, description = :description, image_url = :image_url, rating = :rating, sales = :sales, ingredients_ratio = :ingredients_ratio, cooking_steps = :cooking_steps WHERE id = :id");
            $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
            $dishId = $data['id'];
        } else {
            // 插入新菜谱 - 添加新字段
            $stmt = $pdo->prepare("INSERT INTO dishes (name, category, price, description, image_url, rating, sales, ingredients_ratio, cooking_steps) VALUES (:name, :category, :price, :description, :image_url, :rating, :sales, :ingredients_ratio, :cooking_steps)");
        }
        
        // 绑定参数
        $stmt->bindParam(':name', $data['name'], PDO::PARAM_STR);
        $stmt->bindParam(':category', $data['category'], PDO::PARAM_STR);
        $stmt->bindParam(':price', $data['price'], PDO::PARAM_STR);
        $stmt->bindParam(':description', $data['description'], PDO::PARAM_STR);
        $stmt->bindParam(':image_url', $data['image_url'], PDO::PARAM_STR);
        $stmt->bindParam(':rating', $data['rating'], PDO::PARAM_STR);
        $stmt->bindParam(':sales', $data['sales'], PDO::PARAM_INT);
        $stmt->bindParam(':ingredients_ratio', $data['ingredients_ratio'], PDO::PARAM_STR); // 绑定新字段
        $stmt->bindParam(':cooking_steps', $data['cooking_steps'], PDO::PARAM_STR); // 绑定新字段
        
        // 执行查询
        $stmt->execute();
        
        // 获取菜品ID
        if (empty($dishId)) {
            $dishId = $pdo->lastInsertId();
        }
        
        // 处理菜单关联
        if (isset($data['menus']) && is_array($data['menus'])) {
            // 删除旧的关联
            $stmt = $pdo->prepare("DELETE FROM menu_dish_relations WHERE dish_id = :dish_id");
            $stmt->bindParam(':dish_id', $dishId, PDO::PARAM_INT);
            $stmt->execute();
            
            // 获取菜单ID映射
            $menuMap = [
                '菜谱' => 1,
                '果粒爱吃' => 2,
                '宁宁爱吃' => 3,
                '小江爱吃' => 4,
                '外卖' => 5
            ];
            
            // 添加新的关联
            foreach ($data['menus'] as $menuName) {
                if (isset($menuMap[$menuName])) {
                    $menuId = $menuMap[$menuName];
                    $stmt = $pdo->prepare("INSERT INTO menu_dish_relations (menu_id, dish_id) VALUES (:menu_id, :dish_id)");
                    $stmt->bindParam(':menu_id', $menuId, PDO::PARAM_INT);
                    $stmt->bindParam(':dish_id', $dishId, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }
        }
        
        // 提交事务
        $pdo->commit();
        
        // 设置成功响应
        $response['success'] = true;
        
    } catch (PDOException $e) {
        // 回滚事务
        if (isset($pdo)) {
            $pdo->rollBack();
        }
        // 处理数据库错误
        $response['error'] = 'Database error: ' . $e->getMessage();
    }
} else {
    $response['error'] = 'No data received';
}

// 设置HTTP响应头
header('Content-Type: application/json');
echo json_encode($response);
?>