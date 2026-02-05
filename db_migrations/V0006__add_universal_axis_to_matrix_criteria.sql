-- Удаляем старый constraint
ALTER TABLE matrix_criteria DROP CONSTRAINT IF EXISTS chk_axis;

-- Добавляем новый constraint с поддержкой 'universal'
ALTER TABLE matrix_criteria ADD CONSTRAINT chk_axis CHECK (axis IN ('x', 'y', 'universal'));
