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
    message_text: str,
    thread_id: int
) -> bool:
    """
    Переслать сообщение от пользователя в канал поддержки с кнопкой "Ответить"
    """
    bot_token = get_bot_token()
    channel_id = get_support_channel_id()
    
    print(f"[SUPPORT_FORWARD] Starting forward to channel")
    print(f"[SUPPORT_FORWARD] Bot token exists: {bool(bot_token)}")
    print(f"[SUPPORT_FORWARD] Channel ID: {channel_id}")
    print(f"[SUPPORT_FORWARD] User: {full_name} (@{username}), TG ID: {user_telegram_id}")
    print(f"[SUPPORT_FORWARD] Thread ID: {thread_id}")
    
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
    user_info += f"\n📋 Thread ID: `{thread_id}`"
    
    message = f"{user_info}\n\n💬 Сообщение:\n{message_text}"
    
    # Inline-кнопка "Ответить"
    keyboard = {
        'inline_keyboard': [
            [{'text': '✍️ Ответить', 'callback_data': f'reply_{thread_id}_{user_telegram_id}'}],
            [{'text': '✅ Закрыть тред', 'callback_data': f'close_{thread_id}'}]
        ]
    }
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': channel_id,
        'text': message,
        'parse_mode': 'Markdown',
        'reply_markup': json.dumps(keyboard)
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


def send_reply_to_user(user_chat_id: int, reply_text: str, admin_name: str = "Поддержка") -> bool:
    """
    Отправить ответ от администратора пользователю
    """
    bot_token = get_bot_token()
    
    if not bot_token:
        return False
    
    message = f"📨 **Ответ от {admin_name}:**\n\n{reply_text}"
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': user_chat_id,
        'text': message,
        'parse_mode': 'Markdown'
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending reply to user: {e}")
        return False


def update_thread_in_channel(
    channel_message_id: int,
    user_telegram_id: int,
    username: str,
    full_name: str,
    message_text: str,
    thread_id: int,
    reply_text: str
) -> bool:
    """
    Обновить сообщение в канале, добавив ответ администратора
    """
    bot_token = get_bot_token()
    channel_id = get_support_channel_id()
    
    if not bot_token or not channel_id:
        return False
    
    # Формируем обновлённый текст
    user_info = f"👤 **{full_name}**"
    if username:
        user_info += f" (@{username})"
    user_info += f"\n🆔 Telegram ID: `{user_telegram_id}`"
    user_info += f"\n📋 Thread ID: `{thread_id}`"
    
    message = f"{user_info}\n\n💬 Сообщение:\n{message_text}\n\n"
    message += f"📨 **Ответ:**\n{reply_text}"
    
    # Inline-кнопка "Ответить ещё"
    keyboard = {
        'inline_keyboard': [
            [{'text': '✍️ Ответить ещё', 'callback_data': f'reply_{thread_id}_{user_telegram_id}'}],
            [{'text': '✅ Закрыть тред', 'callback_data': f'close_{thread_id}'}]
        ]
    }
    
    url = f"https://api.telegram.org/bot{bot_token}/editMessageText"
    payload = {
        'chat_id': channel_id,
        'message_id': channel_message_id,
        'text': message,
        'parse_mode': 'Markdown',
        'reply_markup': json.dumps(keyboard)
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error updating thread in channel: {e}")
        return False


def notify_channel_thread_closed(channel_message_id: int, thread_id: int) -> bool:
    """
    Отметить тред как закрытый в канале
    """
    bot_token = get_bot_token()
    channel_id = get_support_channel_id()
    
    if not bot_token or not channel_id:
        return False
    
    url = f"https://api.telegram.org/bot{bot_token}/editMessageReplyMarkup"
    payload = {
        'chat_id': channel_id,
        'message_id': channel_message_id,
        'reply_markup': json.dumps({
            'inline_keyboard': [
                [{'text': '✅ Тред закрыт', 'callback_data': 'noop'}]
            ]
        })
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error closing thread in channel: {e}")
        return False


def ask_admin_for_reply(channel_id: str, thread_id: int, user_telegram_id: int) -> bool:
    """
    Попросить администратора ввести ответ (создать inline query или callback)
    """
    bot_token = get_bot_token()
    
    if not bot_token:
        return False
    
    message = f"✍️ **Введите ваш ответ для треда #{thread_id}**\n\n"
    message += "Напишите сообщение боту в формате:\n"
    message += f"`/reply {thread_id} ваш текст ответа`"
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': channel_id,
        'text': message,
        'parse_mode': 'Markdown'
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Error asking for reply: {e}")
        return False