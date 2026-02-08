import json
import os
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления настройками организации и статусами сделок"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload['user_id']
        organization_id = payload['organization_id']
        role = payload.get('role', 'viewer')
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = body.get('action', 'get_settings')
        
        if action == 'get_settings':
            result = get_organization_settings(conn, organization_id)
        elif action == 'update_settings':
            if role not in ['owner', 'admin']:
                conn.close()
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно прав'}), 'isBase64Encoded': False}
            result = update_organization_settings(conn, organization_id, body)
        elif action == 'list_deal_statuses':
            result = list_deal_statuses(conn, organization_id)
        elif action == 'create_deal_status':
            if role not in ['owner', 'admin', 'manager']:
                conn.close()
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно прав'}), 'isBase64Encoded': False}
            result = create_deal_status(conn, organization_id, body)
        elif action == 'update_deal_status':
            if role not in ['owner', 'admin', 'manager']:
                conn.close()
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно прав'}), 'isBase64Encoded': False}
            result = update_deal_status(conn, organization_id, body)
        elif action == 'delete_deal_status':
            if role not in ['owner', 'admin', 'manager']:
                conn.close()
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно прав'}), 'isBase64Encoded': False}
            result = delete_deal_status(conn, organization_id, body)
        elif action == 'init_default_statuses':
            if role not in ['owner', 'admin']:
                conn.close()
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно прав'}), 'isBase64Encoded': False}
            result = init_default_statuses(conn, organization_id)
        else:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f'ERROR: {str(e)}')
        print(f'TRACEBACK: {error_details}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_organization_settings(conn, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, name, contact_email, contact_phone, description, 
                   subscription_tier, subscription_status, created_at
            FROM organizations
            WHERE id = %s
        ''', (organization_id,))
        org = cur.fetchone()
        
        if not org:
            raise ValueError('Организация не найдена')
        
        return {'organization': dict(org)}


def update_organization_settings(conn, organization_id: int, body: dict):
    with conn.cursor() as cur:
        updates = []
        params = []
        
        if 'name' in body:
            updates.append("name = %s")
            params.append(body['name'])
        if 'contact_email' in body:
            updates.append("contact_email = %s")
            params.append(body['contact_email'])
        if 'contact_phone' in body:
            updates.append("contact_phone = %s")
            params.append(body['contact_phone'])
        if 'description' in body:
            updates.append("description = %s")
            params.append(body['description'])
        
        if not updates:
            return {'message': 'Нет данных для обновления'}
        
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(organization_id)
        
        query = f"UPDATE organizations SET {', '.join(updates)} WHERE id = %s"
        cur.execute(query, params)
        conn.commit()
        
        return {'message': 'Настройки организации обновлены'}


def list_deal_statuses(conn, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, name, weight, sort_order, is_active, created_at
            FROM deal_statuses
            WHERE organization_id = %s AND is_active = TRUE
            ORDER BY sort_order, id
        ''', (organization_id,))
        statuses = cur.fetchall()
        return {'statuses': [dict(s) for s in statuses]}


def create_deal_status(conn, organization_id: int, body: dict):
    name = body.get('name', '').strip()
    weight = body.get('weight', 0)
    
    if not name:
        raise ValueError('Название статуса обязательно')
    
    if not (0 <= weight <= 10):
        raise ValueError('Вес должен быть от 0 до 10')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT COUNT(*) as count FROM deal_statuses 
            WHERE organization_id = %s AND is_active = TRUE
        ''', (organization_id,))
        count = cur.fetchone()['count']
        
        if count >= 15:
            raise ValueError('Максимум 15 статусов сделок')
        
        cur.execute('''
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
            FROM deal_statuses
            WHERE organization_id = %s
        ''', (organization_id,))
        next_order = cur.fetchone()['next_order']
        
        cur.execute('''
            INSERT INTO deal_statuses (organization_id, name, weight, sort_order)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (organization_id, name, weight, next_order))
        status_id = cur.fetchone()['id']
        
        conn.commit()
        return {'status_id': status_id, 'message': 'Статус сделки создан'}


def update_deal_status(conn, organization_id: int, body: dict):
    status_id = body.get('status_id')
    
    if not status_id:
        raise ValueError('ID статуса обязателен')
    
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id FROM deal_statuses 
            WHERE id = %s AND organization_id = %s
        ''', (status_id, organization_id))
        
        if not cur.fetchone():
            raise ValueError('Статус не найден')
        
        updates = []
        params = []
        
        if 'name' in body:
            updates.append("name = %s")
            params.append(body['name'])
        if 'weight' in body:
            weight = body['weight']
            if not (0 <= weight <= 10):
                raise ValueError('Вес должен быть от 0 до 10')
            updates.append("weight = %s")
            params.append(weight)
        if 'sort_order' in body:
            updates.append("sort_order = %s")
            params.append(body['sort_order'])
        
        if not updates:
            return {'message': 'Нет данных для обновления'}
        
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(status_id)
        params.append(organization_id)
        
        query = f"UPDATE deal_statuses SET {', '.join(updates)} WHERE id = %s AND organization_id = %s"
        cur.execute(query, params)
        conn.commit()
        
        return {'message': 'Статус обновлён'}


def delete_deal_status(conn, organization_id: int, body: dict):
    status_id = body.get('status_id')
    
    if not status_id:
        raise ValueError('ID статуса обязателен')
    
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id FROM deal_statuses 
            WHERE id = %s AND organization_id = %s
        ''', (status_id, organization_id))
        
        if not cur.fetchone():
            raise ValueError('Статус не найден')
        
        cur.execute('''
            UPDATE deal_statuses 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND organization_id = %s
        ''', (status_id, organization_id))
        
        conn.commit()
        return {'message': 'Статус деактивирован'}


def init_default_statuses(conn, organization_id: int):
    with conn.cursor() as cur:
        cur.execute('''
            SELECT COUNT(*) FROM deal_statuses 
            WHERE organization_id = %s AND is_active = TRUE
        ''', (organization_id,))
        count = cur.fetchone()[0]
        
        if count > 0:
            return {'message': 'Статусы уже существуют', 'count': count}
        
        default_statuses = [
            ('Холодный клиент', 2, 1),
            ('Переговоры состоялись', 4, 2),
            ('Подписан пилотный проект', 6, 3),
            ('Согласован бюджет', 8, 4),
            ('Подписан договор на сотрудничество', 10, 5),
        ]
        
        for name, weight, sort_order in default_statuses:
            cur.execute('''
                INSERT INTO deal_statuses (organization_id, name, weight, sort_order)
                VALUES (%s, %s, %s, %s)
            ''', (organization_id, name, weight, sort_order))
        
        conn.commit()
        return {'message': 'Созданы 5 дефолтных статусов', 'count': 5}
