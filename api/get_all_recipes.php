<?php
include '../includes/db.php';

try {
    $pdo = getDBConnection();
    
    // 查询所有菜品及关联的菜单信息
    $stmt = $pdo->prepare("
        SELECT d.*, GROUP_CONCAT(m.id) as menu_ids, GROUP_CONCAT(m.name) as menu_names 
        FROM dishes d 
        LEFT JOIN menu_dish_relations r ON d.id = r.dish_id 
        LEFT JOIN menu_items m ON r.menu_id = m.id 
        GROUP BY d.id
    ");
    $stmt->execute();
    $dishes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 处理菜单ID数据，转换为数组
    foreach ($dishes as &$dish) {
        if (!empty($dish['menu_ids'])) {
            $dish['menu_ids'] = explode(',', $dish['menu_ids']);
            $dish['menu_names'] = explode(',', $dish['menu_names']);
        } else {
            $dish['menu_ids'] = [];
            $dish['menu_names'] = [];
        }
    }
    
    echo json_encode($dishes);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}