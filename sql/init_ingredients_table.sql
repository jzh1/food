-- 创建食材表
drop table if exists ingredients;
create table if not exists ingredients (
    id int auto_increment primary key,
    name varchar(100) not null comment '食材名称',
    category varchar(50) not null comment '食材分类',
    weight decimal(10, 2) not null comment '重量',
    unit varchar(20) not null comment '单位',
    expiry_date date not null comment '有效期',
    description text comment '食材描述',
    image_url varchar(255) comment '图片URL',
    storage_method varchar(100) comment '存储方式',
    status enum('过期', '临期', '正常', '当季推荐') default '正常' comment '状态',
    created_at timestamp default current_timestamp comment '创建时间',
    updated_at datetime on update current_timestamp comment '更新时间'
) engine=innodb default charset=utf8mb4 comment='食材表';

-- 插入测试数据
insert into ingredients (name, category, weight, unit, expiry_date, description, image_url, storage_method, status)
values
('西红柿', '蔬菜', 2.50, 'kg', date_add(now(), interval -5 day), '新鲜红熟的西红柿，适合做汤或凉拌', 'https://picsum.photos/id/292/300/300', '常温保存', '过期'),
('黄瓜', '蔬菜', 3.00, 'kg', date_add(now(), interval 2 day), '新鲜脆嫩的黄瓜，适合凉拌', 'https://picsum.photos/id/312/300/300', '冷藏保存', '临期'),
('猪肉', '肉类', 1.50, 'kg', date_add(now(), interval 3 day), '新鲜猪肉，适合炒菜或炖煮', 'https://picsum.photos/id/225/300/300', '冷冻保存', '临期'),
('鸡肉', '肉类', 2.00, 'kg', date_add(now(), interval 7 day), '新鲜鸡肉，适合炖汤或烧烤', 'https://picsum.photos/id/488/300/300', '冷冻保存', '正常'),
('大米', '粮食', 10.00, 'kg', date_add(now(), interval 365 day), '优质大米，口感香糯', 'https://picsum.photos/id/429/300/300', '常温干燥保存', '正常'),
('苹果', '水果', 5.00, 'kg', date_add(now(), interval 15 day), '当季新鲜苹果，脆甜多汁', 'https://picsum.photos/id/370/300/300', '冷藏保存', '当季推荐'),
('香蕉', '水果', 3.50, 'kg', date_add(now(), interval 5 day), '新鲜香蕉，成熟度适中', 'https://picsum.photos/id/225/300/300', '常温保存', '正常'),
('胡萝卜', '蔬菜', 4.00, 'kg', date_add(now(), interval 10 day), '新鲜胡萝卜，富含维生素A', 'https://picsum.photos/id/315/300/300', '冷藏保存', '当季推荐');