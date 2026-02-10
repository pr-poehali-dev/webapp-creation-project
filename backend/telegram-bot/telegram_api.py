"""
API методы для работы с Telegram Bot API
"""
import os
import requests
from typing import List, Dict


def get_bot_token() -> str:
    return os.environ.get('TELEGRAM_BOT_TOKEN')


def send_message(chat_id: int, text: str) -> bool:
    """Отправить текстовое сообщение"""
    token = get_bot_token()
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    response = requests.post(url, json=payload)
    return response.status_code == 200


def send_message_with_buttons(chat_id: int, text: str, buttons: List[List[Dict]]) -> bool:
    """Отправить сообщение с inline кнопками"""
    token = get_bot_token()
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
        'reply_markup': {
            'inline_keyboard': buttons
        }
    }
    
    response = requests.post(url, json=payload)
    return response.status_code == 200


def answer_callback_query(callback_query_id: int, text: str = None) -> bool:
    """Ответить на callback query (убрать часики)"""
    token = get_bot_token()
    url = f"https://api.telegram.org/bot{token}/answerCallbackQuery"
    
    payload = {
        'callback_query_id': callback_query_id
    }
    
    if text:
        payload['text'] = text
    
    response = requests.post(url, json=payload)
    return response.status_code == 200


def forward_message_to_channel(chat_id: int, message_id: int) -> bool:
    """Переслать сообщение в канал поддержки"""
    token = get_bot_token()
    channel_id = os.environ.get('TELEGRAM_SUPPORT_CHANNEL_ID')
    
    if not channel_id:
        return False
    
    url = f"https://api.telegram.org/bot{token}/forwardMessage"
    
    payload = {
        'chat_id': channel_id,
        'from_chat_id': chat_id,
        'message_id': message_id
    }
    
    response = requests.post(url, json=payload)
    return response.status_code == 200


def send_message_to_channel(text: str, buttons: List[List[Dict]] = None) -> bool:
    """Отправить сообщение в канал поддержки"""
    token = get_bot_token()
    channel_id = os.environ.get('TELEGRAM_SUPPORT_CHANNEL_ID')
    
    if not channel_id:
        return False
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    
    payload = {
        'chat_id': channel_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    if buttons:
        payload['reply_markup'] = {
            'inline_keyboard': buttons
        }
    
    response = requests.post(url, json=payload)
    return response.status_code == 200
