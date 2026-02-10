"""
FSM для регистрации новой организации через Telegram бота
"""
import json
import psycopg2
import os
import bcrypt
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Dict
from telegram_api import send_message, send_message_with_buttons


# In-memory хранилище состояний регистрации (в production использовать Redis)
registration_states: Dict[int, dict] = {}


def get_registration_state(telegram_id: int) -> Optional[dict]:
    """Получить состояние регистрации пользователя"""
    return registration_states.get(telegram_id)


def set_registration_state(telegram_id: int, state: str, data: dict = None):
    """Установить состояние регистрации"""
    if telegram_id not in registration_states:
        registration_states[telegram_id] = {}
    
    registration_states[telegram_id]['state'] = state
    
    if data:
        if 'data' not in registration_states[telegram_id]:
            registration_states[telegram_id]['data'] = {}
        registration_states[telegram_id]['data'].update(data)


def clear_registration_state(telegram_id: int):
    """Очистить состояние регистрации"""
    if telegram_id in registration_states:
        del registration_states[telegram_id]


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def generate_password(length: int = 12) -> str:
    """Сгенерировать случайный пароль"""
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def hash_password(password: str) -> str:
    """Хешировать пароль"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def start_registration(chat_id: int, telegram_id: int, username: str = None, full_name: str = None):
    """Начать процесс регистрации организации"""
    set_registration_state(telegram_id, 'awaiting_org_name', {
        'telegram_username': username,
        'owner_full_name': full_name
    })
    
    buttons = [[{'text': '❌ Отменить', 'callback_data': 'cancel_registration'}]]
    
    send_message_with_buttons(
        chat_id,
        "🚀 Регистрация новой организации\n\n"
        "Давайте создадим аккаунт для вашей компании!\n\n"
        "Шаг 1/4: Введите название вашей организации:",
        buttons
    )


def handle_registration_message(chat_id: int, telegram_id: int, text: str) -> bool:
    """
    Обработать сообщение в контексте регистрации.
    Возвращает True если сообщение было обработано.
    """
    state_data = get_registration_state(telegram_id)
    
    if not state_data:
        return False
    
    state = state_data.get('state')
    data = state_data.get('data', {})
    
    buttons = [[{'text': '❌ Отменить', 'callback_data': 'cancel_registration'}]]
    
    # Шаг 1: Название организации
    if state == 'awaiting_org_name':
        set_registration_state(telegram_id, 'awaiting_owner_name', {'org_name': text})
        
        # Если есть full_name из профиля - предложить использовать
        if data.get('owner_full_name'):
            buttons.insert(0, [{'text': f"✅ Использовать: {data['owner_full_name']}", 'callback_data': 'use_telegram_name'}])
        
        send_message_with_buttons(
            chat_id,
            f"✅ Организация: {text}\n\n"
            f"Шаг 2/4: Введите ваше имя и фамилию (владельца аккаунта):",
            buttons
        )
        return True
    
    # Шаг 2: Имя владельца
    elif state == 'awaiting_owner_name':
        set_registration_state(telegram_id, 'awaiting_owner_email', {'owner_name': text})
        send_message_with_buttons(
            chat_id,
            f"✅ Владелец: {text}\n\n"
            f"Шаг 3/4: Введите ваш email (для входа в систему):",
            buttons
        )
        return True
    
    # Шаг 3: Email владельца
    elif state == 'awaiting_owner_email':
        # Простая валидация email
        if '@' not in text or '.' not in text:
            send_message(
                chat_id,
                "❌ Неверный формат email. Попробуйте снова:"
            )
            return True
        
        set_registration_state(telegram_id, 'awaiting_owner_phone', {'owner_email': text})
        send_message_with_buttons(
            chat_id,
            f"✅ Email: {text}\n\n"
            f"Шаг 4/4: Введите ваш телефон (или '-' чтобы пропустить):",
            buttons
        )
        return True
    
    # Шаг 4: Телефон владельца
    elif state == 'awaiting_owner_phone':
        phone = None if text.strip() == '-' else text
        
        # Создать организацию и пользователя
        create_organization_and_owner(chat_id, telegram_id, data, phone)
        return True
    
    return False


def create_organization_and_owner(chat_id: int, telegram_id: int, data: dict, phone: str = None):
    """Создать организацию с владельцем"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        org_name = data.get('org_name')
        owner_name = data.get('owner_name')
        owner_email = data.get('owner_email')
        telegram_username = data.get('telegram_username')
        
        # Проверить существование email
        cur.execute(
            "SELECT id FROM users WHERE username = %s",
            (owner_email,)
        )
        
        if cur.fetchone():
            send_message(
                chat_id,
                f"❌ Пользователь с email {owner_email} уже существует.\n\n"
                f"Используйте другой email или войдите в систему через веб-интерфейс."
            )
            clear_registration_state(telegram_id)
            return
        
        # Создать организацию с тарифом Free
        subscription_end = datetime.now() + timedelta(days=30)
        
        cur.execute(
            """
            INSERT INTO organizations (
                name, subscription_tier, subscription_end_date,
                users_limit, matrices_limit, clients_limit,
                created_at
            )
            VALUES (%s, 'free', %s, 3, 1, 10, CURRENT_TIMESTAMP)
            RETURNING id
            """,
            (org_name, subscription_end)
        )
        
        org_id = cur.fetchone()[0]
        
        # Сгенерировать временный пароль
        temp_password = generate_password(12)
        password_hash = hash_password(temp_password)
        
        # Создать владельца
        cur.execute(
            """
            INSERT INTO users (
                organization_id, username, password_hash, full_name,
                role, telegram_id, phone,
                is_active, created_at
            )
            VALUES (%s, %s, %s, %s, 'owner', %s, %s, true, CURRENT_TIMESTAMP)
            RETURNING id
            """,
            (org_id, owner_email, password_hash, owner_name, telegram_id, phone)
        )
        
        user_id = cur.fetchone()[0]
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Отправить учётные данные
        web_url = os.environ.get('WEB_APP_URL', 'https://app.poehali.dev')
        
        message = (
            f"✅ Аккаунт успешно создан!\n\n"
            f"🏢 **Организация:** {org_name}\n"
            f"📧 **Логин:** {owner_email}\n"
            f"🔑 **Временный пароль:** `{temp_password}`\n\n"
            f"📊 **Тариф:** Free (30 дней)\n"
            f"👥 Лимит пользователей: 3\n"
            f"📊 Лимит матриц: 1\n"
            f"👔 Лимит клиентов: 10\n\n"
            f"🌐 Войдите в систему:\n{web_url}\n\n"
            f"⚠️ **Важно:** Смените пароль после первого входа в настройках профиля!"
        )
        
        buttons = [
            [{'text': '➕ Добавить клиента', 'callback_data': 'add_client'}],
            [{'text': '💬 Поддержка', 'callback_data': 'support'}]
        ]
        
        send_message_with_buttons(chat_id, message, buttons)
        
        # Очистить состояние
        clear_registration_state(telegram_id)
        
    except Exception as e:
        send_message(
            chat_id,
            f"❌ Ошибка при создании аккаунта: {str(e)}\n\n"
            f"Попробуйте снова или обратитесь в поддержку."
        )
        clear_registration_state(telegram_id)


def cancel_registration(chat_id: int, telegram_id: int):
    """Отменить регистрацию"""
    clear_registration_state(telegram_id)
    
    buttons = [
        [{'text': '🚀 Создать аккаунт', 'url': f't.me/{os.environ.get("TELEGRAM_BOT_USERNAME", "your_bot")}?start=create_org'}],
        [{'text': '💬 Поддержка', 'callback_data': 'support'}]
    ]
    
    send_message_with_buttons(
        chat_id,
        "❌ Регистрация отменена.\n\nВыберите действие:",
        buttons
    )
