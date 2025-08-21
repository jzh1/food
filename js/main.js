// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    init();
});

// 全局变量定义
let dishesData = [];

// 在init函数末尾添加设置按钮的点击事件处理
function init() {
    // 初始化购物车
    initCart();
    
    // 加载默认菜单项的菜品
    loadDishes('小江爱吃');
    
    // 初始化菜品详情弹窗
    initDishDetail();
    
    // 添加Tab切换功能
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有Tab的active类
            tabs.forEach(t => t.classList.remove('active'));
            // 为当前Tab添加active类
            this.classList.add('active');
            // 加载对应菜单项的菜品
            const menuName = this.getAttribute('data-menu');
            if (menuName) {
                loadDishes(menuName);
            }
        });
    });
    
    // 添加设置按钮的点击事件处理
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsMenu = document.querySelector('.settings-menu');
    
    if (settingsBtn && settingsMenu) {
        // 点击设置按钮显示/隐藏设置菜单
        settingsBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            settingsMenu.classList.toggle('show');
        });
        
        // 点击设置菜单项的处理
        document.querySelectorAll('.settings-item').forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                if (action === 'recipe') {
                    window.location.href = 'recipe.html';
                } else if (action === 'ingredients') {
                    window.location.href = 'ingredients.html';
                }
            });
        });
        
        // 点击页面其他区域关闭设置菜单
        document.addEventListener('click', function() {
            if (settingsMenu.classList.contains('show')) {
                settingsMenu.classList.remove('show');
            }
        });
    }
}

// 初始化菜品详情弹窗
function initDishDetail() {
    // 避免重复创建弹窗
    if (document.querySelector('.dish-detail-overlay')) {
        return;
    }
    
    // 创建菜品详情弹窗
    const dishDetailOverlay = document.createElement('div');
    dishDetailOverlay.className = 'dish-detail-overlay';
    dishDetailOverlay.innerHTML = `
        <div class="dish-detail-content">
            <div class="dish-detail-header">
                <h2 id="dish-detail-name"></h2>
                <button class="close-detail">×</button>
            </div>
            <div class="dish-detail-body">
                <div class="dish-detail-image-container">
                    <img id="dish-detail-image" src="" alt="菜品图片">
                </div>
                <div class="dish-detail-info">
                    <div class="dish-detail-price" id="dish-detail-price"></div>
                    <div class="dish-detail-meta">
                        <span class="dish-detail-rating" id="dish-detail-rating">评分: </span>
                        <span class="dish-detail-sales" id="dish-detail-sales">销量: </span>
                    </div>
                    <div class="dish-detail-description" id="dish-detail-description"></div>
                    
                    <!-- 食材用量比例 -->
                    <div class="dish-detail-section">
                        <h3>食材用量比例</h3>
                        <pre id="dish-detail-ingredients"></pre>
                    </div>
                    
                    <!-- 做法步骤 -->
                    <div class="dish-detail-section">
                        <h3>做法步骤</h3>
                        <pre id="dish-detail-steps"></pre>
                    </div>
                    
                    <!-- 评论区域 -->
                    <div class="dish-detail-section">
                        <h3>用户评论</h3>
                        <div class="reviews-container" id="reviews-container"></div>
                        
                        <!-- 添加评论表单 -->
                        <div class="add-review-form">
                            <textarea id="review-content" placeholder="请输入您的评论..."></textarea>
                            <button id="submit-review">提交评论</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="dish-detail-footer">
                <button class="add-to-cart-detail">加入购物车</button>
            </div>
        </div>
    `;
    document.body.appendChild(dishDetailOverlay);
    
    // 关闭按钮点击事件
    const closeButton = document.querySelector('.close-detail');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const overlay = document.querySelector('.dish-detail-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        });
    }
    
    // 点击模态框外部关闭
    dishDetailOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
    
    // 提交评论按钮点击事件
    const submitReviewButton = document.getElementById('submit-review');
    if (submitReviewButton) {
        submitReviewButton.addEventListener('click', submitReview);
    }
    
    // 加入购物车按钮点击事件
    const addToCartButton = document.querySelector('.add-to-cart-detail');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', function() {
            const dishId = this.getAttribute('data-id');
            if (dishId) {
                addToCart(dishId);
            }
        });
    }
}

