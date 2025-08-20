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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

-- 创建订单表的索引
CREATE INDEX idx_order_no ON orders(order_no);
CREATE INDEX idx_order_time ON orders(order_time);
CREATE INDEX idx_order_status ON orders(status);

-- 创建订单附表的索引
CREATE INDEX idx_order_id ON order_items(order_id);
CREATE INDEX idx_dish_id ON order_items(dish_id);