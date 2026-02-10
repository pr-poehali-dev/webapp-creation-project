-- Добавить колонку status для управления статусами организаций
ALTER TABLE organizations 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;

-- Добавить индекс для быстрого поиска по статусу
CREATE INDEX idx_organizations_status ON organizations(status);