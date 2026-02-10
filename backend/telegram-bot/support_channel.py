"""
Модуль для работы с поддержкой через приватный канал Telegram
"""
import os
import json
import requests
from typing import Optional


def get_bot_token() -> str:
    """Получить токен бота"""
    return os.environ.get('TELEGRAM_BOT_TOKEN', '')


def get_support_channel_id() -> str:
    """Получить ID канала поддержки"""
    return os.environ.get('TELEGRAM_SUPPORT_CHANNEL_ID', '')


def forward_to_support_channel(
    user_telegram_id: int,
    username: str,
    full_name: str,
    message_text: str
) -> bool:
    """
    Переслать сообщение-заявку от пользователя в канал поддержки (без тредов)
    """
    bot_token = get_bot_token()
    channel_id = get_support_channel_id()
    
    print(f"[SUPPORT_FORWARD] Starting forward to channel")
    print(f"[SUPPORT_FORWARD] Bot token exists: {bool(bot_token)}")
    print(f"[SUPPORT_FORWARD] Channel ID: {channel_id}")
    print(f"[SUPPORT_FORWARD] User: {full_name} (@{username}), TG ID: {user_telegram_id}")
    
    if not bot_token:
        print(f"[SUPPORT_FORWARD] ERROR: Bot token is missing!")
        return False
    
    if not channel_id:
        print(f"[SUPPORT_FORWARD] ERROR: Channel ID is missing!")
        return False
    
    # Формируем текст сообщения для канала
    user_info = f"👤 **{full_name}**"
    if username:
        user_info += f" (@{username})"
    user_info += f"\n🆔 Telegram ID: `{user_telegram_id}`"
    
    message = f"{user_info}\n\n💬 Сообщение:\n{message_text}"
    
    # Без кнопок - администратор сам свяжется с пользователем
    keyboard = None
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': channel_id,
        'text': message,
        'parse_mode': 'Markdown'
    }
    
    print(f"[SUPPORT_FORWARD] Sending request to Telegram API...")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        print(f"[SUPPORT_FORWARD] Response status: {response.status_code}")
        print(f"[SUPPORT_FORWARD] Response body: {response.text}")
        
        if response.status_code == 200:
            print(f"[SUPPORT_FORWARD] SUCCESS: Message forwarded to channel")
            return True
        else:
            print(f"[SUPPORT_FORWARD] ERROR: Failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"[SUPPORT_FORWARD] Error details: {error_data}")
            except:
                pass
            return False
            
    except Exception as e:
        print(f"[SUPPORT_FORWARD] EXCEPTION: {type(e).__name__}: {e}")
        import traceback
        print(f"[SUPPORT_FORWARD] Traceback: {traceback.format_exc()}")
        return False


