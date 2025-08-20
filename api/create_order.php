<?php
// 允许跨域请求
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// 包含数据库连接文件
require_once '../includes/db.php';

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => '只允许POST请求']);
    exit;
}

// 获取请求数据
$data = json_decode(file_get_contents('php://input'), true);

// 验证数据
if (!isset($data['cart_items']) || empty($data['cart_items'])) {
    http_response_code(400);
    echo json_encode(['error' => '购物车为空']);
    exit;
}

// 获取购物车项目
$cartItems = $data['cart_items'];
$customerName = isset($data['customer_name']) ? $data['customer_name'] : '';
$contactNumber = isset($data['contact_number']) ? $data['contact_number'] : '';
$address = isset($data['address']) ? $data['address'] : '';
$remark = isset($data['remark']) ? $data['remark'] : '';

// 计算订单总金额
$totalAmount = 0;
foreach ($cartItems as $item) {
    $itemPrice = isset($item['price']) ? (float)$item['price'] : 0;
    $itemQuantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;
    $totalAmount += $itemPrice * $itemQuantity;
}

// 生成订单编号
$orderNo = 'ORD' . date('YmdHis') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

// 创建数据库连接
$conn = getDBConnection();

try {
    // 开始事务
    $conn->beginTransaction();

    // 插入订单主表
    $stmt = $conn->prepare("INSERT INTO orders (order_no, total_amount, order_time, status, customer_name, contact_number, address, remark) VALUES (:order_no, :total_amount, NOW(), '待支付', :customer_name, :contact_number, :address, :remark)");
    $stmt->bindParam(':order_no', $orderNo);
    $stmt->bindParam(':total_amount', $totalAmount);
    $stmt->bindParam(':customer_name', $customerName);
    $stmt->bindParam(':contact_number', $contactNumber);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':remark', $remark);
    $stmt->execute();

    // 获取订单ID
    $orderId = $conn->lastInsertId();

    // 插入订单附表，缓存菜品信息
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, dish_id, dish_name, dish_price, quantity, total_price, dish_image_url, dish_description) VALUES (:order_id, :dish_id, :dish_name, :dish_price, :quantity, :total_price, :dish_image_url, :dish_description)");

    // 准备更新菜品销量的语句
    $updateSalesStmt = $conn->prepare("UPDATE dishes SET sales = sales + :quantity WHERE id = :dish_id");

    foreach ($cartItems as $item) {
        $dishId = isset($item['id']) ? $item['id'] : 0;
        $dishName = isset($item['name']) ? $item['name'] : '未知菜品';
        $dishPrice = isset($item['price']) ? (float)$item['price'] : 0;
        $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;
        $itemTotalPrice = $dishPrice * $quantity;
        $dishImageUrl = isset($item['image_url']) ? $item['image_url'] : '';
        $dishDescription = isset($item['description']) ? $item['description'] : '';

        // 插入订单项目
        $stmt->bindParam(':order_id', $orderId);
        $stmt->bindParam(':dish_id', $dishId);
        $stmt->bindParam(':dish_name', $dishName);
        $stmt->bindParam(':dish_price', $dishPrice);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':total_price', $itemTotalPrice);
        $stmt->bindParam(':dish_image_url', $dishImageUrl);
        $stmt->bindParam(':dish_description', $dishDescription);
        $stmt->execute();
        
        // 更新菜品销量
        $updateSalesStmt->bindParam(':dish_id', $dishId);
        $updateSalesStmt->bindParam(':quantity', $quantity);
        $updateSalesStmt->execute();
    }

    // 提交事务
    $conn->commit();

    // 返回成功响应
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'order_no' => $orderNo,
        'total_amount' => number_format($totalAmount, 2, '.', '')
    ]);

} catch (PDOException $e) {
    // 回滚事务
    $conn->rollBack();

    // 返回错误响应
    http_response_code(500);
    echo json_encode(['error' => '创建订单失败: ' . $e->getMessage()]);
}
?>