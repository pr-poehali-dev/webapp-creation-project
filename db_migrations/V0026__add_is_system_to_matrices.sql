-- Добавление поля is_system для различения системных и пользовательских шаблонов

-- Шаг 1: Добавить колонку is_system
ALTER TABLE matrices ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT FALSE;

-- Шаг 2: Пометить системные шаблоны (ID 1-4)
UPDATE matrices SET is_system = TRUE WHERE id IN (1, 2, 3, 4) AND is_template = TRUE;

-- Шаг 3: Создать индекс для быстрого поиска системных шаблонов
CREATE INDEX idx_matrices_system_templates ON matrices(is_system, is_template) WHERE is_system = TRUE AND is_template = TRUE;

-- Комментарии
COMMENT ON COLUMN matrices.is_system IS 'TRUE for global system templates (visible to all), FALSE for organization-specific templates';