// 显示菜品详情
function showDishDetail(dishId) {
    // 找到菜品详情模态框
    const dishDetailModal = document.getElementById('dish-detail-modal');
    const dishDetailBody = document.querySelector('.dish-detail-body');
    
    if (!dishDetailModal || !dishDetailBody) {
        console.error('未找到菜品详情模态框');
        return;
    }
    
    // 显示加载状态
    dishDetailBody.innerHTML = '<div class="loading">加载中...</div>';
    
    // 显示模态框
    dishDetailModal.style.display = 'block';
    
    // 从API获取菜品详情
    fetch(`api/get_dish_detail.php?id=${dishId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误: ' + response.status);
            }
            
            // 先尝试获取原始文本，检查是否包含HTML标签
            return response.text().then(text => {
                try {
                    // 尝试解析JSON
                    return JSON.parse(text);
                } catch (jsonError) {
                    // 如果不是有效JSON，抛出包含原始文本的错误
                    throw new Error('无效的JSON响应: ' + text.substring(0, 100) + '...');
                }
            });
        })
        .then(data => {
            if (data.success && data.dish) {
                const dish = data.dish;
                
                // 显示菜品详情
                dishDetailBody.innerHTML = `
                    <img src="${dish.image_url || 'https://picsum.photos/id/42/300/200'}" alt="${dish.name}" class="dish-detail-image">
                    <div class="dish-detail-info">
                        <h3>${dish.name}</h3>
                        <div class="dish-detail-price">¥${parseFloat(dish.price).toFixed(2)}</div>
                        <div class="dish-detail-meta">
                            <span class="dish-detail-rating">评分: ${dish.rating}</span>
                            <span class="dish-detail-sales">销量: ${dish.sales}</span>
                        </div>
                        <div class="dish-detail-desc">${dish.description || '暂无描述'}</div>
                        ${dish.ingredients_ratio ? `<div class="dish-detail-ingredients"><strong>食材用量比例:</strong> ${dish.ingredients_ratio}</div>` : ''}
                        ${dish.cooking_steps ? `<div class="dish-detail-steps"><strong>做法步骤:</strong> ${dish.cooking_steps}</div>` : ''}
                        <button class="add-to-cart-detail" data-id="${dish.id}">加入购物车</button>
                    </div>
                    <div class="reviews-section">
                        <h4>用户评论</h4>
                        <div id="reviews-container"></div>
                        <div class="review-input-section">
                            <textarea id="review-content" placeholder="请输入评论..."></textarea>
                            <button id="submit-review">提交评论</button>
                        </div>
                    </div>
                `;
                
                // 为加入购物车按钮添加点击事件
                const addToCartButton = document.querySelector('.add-to-cart-detail');
                if (addToCartButton) {
                    addToCartButton.addEventListener('click', function(e) {
                        e.stopPropagation();
                        addToCart(this.getAttribute('data-id'));
                    });
                }
                
                // 获取并显示评论
                const reviewsContainer = dishDetailBody.querySelector('#reviews-container');
                if (reviewsContainer) {
                    loadReviews(dish.id);
                }
                
                // 重新为提交评论按钮添加事件监听
                const submitReviewButton = document.getElementById('submit-review');
                if (submitReviewButton) {
                    submitReviewButton.addEventListener('click', function() {
                        submitReview(dish.id);
                    });
                }
            } else {
                dishDetailBody.innerHTML = `<div class="error">${data.error || '加载失败'}</div>`;
            }
        })
        .catch(error => {
            console.error('加载菜品详情错误:', error);
            // 显示友好的错误信息，不暴露详细错误
            dishDetailBody.innerHTML = '<div class="error">加载失败，请重试</div>';
        });
    
    // 关闭按钮点击事件
    const closeButton = document.querySelector('.close-dish-detail');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            dishDetailModal.style.display = 'none';
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === dishDetailModal) {
            dishDetailModal.style.display = 'none';
        }
    });
}

// 加载菜品评论
function loadReviews(dishId) {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '<div class="loading">加载评论中...</div>';
    
    fetch(`api/reviews.php?dish_id=${dishId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const reviews = data.reviews;
                
                if (reviews.length === 0) {
                    reviewsContainer.innerHTML = '<div class="empty-reviews">暂无评论，快来发表第一条评论吧！</div>';
                    return;
                }
                
                reviewsContainer.innerHTML = '';
                
                reviews.forEach(review => {
                    const reviewItem = document.createElement('div');
                    reviewItem.className = 'review-item';
                    
                    // 格式化日期
                    const date = new Date(review.created_at);
                    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    
                    reviewItem.innerHTML = `
                        <div class="review-content">${review.content}</div>
                        <div class="review-time">${formattedDate}</div>
                    `;
                    
                    reviewsContainer.appendChild(reviewItem);
                });
            } else {
                reviewsContainer.innerHTML = `<div class="error">${data.error || '加载评论失败'}</div>`;
            }
        })
        .catch(error => {
            console.error('加载评论错误:', error);
            reviewsContainer.innerHTML = '<div class="error">加载评论失败，请重试</div>';
        });
}

