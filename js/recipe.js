// 全局变量
let recipesData = [];
let currentRecipeId = null;

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 加载所有菜谱
    loadAllRecipes();
    
    // 搜索按钮事件
    document.getElementById('search-button').addEventListener('click', searchRecipes);
    
    // 搜索框回车事件
    document.getElementById('recipe-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRecipes();
        }
    });
    
    // 新增菜谱按钮事件
    document.getElementById('add-recipe-button').addEventListener('click', () => {
        openModal('新增菜谱', null);
    });
    
    // 关闭模态框事件
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.querySelector('.cancel-button').addEventListener('click', closeModal);
    
    // 保存菜谱事件
    document.getElementById('save-recipe-button').addEventListener('click', saveRecipe);
    
    // 点击模态框外部关闭
    document.getElementById('recipe-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // 图片上传相关事件绑定
    document.getElementById('browse-button').addEventListener('click', function() {
        document.getElementById('image-upload').click();
    });
    
    document.getElementById('image-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 显示上传按钮和预览
            document.getElementById('upload-button').style.display = 'inline-block';
            
            // 使用FileReader预览图片
            const reader = new FileReader();
            reader.onload = function(event) {
                const previewImg = document.getElementById('preview-img');
                previewImg.src = event.target.result;
                previewImg.style.display = 'block';
                document.getElementById('preview-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('upload-button').addEventListener('click', uploadImage);
    
    document.getElementById('remove-image').addEventListener('click', function() {
        document.getElementById('recipe-image').value = '';
        document.getElementById('preview-img').src = '';
        document.getElementById('preview-img').style.display = 'none';
        document.getElementById('preview-placeholder').style.display = 'block';
        document.getElementById('upload-button').style.display = 'none';
        document.getElementById('remove-image').style.display = 'none';
        document.getElementById('image-upload').value = '';
    });
    
    document.getElementById('apply-url').addEventListener('click', function() {
        const url = document.getElementById('image-url-text').value.trim();
        if (url) {
            document.getElementById('recipe-image').value = url;
            
            // 预览URL图片
            const previewImg = document.getElementById('preview-img');
            previewImg.src = url;
            previewImg.style.display = 'block';
            document.getElementById('preview-placeholder').style.display = 'none';
            document.getElementById('remove-image').style.display = 'inline-block';
            document.getElementById('upload-button').style.display = 'none';
        }
    });
});

// 图片上传函数
function uploadImage() {
    const fileInput = document.getElementById('image-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请先选择要上传的图片');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    // 显示加载状态
    const uploadButton = document.getElementById('upload-button');
    const originalText = uploadButton.textContent;
    uploadButton.textContent = '上传中...';
    uploadButton.disabled = true;
    
    fetch('api/upload_image.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        uploadButton.textContent = originalText;
        uploadButton.disabled = false;
        
        if (data.success) {
            // 保存上传后的图片URL
            document.getElementById('recipe-image').value = data.image_url;
            document.getElementById('remove-image').style.display = 'inline-block';
            document.getElementById('upload-button').style.display = 'none';
            alert('图片上传成功');
        } else {
            alert('图片上传失败: ' + (data.error || '未知错误'));
        }
    })
    .catch(error => {
        uploadButton.textContent = originalText;
        uploadButton.disabled = false;
        console.error('上传错误:', error);
        alert('上传过程中发生错误');
    });
}

// 加载所有菜谱
function loadAllRecipes() {
    const recipesContainer = document.querySelector('.recipes-container');
    recipesContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    fetch('api/get_all_recipes.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            recipesData = data;
            renderRecipes(data);
        })
        .catch(error => {
            console.error('Error:', error);
            recipesContainer.innerHTML = '<div class="error">加载失败，请重试</div>';
        });
}

// 搜索菜谱
function searchRecipes() {
    const searchTerm = document.getElementById('recipe-search').value.toLowerCase();
    
    // 在本地过滤菜谱
    const filteredRecipes = recipesData.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        (recipe.description && recipe.description.toLowerCase().includes(searchTerm))
    );
    
    renderRecipes(filteredRecipes);
}

// 渲染菜谱列表
function renderRecipes(recipes) {
    const recipesContainer = document.querySelector('.recipes-container');
    
    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<div class="empty">暂无菜谱</div>';
        return;
    }
    
    recipesContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        
        recipeItem.innerHTML = `
            <div class="recipe-item-header">
                <div class="recipe-item-name">${recipe.name}</div>
                <div class="recipe-item-price">¥${parseFloat(recipe.price).toFixed(2)}</div>
            </div>
            <div class="recipe-item-category">分类: ${recipe.category}</div>
            <div class="recipe-item-desc">${recipe.description || '暂无描述'}</div>
            <div class="recipe-item-meta">
                <span>评分: ${recipe.rating}</span>
                <span>销量: ${recipe.sales}</span>
            </div>
            <div class="recipe-item-actions">
                <button class="edit-button" data-id="${recipe.id}">编辑</button>
                <button class="delete-button" data-id="${recipe.id}">删除</button>
            </div>
        `;
        
        recipesContainer.appendChild(recipeItem);
    });
    
    // 为编辑按钮添加点击事件
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function() {
            const recipeId = this.getAttribute('data-id');
            // 修复类型匹配问题，将字符串ID转换为数字进行比较
            const recipe = recipesData.find(r => r.id == recipeId);
            if (recipe) {
                openModal('编辑菜谱', recipe);
            }
        });
    });
    
    // 为删除按钮添加点击事件
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const recipeId = this.getAttribute('data-id');
            if (confirm('确定要删除这个菜谱吗？')) {
                deleteRecipe(recipeId);
            }
        });
    });
}

