"""
Обработчики для оценки клиента через FSM
"""
import json
from typing import Optional
from telegram_api import send_message, send_message_with_buttons
from fsm_client import get_user_state, set_user_state, clear_user_state, get_db_connection, get_matrix_criteria, save_client_without_assessment


def start_assessment(chat_id: int, telegram_id: int, matrix_id: int):
    """Начать процесс оценки клиента"""
    state_data = get_user_state(telegram_id)
    if not state_data:
        send_message(chat_id, "❌ Ошибка: сессия истекла. Начните заново.")
        return
    
    # Получить критерии матрицы
    criteria = get_matrix_criteria(matrix_id)
    
    if not criteria:
        send_message(chat_id, "❌ У выбранной матрицы нет критериев для оценки.")
        return
    
    # Сохранить данные для оценки
    set_user_state(telegram_id, 'awaiting_criterion_score', {
        'matrix_id': matrix_id,
        'criteria': criteria,
        'current_criterion_index': 0,
        'scores': []
    })
    
    # Показать первый критерий
    show_criterion(chat_id, telegram_id, criteria[0], 0, len(criteria))


def show_criterion(chat_id: int, telegram_id: int, criterion: dict, current: int, total: int):
    """Показать критерий для оценки"""
    axis_label = {
        'x': '📊 Ось X: Стратегическое влияние',
        'y': '📈 Ось Y: Зрелость потребности'
    }.get(criterion['axis'], '📋 Критерий')
    
    message = f"{axis_label}\n\n"
    message += f"**{criterion['name']}**\n\n"
    
    if criterion['description']:
        message += f"_{criterion['description']}_\n\n"
    
    message += f"Прогресс: {current + 1}/{total}\n\n"
    message += "Выберите подходящий вариант:"
    
    # Кнопки со статусами
    buttons = []
    for status in criterion['statuses']:
        buttons.append([{
            'text': f"{status['label']} ({status['weight']} балл{get_plural(status['weight'])})",
            'callback_data': f"score_{criterion['id']}_{status['id']}_{status['weight']}"
        }])
    
    # Кнопка отмены
    buttons.append([{'text': '❌ Отменить оценку', 'callback_data': 'cancel_assessment'}])
    
    send_message_with_buttons(chat_id, message, buttons)


def handle_criterion_score(chat_id: int, telegram_id: int, criterion_id: int, status_id: int, weight: int):
    """Обработать выбор оценки по критерию"""
    state_data = get_user_state(telegram_id)
    if not state_data or state_data.get('state') != 'awaiting_criterion_score':
        send_message(chat_id, "❌ Ошибка: сессия оценки истекла.")
        return
    
    data = state_data.get('data', {})
    criteria = data.get('criteria', [])
    current_index = data.get('current_criterion_index', 0)
    scores = data.get('scores', [])
    
    # Сохранить оценку
    scores.append({
        'criterion_id': criterion_id,
        'status_id': status_id,
        'score': weight
    })
    
    # Перейти к следующему критерию
    next_index = current_index + 1
    
    if next_index < len(criteria):
        # Показать следующий критерий
        set_user_state(telegram_id, 'awaiting_criterion_score', {
            'current_criterion_index': next_index,
            'scores': scores
        })
        show_criterion(chat_id, telegram_id, criteria[next_index], next_index, len(criteria))
    else:
        # Все критерии оценены - сохранить клиента с оценкой
        save_client_with_assessment(chat_id, telegram_id, data, scores)


