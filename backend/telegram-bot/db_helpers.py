"""
Вспомогательные функции для работы с БД
"""
import os
import psycopg2
from typing import Optional


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def get_user_by_telegram_id(telegram_id: int) -> Optional[dict]:
    """Получить пользователя по telegram_id"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT id, organization_id, username, full_name, role, telegram_id
            FROM users
            WHERE telegram_id = %s AND is_active = true
            """, (telegram_id,)
        )
        result = cur.fetchone()
        
        if result:
            return {
                'id': result[0],
                'organization_id': result[1],
                'username': result[2],
                'full_name': result[3],
                'role': result[4],
                'telegram_id': result[5]
            }
        return None
    finally:
        cur.close()
        conn.close()


def link_user_telegram(user_id: int, telegram_id: int, telegram_username: str = None) -> bool:
    """Привязать telegram_id к пользователю"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            UPDATE users 
            SET telegram_id = %s
            WHERE id = %s AND is_active = true
            """, (telegram_id, user_id)
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        cur.close()
        conn.close()


def create_support_thread(telegram_id: int, username: str = None, full_name: str = None, first_message: str = None) -> int:
    """Создать тред поддержки"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Проверить, есть ли открытый тред для этого пользователя
        cur.execute(
            """
            SELECT id FROM telegram_support_threads
            WHERE telegram_user_id = %s AND status = 'open'
            ORDER BY created_at DESC LIMIT 1
            """, (telegram_id,)
        )
        existing = cur.fetchone()
        
        if existing:
            # Добавить сообщение в существующий тред
            thread_id = existing[0]
            if first_message:
                add_message_to_thread(thread_id, telegram_id, first_message, 'user')
            return thread_id
        
        # Создать новый тред
        cur.execute(
            """
            INSERT INTO telegram_support_threads (telegram_user_id, telegram_username, full_name, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
            """, (telegram_id, username or '', full_name or '')
        )
        thread_id = cur.fetchone()[0]
        
        # Добавить первое сообщение
        if first_message:
            add_message_to_thread(thread_id, telegram_id, first_message, 'user')
        
        conn.commit()
        return thread_id
    finally:
        cur.close()
        conn.close()


def get_thread_by_id(thread_id: int) -> Optional[dict]:
    """Получить тред по ID"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT id, telegram_user_id, telegram_username, full_name, status, created_at
            FROM telegram_support_threads
            WHERE id = %s
            """, (thread_id,)
        )
        result = cur.fetchone()
        
        if result:
            return {
                'id': result[0],
                'telegram_user_id': result[1],
                'telegram_username': result[2],
                'full_name': result[3],
                'status': result[4],
                'created_at': result[5]
            }
        return None
    finally:
        cur.close()
        conn.close()


def close_support_thread(thread_id: int) -> bool:
    """Закрыть тред поддержки"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            UPDATE telegram_support_threads
            SET status = 'closed', updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """, (thread_id,)
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        cur.close()
        conn.close()


def add_message_to_thread(thread_id: int, sender_id: int, message_text: str, sender_type: str = 'user'):
    """Добавить сообщение в тред"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            INSERT INTO thread_messages (thread_id, sender_id, sender_type, message_text, created_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            """, (thread_id, sender_id, sender_type, message_text)
        )
        
        # Обновить время последнего обновления треда
        cur.execute(
            "UPDATE telegram_support_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (thread_id,)
        )
        
        conn.commit()
    finally:
        cur.close()
        conn.close()