// 提交评论
function submitReview(dishId) {
    const reviewContent = document.getElementById('review-content').value.trim();
    
    if (!dishId || !reviewContent) {
        showToast('请输入评论内容');
        return;
    }
    
    // 显示提交中状态
    const submitButton = document.getElementById('submit-review');
    const originalText = submitButton.textContent;
    submitButton.textContent = '提交中...';
    submitButton.disabled = true;
    
    fetch('api/reviews.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dish_id: dishId,
            content: reviewContent
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        return response.json();
    })
    .then(data => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        if (data.success) {
            showToast('评论提交成功');
            document.getElementById('review-content').value = '';
            // 重新加载评论
            loadReviews(dishId);
        } else {
            showToast('评论提交失败: ' + (data.error || '未知错误'));
        }
    })
    .catch(error => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        console.error('提交评论错误:', error);
        showToast('评论提交失败，请重试');
    });
}

// 显示提示信息
function showToast(message) {
    // 检查是否已存在toast元素
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    // 显示toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.visibility = 'visible';
    }, 10);
    
    // 3秒后隐藏toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.visibility = 'hidden';
    }, 3000);
}

// 加载菜品列表
function loadDishes(menuName) {
    // 显示加载状态
    const dishesContainer = document.querySelector('.dishes-container');
    dishesContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    fetch(`api/get_dishes.php?menu=${encodeURIComponent(menuName)}`)
        .then(response => {
            // 确保响应正常
            if (!response.ok) {
                throw new Error('网络响应错误: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // 保存菜品数据到全局变量
            dishesData = data;
            
            // 清空容器
            dishesContainer.innerHTML = '';
            
            if (data.length === 0) {
                dishesContainer.innerHTML = '<div class="empty">当前菜单暂无菜品</div>';
                return;
            }
            
            // 渲染菜品列表
            data.forEach(dish => {
                const dishItem = document.createElement('div');
                dishItem.className = 'dish-item';
                dishItem.setAttribute('data-id', dish.id); // 添加data-id属性
                
                // 设置图片URL，有默认值
                const imageUrl = dish.image_url ? dish.image_url : 'https://picsum.photos/id/42/200/200';
                const price = parseFloat(dish.price);
                
                dishItem.innerHTML = `
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
                dishesContainer.appendChild(dishItem);
                
                // 为菜品项添加点击事件（排除加入购物车按钮）
                dishItem.addEventListener('click', function(e) {
                    // 如果点击的是加入购物车按钮，不触发详情弹窗
                    if (!e.target.closest('.add-to-cart')) {
                        const dishId = this.getAttribute('data-id');
                        showDishDetail(dishId);
                    }
                });
            });
            
            // 为加入购物车按钮添加点击事件（阻止事件冒泡）
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // 阻止事件冒泡
                    addToCart(this.getAttribute('data-id'));
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            dishesContainer.innerHTML = '<div class="error">加载失败，请重试</div>';
        });
}

// 初始化购物车数据
if (!sessionStorage.getItem('cart')) {
    sessionStorage.setItem('cart', JSON.stringify([]));
}

// 添加到购物车 - 修改版
function addToCart(dishId) {
    // 获取购物车数据
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    
    // 从DOM中获取菜品信息，而不是依赖全局变量
    const button = document.querySelector(`.add-to-cart[data-id="${dishId}"]`);
    if (!button) {
        console.error('未找到添加购物车按钮');
        showToast('添加失败，请重试');
        return;
    }
    
    // 获取菜品项元素
    const dishItem = button.closest('.dish-item');
    if (!dishItem) {
        console.error('未找到菜品元素');
        showToast('添加失败，请重试');
        return;
    }
    
    // 从DOM中提取菜品信息
    const name = dishItem.querySelector('.dish-name').textContent;
    const priceText = dishItem.querySelector('.dish-price').textContent;
    const price = parseFloat(priceText.replace('¥', ''));
    const imageUrl = dishItem.querySelector('.dish-image').src;
    const description = dishItem.querySelector('.dish-desc')?.textContent || '';
    
    // 检查购物车中是否已存在该菜品
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        // 已存在则增加数量
        existingItem.quantity += 1;
    } else {
        // 不存在则添加新菜品
        cart.push({
            id: dishId,
            name: name,
            price: price,
            quantity: 1,
            image_url: imageUrl,
            description: description
        });
    }
    
    // 保存购物车数据
    sessionStorage.setItem('cart', JSON.stringify(cart));
    
    // 更新购物车数量显示
    updateCartCount();
    
    // 显示添加成功提示
    showToast('已添加到购物车');
}

// 更新购物车数量显示
function updateCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// 添加购物车弹出层
function initCart() {
    // 创建购物车弹出层
    const cartOverlay = document.createElement('div');
    cartOverlay.className = 'cart-overlay';
    cartOverlay.innerHTML = `
        <div class="cart-content">
            <div class="cart-header">
                <h2>购物车</h2>
                <button class="close-cart">×</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>总价：</span>
                    <span class="total-price">¥0.00</span>
                </div>
                <button class="clear-cart">清空购物车</button>
                <button class="checkout">结算</button>
            </div>
        </div>
    `;
    document.body.appendChild(cartOverlay);
    
    // 关闭按钮点击事件
    document.querySelector('.close-cart').addEventListener('click', () => {
        document.querySelector('.cart-overlay').classList.remove('active');
    });
    
    // 点击购物车图标打开购物车
    document.querySelector('.cart-icon').addEventListener('click', () => {
        document.querySelector('.cart-overlay').classList.add('active');
        renderCartItems();
    });
    
    // 点击模态框外部关闭
    cartOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
    
    // 清空购物车按钮点击事件
    document.querySelector('.clear-cart').addEventListener('click', clearCart);
    
    // 结算按钮点击事件
    document.querySelector('.checkout').addEventListener('click', checkout);
}

// 渲染购物车菜品
function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    
    if (cart.length == 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">购物车为空</div>';
        updateCartTotal(0);
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image_url}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">¥${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="decrease-quantity" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span> 
                <button class="increase-quantity" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">¥${itemTotal.toFixed(2)}</div>
            <button class="remove-item" data-id="${item.id}">×</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    // 为增加/减少/移除按钮添加点击事件
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() { 
            updateItemQuantity(this.getAttribute('data-id'), 1);
        });
    });
    
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() { 
            updateItemQuantity(this.getAttribute('data-id'), -1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() { 
            removeItemFromCart(this.getAttribute('data-id')); 
        });
    });
    
    // 更新总价
    updateCartTotal(total);
}

// 更新菜品在购物车中的数量
function updateItemQuantity(dishId, change) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || []; 
    const itemIndex = cart.findIndex(item => item.id === dishId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        // 如果数量为0，从购物车中移除
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        } 
        
        // 保存购物车数据
        sessionStorage.setItem('cart', JSON.stringify(cart));
        
        // 更新购物车显示
        renderCartItems();
        
        // 更新购物车数量显示
        updateCartCount();
    }
}

// 从购物车中移除菜品
function removeItemFromCart(dishId) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== dishId);
    
    // 保存购物车数据
    sessionStorage.setItem('cart', JSON.stringify(cart));
    
    // 更新购物车显示
    renderCartItems();
    
    // 更新购物车数量显示
    updateCartCount();
}

// 清空购物车
function clearCart() {
    sessionStorage.removeItem('cart');
    
    // 更新购物车显示
    renderCartItems();
    
    // 更新购物车数量显示
    updateCartCount();
    
    showToast('购物车已清空');
}

// 更新购物车总价
function updateCartTotal(total) {
    document.querySelector('.total-price').textContent = `¥${total.toFixed(2)}`;
}

// 结算
function checkout() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showToast('购物车为空');
        return;
    }
    
    // 准备发送的数据
    const orderData = {
        items: cart,
        total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // 显示提交中状态
    const checkoutButton = document.querySelector('.checkout');
    const originalText = checkoutButton.textContent;
    checkoutButton.textContent = '提交中...';
    checkoutButton.disabled = true;
    
    fetch('api/create_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        return response.json();
    })
    .then(data => {
        checkoutButton.textContent = originalText;
        checkoutButton.disabled = false;
        
        if (data.success) {
            showToast('交易成功');
            clearCart();
            document.querySelector('.cart-overlay').classList.remove('active');
        } else {
            showToast('交易失败: ' + (data.error || '未知错误'));
        }
    })
    .catch(error => {
        checkoutButton.textContent = originalText;
        checkoutButton.disabled = false;
        console.error('创建订单错误:', error);
        showToast('交易失败，请重试');
    });
}