def save_client_with_assessment(chat_id: int, telegram_id: int, data: dict, scores: list):
    """Сохранить клиента с оценкой"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Вычислить score_x и score_y
        score_x = 0
        score_y = 0
        total_weight_x = 0
        total_weight_y = 0
        
        matrix_id = data.get('matrix_id')
        criteria = data.get('criteria', [])
        
        for score in scores:
            criterion = next((c for c in criteria if c['id'] == score['criterion_id']), None)
            if criterion:
                if criterion['axis'] == 'x':
                    score_x += score['score'] * criterion['weight']
                    total_weight_x += criterion['weight']
                elif criterion['axis'] == 'y':
                    score_y += score['score'] * criterion['weight']
                    total_weight_y += criterion['weight']
        
        # Нормализовать оценки (0-10)
        final_score_x = (score_x / total_weight_x) if total_weight_x > 0 else 0
        final_score_y = (score_y / total_weight_y) if total_weight_y > 0 else 0
        
        # Определить квадрант
        quadrant = ''
        if final_score_x >= 5 and final_score_y >= 5:
            quadrant = 'focus'
        elif final_score_x >= 5 and final_score_y < 5:
            quadrant = 'grow'
        elif final_score_x < 5 and final_score_y >= 5:
            quadrant = 'monitor'
        else:
            quadrant = 'archive'
        
        # Создать клиента
        cur.execute(
            """
            INSERT INTO clients (
                organization_id, matrix_id, company_name, contact_person, 
                phone, email, description, 
                score_x, score_y, quadrant,
                created_by, responsible_user_id, created_via, 
                is_active, created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'telegram', true, CURRENT_TIMESTAMP)
            RETURNING id
            """, (
                data['org_id'],
                matrix_id,
                data['company_name'],
                data.get('contact_person'),
                data.get('phone'),
                data.get('email'),
                data.get('description'),
                round(final_score_x, 2),
                round(final_score_y, 2),
                quadrant,
                data['user_id'],
                data['user_id']
            )
        )
        
        client_id = cur.fetchone()[0]
        
        # Сохранить детальные оценки
        for score in scores:
            cur.execute(
                """
                INSERT INTO client_scores (client_id, criterion_id, score, comment)
                VALUES (%s, %s, %s, %s)
                """,
                (client_id, score['criterion_id'], score['score'], '')
            )
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Формируем итоговое сообщение
        quadrant_labels = {
            'focus': '🎯 Фокус сейчас',
            'grow': '🌱 Выращивать',
            'monitor': '👁 Мониторить',
            'archive': '📦 Архив'
        }
        
        summary = f"✅ Клиент успешно добавлен и оценен!\n\n"
        summary += f"🏢 Компания: {data['company_name']}\n"
        if data.get('contact_person'):
            summary += f"👤 Контакт: {data['contact_person']}\n"
        if data.get('phone'):
            summary += f"📞 Телефон: {data['phone']}\n"
        if data.get('email'):
            summary += f"📧 Email: {data['email']}\n"
        
        summary += f"\n📊 Оценка:\n"
        summary += f"• Ось X: {final_score_x:.1f}/10\n"
        summary += f"• Ось Y: {final_score_y:.1f}/10\n"
        summary += f"• Квадрант: {quadrant_labels.get(quadrant, 'Неизвестно')}\n"
        
        summary += f"\nID клиента: #{client_id}"
        
        main_menu_buttons = [
            [{'text': '➕ Добавить еще клиента', 'callback_data': 'add_client'}],
            [{'text': '💬 Поддержка', 'callback_data': 'support'}]
        ]
        
        send_message_with_buttons(chat_id, summary, main_menu_buttons)
        
        # Очистить состояние
        clear_user_state(telegram_id)
        
    except Exception as e:
        send_message(
            chat_id,
            f"❌ Ошибка при добавлении клиента: {str(e)}\n\n"
            f"Попробуйте снова или обратитесь в поддержку."
        )
        clear_user_state(telegram_id)


def cancel_assessment(chat_id: int, telegram_id: int):
    """Отменить оценку и сохранить клиента без неё"""
    state_data = get_user_state(telegram_id)
    if not state_data:
        send_message(chat_id, "❌ Ошибка: сессия истекла.")
        return
    
    data = state_data.get('data', {})
    save_client_without_assessment(chat_id, telegram_id, data, data.get('description'))


def get_plural(num: int) -> str:
    """Получить правильное окончание для слова 'балл'"""
    if num == 1:
        return ''
    elif 2 <= num <= 4:
        return 'а'
    else:
        return 'ов'
