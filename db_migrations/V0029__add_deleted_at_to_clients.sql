-- Добавление поля deleted_at для мягкого удаления клиентов
ALTER TABLE clients ADD COLUMN deleted_at TIMESTAMP;

-- Мигрируем существующие is_active = false в deleted_at
UPDATE clients SET deleted_at = updated_at WHERE is_active = false;

-- Создаем индекс для быстрой фильтрации
CREATE INDEX idx_clients_deleted_at ON clients(deleted_at);
