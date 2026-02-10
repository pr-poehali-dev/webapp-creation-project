-- Обновить пароль администратора с правильным bcrypt хешем
-- Хеш сгенерирован через Cloud Function с bcrypt 5.0.0 для пароля 'admin123'
UPDATE admin_users 
SET password_hash = '$2b$12$nBlPnncY/d/DtRTaKS0EZOx.RzEQ5BMlxcrVqlq3ZsDj9R6LwAFeq'
WHERE username = 'admin';