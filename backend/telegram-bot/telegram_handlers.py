"""
Обработчики команд и сообщений Telegram бота
"""
import json
import os
import jwt
import base64
from telegram_api import send_message, send_message_with_buttons, answer_callback_query
from db_helpers import get_user_by_telegram_id, link_user_telegram, create_support_thread, get_thread_by_id, close_support_thread, add_message_to_thread
from fsm_client import start_client_creation, handle_fsm_message, cancel_client_creation, save_client_without_assessment, get_user_state
from fsm_assessment import start_assessment, handle_criterion_score, cancel_assessment
from support_channel import forward_to_support_channel, send_reply_to_user, notify_channel_thread_closed
from fsm_registration import start_registration, handle_registration_message, cancel_registration


def verify_jwt_token(token: str):
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except:
        return None


def handle_reply_command(chat_id: int, telegram_id: int, text: str) -> dict:
    """Обработка команды /reply для ответа на тред поддержки"""
    
    # Формат: /reply thread_id текст ответа
    parts = text.split(' ', 2)
    
    if len(parts) < 3:
        send_message(
            chat_id,
            "❌ Неверный формат команды.\n\n"
            "Используйте: `/reply thread_id текст ответа`"
        )
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    try:
        thread_id = int(parts[1])
        reply_text = parts[2]
        
        # Получить информацию о треде
        thread = get_thread_by_id(thread_id)
        
        if not thread:
            send_message(chat_id, f"❌ Тред #{thread_id} не найден.")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        if thread['status'] == 'closed':
            send_message(chat_id, f"❌ Тред #{thread_id} уже закрыт.")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }
        
        # Отправить ответ пользователю
        user_telegram_id = thread['telegram_user_id']
        send_reply_to_user(user_telegram_id, reply_text)
        
        # Добавить сообщение в тред
        add_message_to_thread(thread_id, telegram_id, reply_text, 'admin')
        
        # Подтверждение администратору
        send_message(
            chat_id,
            f"✅ Ответ отправлен пользователю в треде #{thread_id}"
        )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
        
    except ValueError:
        send_message(
            chat_id,
            "❌ Неверный ID треда. Используйте число."
        )
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }


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
            start_registration(chat_id, telegram_id, username, full_name)
            
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
    
    # Проверить FSM регистрации сначала
    if handle_registration_message(chat_id, telegram_id, text):
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    # Проверить FSM добавления клиента
    if handle_fsm_message(chat_id, telegram_id, text):
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True})
        }
    
    user = get_user_by_telegram_id(telegram_id)
    
    # Если пользователь не привязан - создать тред поддержки
    if not user:
        thread_id = create_support_thread(telegram_id, username, full_name, text)
        
        # Переслать в канал поддержки
        forward_to_support_channel(telegram_id, username, full_name, text, thread_id)
        
        send_message(
            chat_id,
            "✉️ Ваше сообщение отправлено в поддержку.\n"
            "Мы ответим вам в ближайшее время!"
        )
        
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
        
        # Запустить FSM для добавления клиента
        start_client_creation(chat_id, telegram_id, user['id'], user['organization_id'])
        answer_callback_query(telegram_id)
    
    elif callback_data == 'support':
        send_message(
            chat_id,
            "💬 Служба поддержки\n\n"
            "Напишите ваш вопрос, и мы ответим в ближайшее время.\n\n"
            "Если вы уже писали ранее, просто отправьте новое сообщение - оно добавится в ваш тред."
        )
        answer_callback_query(telegram_id)
    
    elif callback_data == 'cancel_client':
        cancel_client_creation(chat_id, telegram_id)
        answer_callback_query(telegram_id)
    
    elif callback_data.startswith('matrix_'):
        # Выбор матрицы для оценки: matrix_123
        matrix_id = int(callback_data.split('_')[1])
        start_assessment(chat_id, telegram_id, matrix_id)
        answer_callback_query(telegram_id)
    
    elif callback_data == 'skip_assessment':
        # Пропустить оценку и сохранить клиента
        state_data = get_user_state(telegram_id)
        if state_data:
            data = state_data.get('data', {})
            save_client_without_assessment(chat_id, telegram_id, data, data.get('description'))
        answer_callback_query(telegram_id)
    
    elif callback_data.startswith('score_'):
        # Оценка критерия: score_criterion_id_status_id_weight
        parts = callback_data.split('_')
        if len(parts) == 4:
            criterion_id = int(parts[1])
            status_id = int(parts[2])
            weight = int(parts[3])
            handle_criterion_score(chat_id, telegram_id, criterion_id, status_id, weight)
        answer_callback_query(telegram_id)
    
    elif callback_data == 'cancel_assessment':
        cancel_assessment(chat_id, telegram_id)
        answer_callback_query(telegram_id)
    
    elif callback_data.startswith('reply_'):
        # Кнопка "Ответить" в канале поддержки: reply_thread_id_user_telegram_id
        parts = callback_data.split('_')
        if len(parts) == 3:
            thread_id = int(parts[1])
            user_telegram_id = int(parts[2])
            
            send_message(
                chat_id,
                f"✍️ Введите ваш ответ для треда #{thread_id}\n\n"
                f"Формат: `/reply {thread_id} текст вашего ответа`"
            )
        answer_callback_query(telegram_id)
    
    elif callback_data.startswith('close_'):
        # Закрыть тред поддержки: close_thread_id
        thread_id = int(callback_data.split('_')[1])
        close_support_thread(thread_id)
        
        # Обновить сообщение в канале
        # notify_channel_thread_closed будет вызван отдельно
        
        send_message(chat_id, f"✅ Тред #{thread_id} закрыт.")
        answer_callback_query(telegram_id)
    
    elif callback_data == 'cancel_registration':
        cancel_registration(chat_id, telegram_id)
        answer_callback_query(telegram_id)
    
    elif callback_data == 'use_telegram_name':
        # Использовать имя из Telegram профиля
        from fsm_registration import get_registration_state, set_registration_state
        state_data = get_registration_state(telegram_id)
        if state_data and state_data.get('state') == 'awaiting_owner_name':
            data = state_data.get('data', {})
            owner_name = data.get('owner_full_name', '')
            set_registration_state(telegram_id, 'awaiting_owner_email', {'owner_name': owner_name})
            
            buttons = [[{'text': '❌ Отменить', 'callback_data': 'cancel_registration'}]]
            send_message_with_buttons(
                chat_id,
                f"✅ Владелец: {owner_name}\n\n"
                f"Шаг 3/4: Введите ваш email (для входа в систему):",
                buttons
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