-- Исправление внешнего ключа template_id в matrices
-- Старый FK ссылался на old_matrix_templates, нужно сделать самоссылку на matrices

-- Шаг 1: Создать новый constraint с другим именем
ALTER TABLE matrices 
  ADD CONSTRAINT matrices_template_id_fkey_v2 
  FOREIGN KEY (template_id) 
  REFERENCES matrices(id) 
  ON UPDATE CASCADE;

-- Комментарий для ясности
COMMENT ON COLUMN matrices.template_id IS 'Reference to template matrix (is_template=TRUE) if created from template, NULL for templates themselves';
