-- Добавление колонки is_template для поддержки unified структуры

ALTER TABLE matrices 
  ADD COLUMN is_template BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX idx_matrices_is_template ON matrices(is_template);

COMMENT ON COLUMN matrices.is_template IS 'TRUE для шаблонов, FALSE для пользовательских матриц';
