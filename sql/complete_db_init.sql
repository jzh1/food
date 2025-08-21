-- 完整的数据库初始化脚本
-- 创建时间: " . date('Y-m-d H:i:s') . "

-- 设置外键检查为0，以便于删除表
SET FOREIGN_KEY_CHECKS = 0;

-- 按正确的顺序删除表（先删除引用其他表的表）
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS menu_dish_relations;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS menu_items;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 创建菜品表
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
    updated_at DATETIME COMMENT '更新时间',
    ingredients_ratio TEXT COMMENT '食材用量比例',
    cooking_steps TEXT COMMENT '做法步骤'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品表';

-- 插入菜品测试数据
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
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '菜单名称',
    icon VARCHAR(50) NOT NULL COMMENT '图标类名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';

-- 插入菜单测试数据
INSERT INTO menu_items (name, icon) VALUES
('菜谱', 'fa-book'),
('果粒爱吃', 'fa-cutlery'),
('宁宁爱吃', 'fa-heart'),
('小江爱吃', 'fa-smile-o'),
('外卖', 'fa-bicycle');

-- 创建菜单与菜品的关联表
CREATE TABLE IF NOT EXISTS menu_dish_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL COMMENT '菜单ID',
    dish_id INT NOT NULL COMMENT '菜品ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (menu_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单与菜品关联表';

-- 插入菜单与菜品关联测试数据
INSERT INTO menu_dish_relations (menu_id, dish_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
(2, 1), (2, 3), (2, 5),
(3, 2), (3, 4), (3, 6),
(4, 7), (4, 8), (4, 9),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 8), (5, 9);

-- 创建食材表
CREATE TABLE IF NOT EXISTS ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '食材名称',
    category VARCHAR(50) NOT NULL COMMENT '食材分类',
    weight DECIMAL(10, 2) NOT NULL COMMENT '重量',
    unit VARCHAR(20) NOT NULL COMMENT '单位',
    expiry_date DATE NOT NULL COMMENT '有效期',
    description TEXT COMMENT '食材描述',
    image_url VARCHAR(255) COMMENT '图片URL',
    storage_method VARCHAR(100) COMMENT '存储方式',
    status ENUM('过期', '临期', '正常', '当季推荐') DEFAULT '正常' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='食材表';

-- 插入食材测试数据
INSERT INTO ingredients (name, category, weight, unit, expiry_date, description, image_url, storage_method, status)
VALUES
('西红柿', '蔬菜', 2.50, 'kg', DATE_ADD(NOW(), INTERVAL -5 DAY), '新鲜红熟的西红柿，适合做汤或凉拌', 'https://picsum.photos/id/292/300/300', '常温保存', '过期'),
('黄瓜', '蔬菜', 3.00, 'kg', DATE_ADD(NOW(), INTERVAL 2 DAY), '新鲜脆嫩的黄瓜，适合凉拌', 'https://picsum.photos/id/312/300/300', '冷藏保存', '临期'),
('猪肉', '肉类', 1.50, 'kg', DATE_ADD(NOW(), INTERVAL 3 DAY), '新鲜猪肉，适合炒菜或炖煮', 'https://picsum.photos/id/225/300/300', '冷冻保存', '临期'),
('鸡肉', '肉类', 2.00, 'kg', DATE_ADD(NOW(), INTERVAL 7 DAY), '新鲜鸡肉，适合炖汤或烧烤', 'https://picsum.photos/id/488/300/300', '冷冻保存', '正常'),
('大米', '粮食', 10.00, 'kg', DATE_ADD(NOW(), INTERVAL 365 DAY), '优质大米，口感香糯', 'https://picsum.photos/id/429/300/300', '常温干燥保存', '正常'),
('苹果', '水果', 5.00, 'kg', DATE_ADD(NOW(), INTERVAL 15 DAY), '当季新鲜苹果，脆甜多汁', 'https://picsum.photos/id/370/300/300', '冷藏保存', '当季推荐'),
('香蕉', '水果', 3.50, 'kg', DATE_ADD(NOW(), INTERVAL 5 DAY), '新鲜香蕉，成熟度适中', 'https://picsum.photos/id/225/300/300', '常温保存', '正常'),
('胡萝卜', '蔬菜', 4.00, 'kg', DATE_ADD(NOW(), INTERVAL 10 DAY), '新鲜胡萝卜，富含维生素A', 'https://picsum.photos/id/315/300/300', '冷藏保存', '当季推荐');

-- 创建评论表
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dish_id INT NOT NULL COMMENT '菜品ID',
    content TEXT NOT NULL COMMENT '评论内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品评论表';

-- 创建订单主表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL,
    order_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT '待支付',
    customer_name VARCHAR(50),
    contact_number VARCHAR(20),
    address VARCHAR(255),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- 创建订单附表（订单商品表）
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    dish_name VARCHAR(100) NOT NULL,
    dish_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    dish_image_url VARCHAR(255),
    dish_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';

-- 创建所有必要的索引
-- 评论表索引
CREATE INDEX idx_dish_id ON reviews(dish_id);

-- 订单表索引
CREATE INDEX idx_order_no ON orders(order_no);
CREATE INDEX idx_order_time ON orders(order_time);
CREATE INDEX idx_order_status ON orders(status);

-- 订单附表索引
CREATE INDEX idx_order_id ON order_items(order_id);
CREATE INDEX idx_dish_id ON order_items(dish_id);

-- 完成数据库初始化
SELECT '数据库初始化完成！所有表已创建，测试数据已插入，索引已建立。' AS result;