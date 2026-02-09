-- Задача 1: Подготовка таблицы matrices для системных шаблонов

-- Делаем organization_id и created_by nullable для системных шаблонов
ALTER TABLE matrices 
  ALTER COLUMN organization_id SET DEFAULT NULL;

ALTER TABLE matrices 
  ALTER COLUMN created_by SET DEFAULT NULL;

COMMENT ON COLUMN matrices.organization_id IS 'NULL для системных шаблонов, NOT NULL для пользовательских матриц';
COMMENT ON COLUMN matrices.created_by IS 'NULL для системных шаблонов, NOT NULL для пользовательских матриц';
