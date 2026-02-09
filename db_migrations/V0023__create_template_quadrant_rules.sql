-- Создание правил квадрантов для 4 системных шаблонов матриц
-- Стандартные правила: focus (7,7), grow (7,0), monitor (0,7), archive (0,0)

-- Шаблон 1: Продажи ИИ-продуктов
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
VALUES 
  (1, 'focus', 7.0, 7.0, 'AND', 1),
  (1, 'grow', 7.0, 0.0, 'AND', 2),
  (1, 'monitor', 0.0, 7.0, 'AND', 3),
  (1, 'archive', 0.0, 0.0, 'AND', 4);

-- Шаблон 2: Сложное техническое оборудование
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
VALUES 
  (2, 'focus', 7.0, 7.0, 'AND', 1),
  (2, 'grow', 7.0, 0.0, 'AND', 2),
  (2, 'monitor', 0.0, 7.0, 'AND', 3),
  (2, 'archive', 0.0, 0.0, 'AND', 4);

-- Шаблон 3: Корпоративное ПО
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
VALUES 
  (3, 'focus', 7.0, 7.0, 'AND', 1),
  (3, 'grow', 7.0, 0.0, 'AND', 2),
  (3, 'monitor', 0.0, 7.0, 'AND', 3),
  (3, 'archive', 0.0, 0.0, 'AND', 4);

-- Шаблон 4: Консалтинг
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
VALUES 
  (4, 'focus', 7.0, 7.0, 'AND', 1),
  (4, 'grow', 7.0, 0.0, 'AND', 2),
  (4, 'monitor', 0.0, 7.0, 'AND', 3),
  (4, 'archive', 0.0, 0.0, 'AND', 4);
