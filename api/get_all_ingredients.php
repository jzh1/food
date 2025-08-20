<?php
include '../includes/db.php';

try {
    $pdo = getDBConnection();
    
    // 查询所有食材
    $stmt = $pdo->prepare("SELECT * FROM ingredients ORDER BY id DESC");
    $stmt->execute();
    $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 计算每种状态的食材数量
    $statusCount = [
        '过期' => 0,
        '临期' => 0,
        '当季推荐' => 0
    ];
    
    foreach ($ingredients as &$ingredient) {
        // 确保日期格式正确
        if (!empty($ingredient['expiry_date'])) {
            $ingredient['expiry_date'] = date('Y-m-d', strtotime($ingredient['expiry_date']));
        }
        
        // 更新状态计数
        if (isset($statusCount[$ingredient['status']])) {
            $statusCount[$ingredient['status']]++;
        }
    }
    
    $response = [
        'ingredients' => $ingredients,
        'statusCount' => $statusCount
    ];
    
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}