// 打开模态框 - 合并后的完整版本
function openModal(title, recipe) {
    document.getElementById('modal-title').textContent = title;
    
    // 清空表单
    document.getElementById('recipe-id').value = '';
    document.getElementById('recipe-name').value = '';
    document.getElementById('recipe-category').value = '';
    document.getElementById('recipe-price').value = '';
    document.getElementById('recipe-description').value = '';
    document.getElementById('recipe-image').value = '';
    document.getElementById('recipe-rating').value = '0';
    document.getElementById('recipe-sales').value = '0';
    document.getElementById('image-url-text').value = '';
    
    // 清空新增字段
    document.getElementById('recipe-ingredients-ratio').value = '';
    document.getElementById('recipe-cooking-steps').value = '';
    
    // 清空图片预览
    const previewImg = document.getElementById('preview-img');
    previewImg.src = '';
    previewImg.style.display = 'none';
    document.getElementById('preview-placeholder').style.display = 'block';
    document.getElementById('upload-button').style.display = 'none';
    document.getElementById('remove-image').style.display = 'none';
    document.getElementById('image-upload').value = '';
    
    // 清空菜单选择
    document.querySelectorAll('.menu-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 如果是编辑，填充表单
    if (recipe) {
        currentRecipeId = recipe.id;
        document.getElementById('recipe-id').value = recipe.id;
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('recipe-category').value = recipe.category || '';
        document.getElementById('recipe-price').value = recipe.price;
        document.getElementById('recipe-description').value = recipe.description || '';
        
        // 处理图片
        if (recipe.image_url) {
            document.getElementById('recipe-image').value = recipe.image_url;
            document.getElementById('image-url-text').value = recipe.image_url;
            
            // 显示图片预览
            previewImg.src = recipe.image_url;
            previewImg.style.display = 'block';
            document.getElementById('preview-placeholder').style.display = 'none';
            document.getElementById('remove-image').style.display = 'inline-block';
        }
        
        document.getElementById('recipe-rating').value = recipe.rating;
        document.getElementById('recipe-sales').value = recipe.sales;
        
        // 填充新增字段
        document.getElementById('recipe-ingredients-ratio').value = recipe.ingredients_ratio || '';
        document.getElementById('recipe-cooking-steps').value = recipe.cooking_steps || '';
        
        // 如果有菜单关联信息，设置选中状态
        if (recipe.menu_ids && Array.isArray(recipe.menu_ids)) {
            recipe.menu_ids.forEach(menuId => {
                // 根据menu_id设置对应复选框选中状态
                const menuNames = ['菜谱', '果粒爱吃', '宁宁爱吃', '小江爱吃', '外卖'];
                const menuName = menuNames[menuId - 1]; // 假设menu_id从1开始
                if (menuName) {
                    const checkbox = document.querySelector(`.menu-checkbox[value="${menuName}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            });
        }
    } else {
        currentRecipeId = null;
    }
    
    // 显示模态框
    document.getElementById('recipe-modal').classList.add('active');
}

// 保存菜谱
function saveRecipe() {
    // 验证表单
    const form = document.getElementById('recipe-form');
    if (!form.checkValidity()) {
        alert('请填写必填字段');
        return;
    }
    
    // 获取表单数据
    const recipeData = {
        id: document.getElementById('recipe-id').value,
        name: document.getElementById('recipe-name').value,
        category: document.getElementById('recipe-category').value,
        price: document.getElementById('recipe-price').value,
        description: document.getElementById('recipe-description').value,
        image_url: document.getElementById('recipe-image').value,
        rating: document.getElementById('recipe-rating').value,
        sales: document.getElementById('recipe-sales').value,
        ingredients_ratio: document.getElementById('recipe-ingredients-ratio').value, // 新增字段
        cooking_steps: document.getElementById('recipe-cooking-steps').value, // 新增字段
        // 获取选中的菜单
        menus: Array.from(document.querySelectorAll('.menu-checkbox:checked'))
            .map(checkbox => checkbox.value)
    };
    
    // 发送请求
    fetch('api/save_recipe.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('保存成功');
            closeModal();
            loadAllRecipes(); // 重新加载菜谱列表
        } else {
            throw new Error(data.error || '保存失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('保存失败，请重试');
    });
}

// 关闭模态框
function closeModal() {
    document.getElementById('recipe-modal').classList.remove('active');
    currentRecipeId = null;
}

// 删除菜谱
function deleteRecipe(recipeId) {
    fetch('api/delete_recipe.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: recipeId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('删除成功');
            loadAllRecipes(); // 重新加载菜谱列表
        } else {
            throw new Error(data.error || '删除失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('删除失败，请重试');
    });
}