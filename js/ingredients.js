// 全局变量
let ingredientsData = [];
let currentIngredientId = null;

// DOM 元素
const ingredientsContainer = document.querySelector('.ingredients-container');
const ingredientModal = document.getElementById('ingredient-modal');
const modalTitle = document.getElementById('modal-title');
const ingredientForm = document.getElementById('ingredient-form');
const addIngredientButton = document.getElementById('add-ingredient-button');
const saveIngredientButton = document.getElementById('save-ingredient-button');
const cancelButtons = document.querySelectorAll('.cancel-button, .close-modal');
const searchInput = document.getElementById('ingredient-search');
const searchButton = document.getElementById('search-button');
const browseButton = document.getElementById('browse-button');
const imageUpload = document.getElementById('image-upload');
const uploadButton = document.getElementById('upload-button');
const removeImageButton = document.getElementById('remove-image');
const previewImg = document.getElementById('preview-img');
const previewPlaceholder = document.getElementById('preview-placeholder');
const ingredientImage = document.getElementById('ingredient-image');
const imageUrlText = document.getElementById('image-url-text');
const applyUrlButton = document.getElementById('apply-url');
const expiredCountElement = document.getElementById('expired-count');
const expiringCountElement = document.getElementById('expiring-count');
const seasonalIngredientsElement = document.getElementById('seasonal-ingredients');

// 初始化页面
function initPage() {
    // 绑定事件
    addIngredientButton.addEventListener('click', openAddModal);
    saveIngredientButton.addEventListener('click', saveIngredient);
    cancelButtons.forEach(button => button.addEventListener('click', closeModal));
    searchButton.addEventListener('click', searchIngredients);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchIngredients();
    });
    browseButton.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleFileSelection);
    uploadButton.addEventListener('click', uploadImage);
    removeImageButton.addEventListener('click', removeImage);
    applyUrlButton.addEventListener('click', applyImageUrl);
    
    // 加载所有食材
    loadAllIngredients();
}

// 加载所有食材
function loadAllIngredients() {
    ingredientsContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    fetch('api/get_all_ingredients.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                ingredientsContainer.innerHTML = `<div class="error">加载失败: ${data.error}</div>`;
                return;
            }
            
            ingredientsData = data.ingredients || [];
            
            // 更新公告条统计
            updateAnnouncementStats(data.statusCount);
            
            // 渲染食材列表
            renderIngredients(ingredientsData);
        })
        .catch(error => {
            ingredientsContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        });
}

// 更新公告条统计
function updateAnnouncementStats(statusCount) {
    // 更新过期食材数量
    expiredCountElement.textContent = statusCount?.['过期'] || 0;
    
    // 更新临期食材数量
    expiringCountElement.textContent = statusCount?.['临期'] || 0;
    
    // 获取当季推荐食材
    const seasonalIngredients = ingredientsData.filter(ing => ing.status === '当季推荐');
    const seasonalNames = seasonalIngredients.map(ing => ing.name).join('、');
    seasonalIngredientsElement.textContent = seasonalNames || '无推荐食材';
}

// 搜索食材
function searchIngredients() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderIngredients(ingredientsData);
        return;
    }
    
    const filteredIngredients = ingredientsData.filter(ingredient => 
        ingredient.name.toLowerCase().includes(query) ||
        ingredient.category.toLowerCase().includes(query) ||
        ingredient.description?.toLowerCase().includes(query)
    );
    
    renderIngredients(filteredIngredients);
}

// 渲染食材列表
function renderIngredients(ingredients) {
    if (ingredients.length === 0) {
        ingredientsContainer.innerHTML = '<div class="empty">暂无食材数据</div>';
        return;
    }
    
    let html = '';
    ingredients.forEach(ingredient => {
        // 根据状态设置CSS类名
        let statusClass = 'fresh';
        let statusText = '正常';
        
        if (ingredient.status === '过期') {
            statusClass = 'expired';
            statusText = '过期';
        } else if (ingredient.status === '临期') {
            statusClass = 'expiring';
            statusText = '临期';
        } else if (ingredient.status === '当季推荐') {
            statusClass = 'fresh';
            statusText = '当季推荐';
        }
        
        html += `
            <div class="ingredient-item" data-id="${ingredient.id}">
                <div class="ingredient-item-header">
                    <div class="ingredient-item-name">${ingredient.name}</div>
                    <div class="ingredient-item-weight">${ingredient.weight} ${ingredient.unit}</div>
                </div>
                <div class="ingredient-item-category">${ingredient.category}</div>
                ${ingredient.description ? `<div class="ingredient-item-desc">${ingredient.description}</div>` : ''}
                <div class="ingredient-item-meta">
                    <div>有效期: ${ingredient.expiry_date}</div>
                    ${ingredient.storage_method ? `<div>存储: ${ingredient.storage_method}</div>` : ''}
                </div>
                <div class="ingredient-item-actions">
                    <span class="ingredient-status ${statusClass}">${statusText}</span>
                    <button class="edit-button" data-id="${ingredient.id}">编辑</button>
                    <button class="delete-button" data-id="${ingredient.id}">删除</button>
                </div>
            </div>
        `;
    });
    
    ingredientsContainer.innerHTML = html;
    
    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            openEditModal(id);
        });
    });
    
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            deleteIngredient(id);
        });
    });
}

// 打开新增模态框
function openAddModal() {
    modalTitle.textContent = '新增食材';
    currentIngredientId = null;
    ingredientForm.reset();
    resetImagePreview();
    showModal();
}

