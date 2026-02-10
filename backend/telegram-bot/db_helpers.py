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
            """ % telegram_id
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
            """ % (telegram_id, user_id)
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
        cur.execute(
            """
            INSERT INTO telegram_support_threads (telegram_user_id, telegram_username, full_name, status)
            VALUES (%s, '%s', '%s', 'open')
            RETURNING id
            """ % (telegram_id, username or '', full_name or '')
        )
        thread_id = cur.fetchone()[0]
        conn.commit()
        return thread_id
    finally:
        cur.close()
        conn.close()
