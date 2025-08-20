// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    // 初始化页面
    init();
});

function init() {
    console.log('初始化函数被调用');
    // 加载默认菜单项的菜品
    loadDishes('小江爱吃');

    // 为Tab添加点击事件
    const tabs = document.querySelectorAll('.tab');
    console.log('找到的Tab数量:', tabs.length);
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log('Tab被点击:', this.textContent.trim());
            // 移除所有Tab的active类
            tabs.forEach(t => t.classList.remove('active'));
            // 为当前Tab添加active类
            this.classList.add('active');
            // 加载对应菜单项的菜品
            const menuName = this.getAttribute('data-menu');
            console.log('从data-menu属性获取的菜单名称:', menuName);
            loadDishes(menuName);
        });
    });
}

// 加载菜品
function loadDishes(menuName) {
    console.log('加载菜品函数被调用，菜单名称:', menuName);
    // 显示加载状态
    const dishesContainer = document.querySelector('.dishes-container');
    console.log('菜品容器:', dishesContainer);
    dishesContainer.innerHTML = '<div class="loading">加载中...</div>';

    // 发送AJAX请求获取菜品
    const url = 'api/get_dishes.php?menu=' + encodeURIComponent(menuName);
    console.log('API请求URL:', url);
    
    fetch(url)
        .then(response => {
            console.log('API响应状态:', response.status);
            return response.json().then(data => {
                console.log('API返回的原始数据:', data);
                return data;
            });
        })
        .then(data => {
            // 清空容器
            dishesContainer.innerHTML = '';
            console.log('清空容器后的innerHTML:', dishesContainer.innerHTML);

            // 检查是否有菜品
            if (!data || data.length === 0) {
                console.log('没有找到菜品数据');
                dishesContainer.innerHTML = '<div class="no-data">暂无菜品</div>';
                return;
            }

            console.log('找到的菜品数量:', data.length);
            console.log('第一个菜品数据:', data[0]);
            
            // 遍历菜品数据并添加到容器
            data.forEach(dish => {
                console.log('处理菜品:', dish.name);
                console.log('菜品价格类型:', typeof dish.price);
                
                const dishItem = document.createElement('div');
                dishItem.className = 'dish-item';
                // 确保价格是数字类型
                const price = parseFloat(dish.price);
                console.log('转换后的价格:', price, typeof price);
                
                // 使用image_url字段
                const imageUrl = dish.image_url || 'https://picsum.photos/id/292/300/300';
                
                // 构建HTML内容
                const htmlContent = `
                    <img src="${imageUrl}" alt="${dish.name}" class="dish-image">
                    <div class="dish-info">
                        <div class="dish-name">${dish.name}</div>
                        <div class="dish-desc">${dish.description || '暂无描述'}</div>
                        <div class="dish-price">¥${price.toFixed(2)}</div>
                        <div class="dish-meta">
                            <span class="dish-rating">评分: ${dish.rating}</span>
                            <span class="dish-sales">销量: ${dish.sales}</span>
                        </div>
                        <button class="add-to-cart" data-id="${dish.id}">加入购物车</button>
                    </div>
                `;
                
                console.log('生成的HTML:', htmlContent);
                dishItem.innerHTML = htmlContent;
                
                // 确认元素被创建
                console.log('创建的dishItem元素:', dishItem);
                
                // 添加到容器
                dishesContainer.appendChild(dishItem);
                console.log('元素已添加到容器');
            });

            // 为加入购物车按钮添加点击事件
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    addToCart(this.getAttribute('data-id'));
                });
            });
        })
        .catch(error => {
            console.error('加载菜品时出错:', error);
            dishesContainer.innerHTML = '<div class="error">加载失败，请重试</div>';
        });
}

// 添加到购物车
function addToCart(dishId) {
    // 这里简化处理
    const cartCount = document.querySelector('.cart-count');
    let count = parseInt(cartCount.textContent);
    cartCount.textContent = count + 1;

    // 显示添加成功提示
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = '已添加到购物车';
    document.body.appendChild(toast);

    // 3秒后移除提示
    setTimeout(() => {
        toast.remove();
    }, 3000);
}