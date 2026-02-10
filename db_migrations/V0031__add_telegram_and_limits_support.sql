-- Добавление полей лимитов тарифов в organizations
ALTER TABLE organizations 
ADD COLUMN users_limit INTEGER DEFAULT 3,
ADD COLUMN matrices_limit INTEGER DEFAULT 1,
ADD COLUMN clients_limit INTEGER DEFAULT 10;

-- Обновление существующих организаций с тарифом free
UPDATE organizations 
SET users_limit = 3, matrices_limit = 1, clients_limit = 10
WHERE subscription_tier = 'free';

-- Добавление полей для Telegram в users
ALTER TABLE users
ADD COLUMN telegram_id BIGINT UNIQUE,
ADD COLUMN username VARCHAR(255) UNIQUE;

-- Создание таблицы для тредов поддержки в Telegram
CREATE TABLE telegram_support_threads (
    id SERIAL PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    full_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telegram_support_threads_user ON telegram_support_threads(telegram_user_id);
CREATE INDEX idx_telegram_support_threads_status ON telegram_support_threads(status);

-- Создание таблицы для агрегации контактов из Telegram
CREATE TABLE telegram_contacts (
    telegram_id BIGINT PRIMARY KEY,
    telegram_username VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    first_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для администраторов админ-панели
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление поля created_via в clients для отслеживания источника создания
ALTER TABLE clients
ADD COLUMN created_via VARCHAR(50) DEFAULT 'web';