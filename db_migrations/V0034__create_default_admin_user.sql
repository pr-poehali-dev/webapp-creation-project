-- Создание первого администратора для админ-панели
-- Логин: admin
-- Пароль: admin123 (ОБЯЗАТЕЛЬНО СМЕНИТЕ ПОСЛЕ ПЕРВОГО ВХОДА!)

-- Хеш для пароля "admin123" (bcrypt)
INSERT INTO admin_users (username, password_hash, created_at)
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.aNqZri', CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;