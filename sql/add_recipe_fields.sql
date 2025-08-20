-- 为菜谱表添加食材用量比例和做法步骤字段
ALTER TABLE dishes
ADD COLUMN ingredients_ratio TEXT COMMENT '食材用量比例',
ADD COLUMN cooking_steps TEXT COMMENT '做法步骤';