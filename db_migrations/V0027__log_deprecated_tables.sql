-- Создание лог-таблицы для отслеживания устаревших таблиц

CREATE TABLE IF NOT EXISTS deprecated_tables_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Отметить устаревшие таблицы в логе
INSERT INTO deprecated_tables_log (table_name, reason)
VALUES 
  ('old_matrix_templates', 'Migrated to matrices with is_template flag in V0020'),
  ('old_template_criteria', 'Migrated to matrix_criteria in V0021'),
  ('old_template_criterion_statuses', 'Migrated to criterion_statuses in V0022'),
  ('old_temp_template_id_mapping', 'Temporary mapping table used in V0020'),
  ('old_temp_criterion_id_mapping', 'Temporary mapping table used in V0021');
