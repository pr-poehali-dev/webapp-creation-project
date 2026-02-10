-- Добавить поля для управления тредами поддержки
ALTER TABLE telegram_support_threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Создать таблицу для сообщений в тредах
CREATE TABLE IF NOT EXISTS thread_messages (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER NOT NULL REFERENCES telegram_support_threads(id),
    sender_id INTEGER NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_thread_messages_thread_id ON thread_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_messages_created_at ON thread_messages(created_at);