// 打开编辑模态框
function openEditModal(id) {
    const ingredient = ingredientsData.find(ing => ing.id === id);
    if (!ingredient) return;
    
    modalTitle.textContent = '编辑食材';
    currentIngredientId = id;
    
    // 填充表单数据
    document.getElementById('ingredient-id').value = ingredient.id;
    document.getElementById('ingredient-name').value = ingredient.name;
    document.getElementById('ingredient-category').value = ingredient.category;
    document.getElementById('ingredient-weight').value = ingredient.weight;
    
    // 设置单位
    const unitInput = document.createElement('input');
    unitInput.type = 'text';
    unitInput.id = 'ingredient-unit';
    unitInput.value = ingredient.unit || 'kg';
    unitInput.style.marginLeft = '10px';
    unitInput.style.padding = '10px';
    unitInput.style.border = '1px solid #ddd';
    unitInput.style.borderRadius = '4px';
    unitInput.style.width = '100px';
    
    const weightInput = document.getElementById('ingredient-weight');
    if (!document.getElementById('ingredient-unit')) {
        weightInput.parentNode.appendChild(unitInput);
    } else {
        document.getElementById('ingredient-unit').value = ingredient.unit || 'kg';
    }
    
    document.getElementById('ingredient-expiry').value = ingredient.expiry_date;
    document.getElementById('ingredient-description').value = ingredient.description || '';
    document.getElementById('ingredient-storage').value = ingredient.storage_method || '';
    
    // 设置图片预览
    if (ingredient.image_url) {
        ingredientImage.value = ingredient.image_url;
        previewImg.src = ingredient.image_url;
        previewImg.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        removeImageButton.style.display = 'inline-block';
    } else {
        resetImagePreview();
    }
    
    showModal();
}

// 显示模态框
function showModal() {
    ingredientModal.classList.add('active');
}

// 关闭模态框
function closeModal() {
    ingredientModal.classList.remove('active');
    
    // 移除单位输入框
    const unitInput = document.getElementById('ingredient-unit');
    if (unitInput) {
        unitInput.parentNode.removeChild(unitInput);
    }
}

// 保存食材
function saveIngredient() {
    // 表单验证
    const name = document.getElementById('ingredient-name').value.trim();
    const category = document.getElementById('ingredient-category').value.trim();
    const weight = document.getElementById('ingredient-weight').value;
    const expiryDate = document.getElementById('ingredient-expiry').value;
    const unit = document.getElementById('ingredient-unit')?.value || 'kg';
    
    if (!name || !category || !weight || !expiryDate) {
        alert('请填写必填字段');
        return;
    }
    
    // 计算食材状态
    let status = '正常';
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        status = '过期';
    } else if (diffDays <= 90) {
        status = '临期';
    }
    
    // 准备数据
    const data = {
        id: currentIngredientId,
        name,
        category,
        weight,
        unit,
        expiry_date: expiryDate,
        description: document.getElementById('ingredient-description').value.trim(),
        image_url: ingredientImage.value.trim(),
        storage_method: document.getElementById('ingredient-storage').value.trim(),
        status
    };
    
    // 保存数据
    fetch('api/save_ingredient.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            closeModal();
            loadAllIngredients(); // 重新加载数据
            alert(result.message);
        } else {
            alert('保存失败: ' + (result.error || '未知错误'));
        }
    })
    .catch(error => {
        alert('保存失败: ' + error.message);
    });
}

// 删除食材
function deleteIngredient(id) {
    if (confirm('确定要删除这个食材吗？')) {
        fetch('api/delete_ingredient.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadAllIngredients(); // 重新加载数据
                alert(result.message);
            } else {
                alert('删除失败: ' + (result.error || '未知错误'));
            }
        })
        .catch(error => {
            alert('删除失败: ' + error.message);
        });
    }
}

// 处理文件选择
function handleFileSelection() {
    const file = imageUpload.files[0];
    if (file) {
        // 显示上传按钮和预览
        uploadButton.style.display = 'inline-block';
        browseButton.style.display = 'none';
        
        // 简单的预览
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            previewPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 上传图片
function uploadImage() {
    const file = imageUpload.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'ingredient');
    
    uploadButton.disabled = true;
    uploadButton.textContent = '上传中...';
    
    fetch('api/upload_image.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        uploadButton.disabled = false;
        uploadButton.textContent = '上传图片';
        
        if (result.success) {
            ingredientImage.value = result.image_url;
            uploadButton.style.display = 'none';
            removeImageButton.style.display = 'inline-block';
            browseButton.style.display = 'inline-block';
        } else {
            alert('上传失败: ' + (result.error || '未知错误'));
        }
    })
    .catch(error => {
        uploadButton.disabled = false;
        uploadButton.textContent = '上传图片';
        alert('上传失败: ' + error.message);
    });
}

// 移除图片
function removeImage() {
    resetImagePreview();
}

// 重置图片预览
function resetImagePreview() {
    ingredientImage.value = '';
    previewImg.src = '';
    previewImg.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    uploadButton.style.display = 'none';
    removeImageButton.style.display = 'none';
    browseButton.style.display = 'inline-block';
    imageUpload.value = '';
}

// 应用图片URL
function applyImageUrl() {
    const url = imageUrlText.value.trim();
    if (url) {
        ingredientImage.value = url;
        previewImg.src = url;
        previewImg.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        removeImageButton.style.display = 'inline-block';
        imageUrlText.value = '';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);