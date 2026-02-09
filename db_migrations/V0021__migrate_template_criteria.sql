-- Задача 2: Перенос критериев из template_criteria в matrix_criteria

-- Создаём временную таблицу для маппинга старых criterion_id в новые
CREATE TABLE temp_criterion_id_mapping (
  old_criterion_id INTEGER PRIMARY KEY,
  new_criterion_id INTEGER NOT NULL
);

-- Переносим 44 критерия из template_criteria в matrix_criteria
-- Используем маппинг template_id -> matrix_id из предыдущей задачи
INSERT INTO matrix_criteria (
  id,
  matrix_id,
  axis,
  name,
  description,
  weight,
  min_value,
  max_value,
  sort_order,
  created_at
)
SELECT 
  tc.id,
  tm.new_matrix_id,
  tc.axis,
  tc.name,
  tc.hint,
  CAST(tc.weight AS INTEGER),
  CAST(tc.min_value AS INTEGER),
  CAST(tc.max_value AS INTEGER),
  tc.sort_order,
  tc.created_at
FROM template_criteria tc
JOIN temp_template_id_mapping tm ON tc.template_id = tm.old_template_id;

-- Сохраняем маппинг criterion_id для следующей задачи
INSERT INTO temp_criterion_id_mapping (old_criterion_id, new_criterion_id)
SELECT id, id FROM matrix_criteria WHERE id BETWEEN 1 AND 44;

COMMENT ON TABLE temp_criterion_id_mapping IS 'Временная таблица для миграции критериев (удалить после завершения)';
