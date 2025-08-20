<?php
// 设置错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);
// 允许跨域访问（调试用）
header('Access-Control-Allow-Origin: *');

// 包含数据库连接文件
require_once 'includes/db.php';

// 获取菜单名称参数
$menuName = isset($_GET['menu']) ? $_GET['menu'] : '小江爱吃';
echo "当前查询的菜单：$menuName<br>";

// 获取数据库连接
$conn = getDBConnection();
echo "数据库连接成功！<br>";

// 查询菜品
try {
    $stmt = $conn->prepare("SELECT d.* FROM dishes d 
                            JOIN menu_dish_relations mdr ON d.id = mdr.dish_id 
                            JOIN menu_items mi ON mdr.menu_id = mi.id 
                            WHERE mi.name = :menuName");
    $stmt->bindParam(':menuName', $menuName);
    $stmt->execute();
    $dishes = $stmt->fetchAll();
    
    echo "查询到的菜品数量：" . count($dishes) . "<br>";
    echo "原始数据结构：<pre>" . print_r($dishes, true) . "</pre><br>";
    
    // 输出JSON格式的数据（这是API实际返回的内容）
    echo "<br><br><strong>JSON格式数据（API实际返回）:</strong><br>";
    $jsonData = json_encode($dishes);
    echo $jsonData;
    
} catch (PDOException $e) {
    echo "数据库错误：" . $e->getMessage() . "<br>";
}
?>