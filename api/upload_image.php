<?php
// 设置响应头
header('Content-Type: application/json');

// 定义上传目录
$uploadDir = '../uploads/';

// 确保上传目录存在
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// 检查是否有文件上传
if (!isset($_FILES['image'])) {
    echo json_encode(['success' => false, 'error' => '没有文件上传']);
    exit;
}

$file = $_FILES['image'];

// 检查上传错误
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = '';
    switch ($file['error']) {
        case UPLOAD_ERR_INI_SIZE:
            $errorMsg = '文件大小超过了PHP配置的最大限制';
            break;
        case UPLOAD_ERR_FORM_SIZE:
            $errorMsg = '文件大小超过了表单指定的最大限制';
            break;
        case UPLOAD_ERR_PARTIAL:
            $errorMsg = '文件仅部分上传';
            break;
        case UPLOAD_ERR_NO_FILE:
            $errorMsg = '没有文件上传';
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $errorMsg = '缺少临时文件夹';
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $errorMsg = '文件写入失败';
            break;
        case UPLOAD_ERR_EXTENSION:
            $errorMsg = '文件上传被PHP扩展停止';
            break;
        default:
            $errorMsg = '未知错误';
            break;
    }
    echo json_encode(['success' => false, 'error' => $errorMsg]);
    exit;
}

// 检查文件类型
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
// 创建文件信息资源
$finfo = finfo_open(FILEINFO_MIME_TYPE);
// 使用finfo_file获取MIME类型
$fileType = finfo_file($finfo, $file['tmp_name']);
// 关闭文件信息资源
finfo_close($finfo);
if (!in_array($fileType, $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => '只允许上传JPG、PNG、GIF和WebP格式的图片']);
    exit;
}

// 重命名文件，避免文件名冲突
$fileName = uniqid('recipe_') . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
$filePath = $uploadDir . $fileName;

// 移动上传的文件
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    // 生成可访问的URL路径
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . str_replace('api/upload_image.php', '', $_SERVER['PHP_SELF']);
    $imageUrl = $baseUrl . 'uploads/' . $fileName;
    
    echo json_encode(['success' => true, 'image_url' => $imageUrl]);
} else {
    echo json_encode(['success' => false, 'error' => '文件移动失败']);
}