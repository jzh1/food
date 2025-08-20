<?php
// 包含数据库连接文件
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'includes/db.php';

// 测试数据库连接
try {
    $conn = getDBConnection();
    echo "数据库连接成功！<br>";
    
    // 测试查询菜单
    $stmt = $conn->query("SELECT * FROM menu_items");
    $menus = $stmt->fetchAll();
    echo "菜单数量：" . count($menus) . "<br>";
    echo "菜单列表：<pre>" . print_r($menus, true) . "</pre><br>";
    
    // 测试查询菜品
    $menuName = '小江爱吃';
    $stmt = $conn->prepare("SELECT d.* FROM dishes d 
                            JOIN menu_dish_relations mdr ON d.id = mdr.dish_id 
                            JOIN menu_items mi ON mdr.menu_id = mi.id 
                            WHERE mi.name = :menuName");
    $stmt->bindParam(':menuName', $menuName);
    $stmt->execute();
    $dishes = $stmt->fetchAll();
    echo "\"小江爱吃\" 菜单下的菜品数量：" . count($dishes) . "<br>";
    echo "菜品列表：<pre>" . print_r($dishes, true) . "</pre><br>";
    
} catch (PDOException $e) {
    echo "数据库错误：" . $e->getMessage() . "<br>";
}
?>