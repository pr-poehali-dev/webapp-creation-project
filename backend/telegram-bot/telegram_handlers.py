"""
Обработчики команд и сообщений Telegram бота
"""
import json
import os
import jwt
import base64
from telegram_api import send_message, send_message_with_buttons, answer_callback_query
from db_helpers import get_user_by_telegram_id, link_user_telegram, create_support_thread


def verify_jwt_token(token: str):
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except:
        return None


def handle_start(chat_id: int, telegram_id: int, text: str, username: str = None, full_name: str = None) -> dict:
    """Обработка команды /start"""
    
    # Проверка deep link для привязки
    if ' ' in text:
        parts = text.split(' ', 1)
        param = parts[1]
        
        # Привязка пользователя: link_<base64(user_id_org_id_token)>
        if param.startswith('link_'):
            try:
                decoded = base64.b64decode(param[5:]).decode('utf-8')
                user_id, org_id, token = decoded.split('_', 2)
                
                payload = verify_jwt_token(token)
                if payload and payload.get('user_id') == int(user_id):
                    link_user_telegram(int(user_id), telegram_id, username)
                    
                    buttons = [
                        [{'text': '➕ Добавить клиента', 'callback_data': 'add_client'}],
                        [{'text': '💬 Поддержка', 'callback_data': 'support'}]
                    ]
                    
                    send_message_with_buttons(
                        chat_id,
                        f"✅ Telegram успешно привязан!\n\n"
                        f"Теперь вы можете добавлять клиентов прямо из бота.",
                        buttons
                    )
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'ok': True})
                    }
            except:
                pass
        
        # Создание организации: create_org
        if param == 'create_org':
            send_message(
                chat_id,
                "🚀 Создание аккаунта организации\n\n"
                "Функционал в разработке. Свяжитесь с поддержкой для создания аккаунта."
            )
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
    
    # Обычный /start - показать меню
    user = get_user_by_telegram_id(telegram_id)
    
    if user:
        # Пользователь привязан - показать основное меню
        buttons = [
            [{'text': '➕ Добавить клиента', 'callback_data': 'add_client'}],
            [{'text': '💬 Поддержка', 'callback_data': 'support'}]
        ]
        
        send_message_with_buttons(
            chat_id,
            f"👋 Добро пожаловать, {user['full_name']}!\n\n"
            f"Выберите действие:",
            buttons
        )
    else:
        # Пользователь не привязан
        buttons = [
            [{'text': '💬 Поддержка', 'callback_data': 'support'}],
            [{'text': '🔗 Как привязать бота?', 'callback_data': 'how_to_link'}]
        ]
        
        send_message_with_buttons(
            chat_id,
            f"👋 Здравствуйте!\n\n"
            f"Чтобы использовать бота для добавления клиентов, "
            f"привяжите его к вашему аккаунту в CRM.\n\n"
            f"Или обратитесь в поддержку для создания нового аккаунта.",
            buttons
        )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }


def handle_message(chat_id: int, telegram_id: int, text: str, username: str = None, full_name: str = None) -> dict:
    """Обработка текстовых сообщений"""
    
    user = get_user_by_telegram_id(telegram_id)
    
    # Если пользователь не привязан - создать тред поддержки
    if not user:
        thread_id = create_support_thread(telegram_id, username, full_name, text)
        
        send_message(
            chat_id,
            "✉️ Ваше сообщение отправлено в поддержку.\n"
            "Мы ответим вам в ближайшее время!"
        )
        
        # TODO: Отправить уведомление в канал поддержки
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    # Если привязан - показать меню
    buttons = [
        [{'text': '➕ Добавить клиента', 'callback_data': 'add_client'}],
        [{'text': '💬 Поддержка', 'callback_data': 'support'}]
    ]
    
    send_message_with_buttons(
        chat_id,
        "Выберите действие:",
        buttons
    )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }


def handle_callback(chat_id: int, telegram_id: int, callback_data: str, message_id: int) -> dict:
    """Обработка нажатий на inline кнопки"""
    
    user = get_user_by_telegram_id(telegram_id)
    
    if callback_data == 'add_client':
        if not user:
            send_message(chat_id, "⚠️ Привяжите бота к аккаунту в CRM для добавления клиентов.")
            answer_callback_query(telegram_id)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        # TODO: Запустить FSM для добавления клиента
        send_message(chat_id, "📝 Функционал добавления клиента в разработке...")
        answer_callback_query(telegram_id)
    
    elif callback_data == 'support':
        send_message(
            chat_id,
            "💬 Служба поддержки\n\n"
            "Напишите ваш вопрос, и мы ответим в ближайшее время."
        )
        answer_callback_query(telegram_id)
    
    elif callback_data == 'how_to_link':
        send_message(
            chat_id,
            "🔗 Как привязать бота:\n\n"
            "1. Войдите в CRM систему\n"
            "2. Перейдите в Настройки → Telegram\n"
            "3. Нажмите 'Привязать Telegram бота'\n"
            "4. Нажмите Start в открывшемся боте\n\n"
            "Готово! Теперь вы можете добавлять клиентов через бота."
        )
        answer_callback_query(telegram_id)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True})
    }
