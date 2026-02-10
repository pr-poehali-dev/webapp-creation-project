"""
FSM (Finite State Machine) для добавления клиента через бота
"""
import json
import psycopg2
import os
from typing import Optional, Dict
from telegram_api import send_message, send_message_with_buttons


# In-memory хранилище состояний (в production использовать Redis)
user_states: Dict[int, dict] = {}


def get_user_state(telegram_id: int) -> Optional[dict]:
    """Получить состояние пользователя"""
    return user_states.get(telegram_id)


def set_user_state(telegram_id: int, state: str, data: dict = None):
    """Установить состояние пользователя"""
    if telegram_id not in user_states:
        user_states[telegram_id] = {}
    
    user_states[telegram_id]['state'] = state
    
    if data:
        if 'data' not in user_states[telegram_id]:
            user_states[telegram_id]['data'] = {}
        user_states[telegram_id]['data'].update(data)


def clear_user_state(telegram_id: int):
    """Очистить состояние пользователя"""
    if telegram_id in user_states:
        del user_states[telegram_id]


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def start_client_creation(chat_id: int, telegram_id: int, user_id: int, org_id: int):
    """Начать процесс добавления клиента"""
    set_user_state(telegram_id, 'awaiting_company_name', {
        'user_id': user_id,
        'org_id': org_id
    })
    
    buttons = [[{'text': '❌ Отменить', 'callback_data': 'cancel_client'}]]
    
    send_message_with_buttons(
        chat_id,
        "📝 Добавление нового клиента\n\n"
        "Шаг 1/5: Введите название компании:",
        buttons
    )


def handle_fsm_message(chat_id: int, telegram_id: int, text: str) -> bool:
    """
    Обработать сообщение в контексте FSM.
    Возвращает True если сообщение было обработано FSM.
    """
    state_data = get_user_state(telegram_id)
    
    if not state_data:
        return False
    
    state = state_data.get('state')
    data = state_data.get('data', {})
    
    buttons = [[{'text': '❌ Отменить', 'callback_data': 'cancel_client'}]]
    
    # Шаг 1: Название компании
    if state == 'awaiting_company_name':
        set_user_state(telegram_id, 'awaiting_contact_person', {'company_name': text})
        send_message_with_buttons(
            chat_id,
            f"✅ Компания: {text}\n\n"
            f"Шаг 2/5: Введите контактное лицо (или '-' чтобы пропустить):",
            buttons
        )
        return True
    
    # Шаг 2: Контактное лицо
    elif state == 'awaiting_contact_person':
        contact_person = None if text.strip() == '-' else text
        set_user_state(telegram_id, 'awaiting_phone', {'contact_person': contact_person})
        send_message_with_buttons(
            chat_id,
            f"✅ Контакт: {contact_person or 'не указан'}\n\n"
            f"Шаг 3/5: Введите телефон (или '-' чтобы пропустить):",
            buttons
        )
        return True
    
    # Шаг 3: Телефон
    elif state == 'awaiting_phone':
        phone = None if text.strip() == '-' else text
        set_user_state(telegram_id, 'awaiting_email', {'phone': phone})
        send_message_with_buttons(
            chat_id,
            f"✅ Телефон: {phone or 'не указан'}\n\n"
            f"Шаг 4/5: Введите email (или '-' чтобы пропустить):",
            buttons
        )
        return True
    
    # Шаг 4: Email
    elif state == 'awaiting_email':
        email = None if text.strip() == '-' else text
        set_user_state(telegram_id, 'awaiting_description', {'email': email})
        send_message_with_buttons(
            chat_id,
            f"✅ Email: {email or 'не указан'}\n\n"
            f"Шаг 5/5: Введите описание/заметки (или '-' чтобы пропустить):",
            buttons
        )
        return True
    
    # Шаг 5: Описание
    elif state == 'awaiting_description':
        description = None if text.strip() == '-' else text
        
        # Сохранить клиента в БД
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            cur.execute(
                """
                INSERT INTO clients (
                    organization_id, company_name, contact_person, 
                    phone, email, description, 
                    created_by, responsible_user_id, created_via, 
                    is_active, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'telegram', true, CURRENT_TIMESTAMP)
                RETURNING id
                """, (
                    data['org_id'],
                    data['company_name'],
                    data.get('contact_person'),
                    data.get('phone'),
                    data.get('email'),
                    description,
                    data['user_id'],
                    data['user_id']
                )
            )
            
            client_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            
            # Формируем итоговое сообщение
            summary = f"✅ Клиент успешно добавлен!\n\n"
            summary += f"🏢 Компания: {data['company_name']}\n"
            if data.get('contact_person'):
                summary += f"👤 Контакт: {data['contact_person']}\n"
            if data.get('phone'):
                summary += f"📞 Телефон: {data['phone']}\n"
            if data.get('email'):
                summary += f"📧 Email: {data['email']}\n"
            if description:
                summary += f"📝 Описание: {description}\n"
            
            summary += f"\nID клиента: #{client_id}"
            
            main_menu_buttons = [
                [{'text': '➕ Добавить еще клиента', 'callback_data': 'add_client'}],
                [{'text': '💬 Поддержка', 'callback_data': 'support'}]
            ]
            
            send_message_with_buttons(chat_id, summary, main_menu_buttons)
            
            # Очистить состояние
            clear_user_state(telegram_id)
            
            return True
            
        except Exception as e:
            send_message(
                chat_id,
                f"❌ Ошибка при добавлении клиента: {str(e)}\n\n"
                f"Попробуйте снова или обратитесь в поддержку."
            )
            clear_user_state(telegram_id)
            return True
    
    return False


def cancel_client_creation(chat_id: int, telegram_id: int):
    """Отменить создание клиента"""
    clear_user_state(telegram_id)
    
    buttons = [
        [{'text': '➕ Добавить клиента', 'callback_data': 'add_client'}],
        [{'text': '💬 Поддержка', 'callback_data': 'support'}]
    ]
    
    send_message_with_buttons(
        chat_id,
        "❌ Добавление клиента отменено.\n\nВыберите действие:",
        buttons
    )