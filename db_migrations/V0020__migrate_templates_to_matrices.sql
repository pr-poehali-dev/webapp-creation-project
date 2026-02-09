-- Задача 1: Перенос шаблонов из matrix_templates в matrices

-- Создаём временную таблицу для маппинга старых ID в новые
CREATE TABLE temp_template_id_mapping (
  old_template_id INTEGER PRIMARY KEY,
  new_matrix_id INTEGER NOT NULL
);

-- Переносим 4 системных шаблона с обходом NOT NULL constraint
-- Используем минимальные значения для organization_id и created_by (будут системными)
INSERT INTO matrices (
  id,
  organization_id, 
  created_by,
  name, 
  description, 
  axis_x_name, 
  axis_y_name, 
  is_template,
  is_active,
  created_at
)
SELECT 
  id,
  1,
  1,
  name,
  description,
  COALESCE(axis_x_name, 'Ось X'),
  COALESCE(axis_y_name, 'Ось Y'),
  TRUE,
  TRUE,
  created_at
FROM matrix_templates
WHERE is_system = TRUE;

-- Сохраняем маппинг ID для следующих задач
INSERT INTO temp_template_id_mapping (old_template_id, new_matrix_id)
SELECT id, id FROM matrix_templates WHERE is_system = TRUE;

COMMENT ON TABLE temp_template_id_mapping IS 'Временная таблица для миграции шаблонов (удалить после завершения)';
