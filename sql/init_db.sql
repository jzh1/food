-- 创建菜品表
DROP TABLE IF EXISTS dishes;
CREATE TABLE IF NOT EXISTS dishes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    category VARCHAR(50) NOT NULL COMMENT '菜品分类',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    description TEXT COMMENT '菜品描述',
    image_url VARCHAR(255) COMMENT '图片URL',
    rating DECIMAL(3, 2) DEFAULT 0 COMMENT '评分',
    sales INT DEFAULT 0 COMMENT '销量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品表';

-- 插入测试数据
INSERT INTO dishes (name, category, price, description, image_url, rating, sales)
VALUES
('爆炒腰花', '肉类', 38.00, '鲜嫩可口的爆炒腰花，麻辣鲜香', 'https://picsum.photos/id/292/300/300', 5.00, 0),
('泡椒鸡胗', '肉类', 38.00, '酸辣开胃的泡椒鸡胗', 'https://picsum.photos/id/312/300/300', 5.00, 0),
('咸烧白', '肉类', 48.00, '肥而不腻的咸烧白', 'https://picsum.photos/id/225/300/300', 4.00, 0),
('松鼠桂鱼', '肉类', 78.00, '酸甜可口的松鼠桂鱼', 'https://picsum.photos/id/488/300/300', 5.00, 0),
('麻婆豆腐', '小炒', 28.00, '麻辣鲜香的麻婆豆腐', 'https://picsum.photos/id/429/300/300', 4.50, 0),
('鱼香肉丝', '小炒', 32.00, '酸甜可口的鱼香肉丝', 'https://picsum.photos/id/370/300/300', 4.80, 0),
('宫保鸡丁', '小炒', 36.00, '麻辣鲜香的宫保鸡丁', 'https://picsum.photos/id/225/300/300', 4.70, 0),
('夫妻肺片', '凉菜', 42.00, '麻辣鲜香的夫妻肺片', 'https://picsum.photos/id/315/300/300', 4.90, 0),
('钟水饺', '主食', 18.00, '传统风味的钟水饺', 'https://picsum.photos/id/431/300/300', 4.60, 0);

-- 创建菜单表 
DROP TABLE IF EXISTS menu_items;
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '菜单名称',
    icon VARCHAR(50) NOT NULL COMMENT '图标类名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';

-- 创建菜单与菜品的关联表 
DROP TABLE IF EXISTS menu_dish_relations;
CREATE TABLE IF NOT EXISTS menu_dish_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL COMMENT '菜单ID',
    dish_id INT NOT NULL COMMENT '菜品ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单与菜品关联表';

-- 插入菜单测试数据 
INSERT INTO menu_items (name, icon) VALUES
('菜谱', 'fa-book'),
('果粒爱吃', 'fa-cutlery'),
('宁宁爱吃', 'fa-heart'),
('小江爱吃', 'fa-smile-o'),
('外卖', 'fa-bicycle');

-- 插入关联测试数据 
INSERT INTO menu_dish_relations (menu_id, dish_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 1), (2, 3), (2, 5),
(3, 2), (3, 4), (3, 6),
(4, 7), (4, 8),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 8);