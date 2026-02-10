"""
Telegram бот для TechSale CRM.
Позволяет пользователям добавлять клиентов через Telegram и получать поддержку.
"""
import json
import os
import jwt
import psycopg2
from typing import Optional
from telegram_handlers import handle_start, handle_message, handle_callback


def verify_jwt_token(token: str) -> Optional[dict]:
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except:
        return None


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


def save_telegram_contact(telegram_id: int, username: str = None, full_name: str = None):
    """Сохранить контакт из Telegram для агрегации"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            INSERT INTO telegram_contacts (telegram_id, telegram_username, full_name, first_contact_at, last_contact_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (telegram_id) 
            DO UPDATE SET 
                telegram_username = EXCLUDED.telegram_username,
                full_name = EXCLUDED.full_name,
                last_contact_at = CURRENT_TIMESTAMP
            """, (telegram_id, username or '', full_name or '')
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    """
    Webhook handler для Telegram бота.
    Обрабатывает команды /start, текстовые сообщения и callback кнопки.
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Telegram webhook update
        if 'message' in body:
            message = body['message']
            chat_id = message['chat']['id']
            telegram_id = message['from']['id']
            username = message['from'].get('username')
            full_name = f"{message['from'].get('first_name', '')} {message['from'].get('last_name', '')}".strip()
            
            # Сохранить контакт
            save_telegram_contact(telegram_id, username, full_name)
            
            # Обработка команд /start, /menu, /help
            if 'text' in message and message['text'].startswith('/start'):
                return handle_start(chat_id, telegram_id, message['text'], username, full_name)
            
            if 'text' in message and message['text'].startswith('/menu'):
                return handle_start(chat_id, telegram_id, '/start', username, full_name)
            
            if 'text' in message and message['text'].startswith('/help'):
                from telegram_api import send_message
                help_text = (
                    "❓ **Справка по боту**\n\n"
                    "**Команды:**\n"
                    "/start - Главное меню\n"
                    "/menu - Открыть меню\n"
                    "/help - Эта справка\n\n"
                    "**Возможности:**\n"
                    "• Добавление клиентов\n"
                    "• Оценка по матрице\n"
                    "• Связь с поддержкой\n\n"
                    "Для привязки бота к вашему аккаунту зайдите в CRM и нажмите на плитку 'Telegram' на главном дашборде."
                )
                send_message(chat_id, help_text)
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True})
                }
            
            # Тестовая команда для проверки пересылки
            if 'text' in message and message['text'].startswith('/test_support'):
                from support_channel import forward_to_support_channel
                from db_helpers import create_support_thread
                from telegram_api import send_message
                
                thread_id = create_support_thread(telegram_id, username, full_name, "Тестовое сообщение от /test_support")
                success = forward_to_support_channel(telegram_id, username, full_name, "Тестовое сообщение для проверки пересылки в группу", thread_id)
                
                if success:
                    send_message(chat_id, f"✅ Тестовое сообщение отправлено в группу поддержки!\nThread ID: {thread_id}\n\nПроверьте группу.")
                else:
                    send_message(chat_id, "❌ Ошибка отправки. Проверьте логи бота.")
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True})
                }
            
            # Обработка текстовых сообщений
            if 'text' in message:
                return handle_message(chat_id, telegram_id, message['text'], username, full_name)
        
        # Обработка callback кнопок
        if 'callback_query' in body:
            callback = body['callback_query']
            chat_id = callback['message']['chat']['id']
            telegram_id = callback['from']['id']
            callback_data = callback['data']
            message_id = callback['message']['message_id']
            
            return handle_callback(chat_id, telegram_id, callback_data, message_id)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }