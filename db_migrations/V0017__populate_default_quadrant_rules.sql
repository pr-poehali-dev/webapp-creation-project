-- Заполнение дефолтных правил квадрантов для всех существующих матриц

-- Правило 1: Фокус сейчас (X >= 7 AND Y >= 7)
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
SELECT id, 'focus', 7.0, 7.0, 'AND', 1 FROM matrices;

-- Правило 2: Выращивать (X >= 7 AND Y >= 0)
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
SELECT id, 'grow', 7.0, 0.0, 'AND', 2 FROM matrices;

-- Правило 3: Мониторить (X >= 0 AND Y >= 7)
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
SELECT id, 'monitor', 0.0, 7.0, 'AND', 3 FROM matrices;

-- Правило 4: Архив (X >= 0 AND Y >= 0) - fallback
INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority)
SELECT id, 'archive', 0.0, 0.0, 'AND', 4 FROM matrices;