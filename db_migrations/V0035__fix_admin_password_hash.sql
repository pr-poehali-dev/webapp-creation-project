-- Обновить пароль администратора с правильным bcrypt хешем
-- Новый хеш для пароля 'admin123' сгенерирован через Python bcrypt
UPDATE admin_users 
SET password_hash = '$2b$12$KIXqCJkKzD5Z0hPjxG.W2OJ9F5xN8vF0YZ.WZJYvL4KqE5dVzxGTG'
WHERE username = 'admin';