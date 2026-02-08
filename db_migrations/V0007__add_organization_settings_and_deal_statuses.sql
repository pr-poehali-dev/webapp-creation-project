-- Добавляем поля для настроек организации
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT;

-- Создаём таблицу статусов сделок (универсальные критерии)
CREATE TABLE IF NOT EXISTS deal_statuses (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 0 CHECK (weight >= 0 AND weight <= 10),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_deal_statuses_org ON deal_statuses(organization_id, is_active);

-- Добавляем связь статуса сделки с клиентами
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deal_status_id INTEGER REFERENCES deal_statuses(id);