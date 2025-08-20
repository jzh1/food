<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小江美食店 - 手机点餐</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <!-- 公告栏 -->
    <div class="announcement-bar">
        <p>🎉 新店开业，全场8折！🎉</p>
    </div>

    <!-- 头部信息 -->
    <header class="header">
        <div class="logo">
            <img src="https://picsum.photos/id/292/100/100" alt="小江美食店">
        </div>
        <div class="store-info">
            <h1>小江美食店</h1>
            <p>美味佳肴，尽在这里</p>
        </div>
        <div class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">0</span>
        </div>
    </header>

    <!-- 主要内容区 -->
    <div class="main-content">
        <!-- Tab栏目 - 移至左侧 -->
        <div class="tab-container">
            <!-- 移除菜谱Tab -->
            <div class="tab" data-menu="果粒爱吃">果粒爱吃</div>
            <div class="tab" data-menu="宁宁爱吃">宁宁爱吃</div>
            <div class="tab active" data-menu="小江爱吃">小江爱吃</div>
            <div class="tab" data-menu="外卖">外卖</div>
            
            <!-- 添加设置按钮 -->
            <div class="settings-container">
                <div class="settings-btn">
                    <i class="fas fa-cog"></i> 设置
                </div>
                <div class="settings-menu">
                    <div class="settings-item" data-action="recipe">
                        <i class="fas fa-utensils"></i> 菜谱
                    </div>
                    <div class="settings-item" data-action="ingredients">
                        <i class="fas fa-shopping-basket"></i> 食材
                    </div>
                </div>
            </div>
        </div>

        <!-- 菜品展示区域 - 在右侧 -->
        <div class="dishes-container">
            <!-- 菜品将通过JavaScript动态加载 -->
        </div>
    </div>

    <script src="js/main.js"></script>
    <script src="js/main.js"></script>
</body>
</html>