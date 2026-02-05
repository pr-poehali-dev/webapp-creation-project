import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления шаблонами матриц и критериями'''
    
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
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = body.get('action', 'list')
        
        auth_header = event.get('headers', {}).get('X-Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header else None
        
        user_id = None
        organization_id = None
        
        if token:
            user_id, organization_id = get_user_from_token(conn, token)
        
        if action == 'list':
            result = list_templates(conn, organization_id)
        elif action == 'get_template':
            template_id = body.get('template_id')
            result = get_template_details(conn, template_id, organization_id)
        elif action == 'create_from_template':
            if not user_id:
                conn.close()
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            template_id = body.get('template_id')
            matrix_name = body.get('matrix_name')
            matrix_description = body.get('matrix_description', '')
            result = create_matrix_from_template(conn, template_id, matrix_name, matrix_description, organization_id, user_id)
        elif action == 'create_custom':
            if not user_id:
                conn.close()
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            matrix_name = body.get('matrix_name')
            matrix_description = body.get('matrix_description', '')
            result = create_custom_matrix(conn, matrix_name, matrix_description, organization_id, user_id)
        elif action == 'add_criterion':
            if not user_id:
                conn.close()
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            matrix_id = body.get('matrix_id')
            axis = body.get('axis')
            name = body.get('name')
            weight = body.get('weight', 1.0)
            min_value = body.get('min_value', 0)
            max_value = body.get('max_value', 10)
            hint = body.get('hint', '')
            result = add_criterion_to_matrix(conn, matrix_id, axis, name, weight, min_value, max_value, hint, organization_id)
        elif action == 'update_criterion':
            if not user_id:
                conn.close()
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            criterion_id = body.get('criterion_id')
            updates = body.get('updates', {})
            result = update_criterion(conn, criterion_id, updates, organization_id)
        elif action == 'remove_criterion':
            if not user_id:
                conn.close()
                return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Требуется авторизация'}), 'isBase64Encoded': False}
            criterion_id = body.get('criterion_id')
            result = remove_criterion(conn, criterion_id, organization_id)
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
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_user_from_token(conn, token: str):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT u.id, u.organization_id
            FROM users u
            WHERE u.auth_token = %s
        ''', (token,))
        user = cur.fetchone()
        if user:
            return user['id'], user['organization_id']
        return None, None


def list_templates(conn, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, name, description, is_system
            FROM matrix_templates
            WHERE is_system = TRUE OR organization_id = %s
            ORDER BY is_system DESC, name
        ''', (organization_id,))
        templates = cur.fetchall()
        return {'templates': [dict(t) for t in templates]}


def get_template_details(conn, template_id: int, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id, name, description, is_system
            FROM matrix_templates
            WHERE id = %s AND (is_system = TRUE OR organization_id = %s)
        ''', (template_id, organization_id))
        template = cur.fetchone()
        
        if not template:
            raise ValueError('Шаблон не найден')
        
        cur.execute('''
            SELECT id, axis, name, weight, min_value, max_value, hint, sort_order
            FROM template_criteria
            WHERE template_id = %s
            ORDER BY axis, sort_order
        ''', (template_id,))
        criteria = cur.fetchall()
        
        template_dict = dict(template)
        template_dict['criteria'] = [dict(c) for c in criteria]
        
        return {'template': template_dict}


def create_matrix_from_template(conn, template_id: int, matrix_name: str, matrix_description: str, organization_id: int, user_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            INSERT INTO matrices (organization_id, name, description, template_id, created_by)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        ''', (organization_id, matrix_name, matrix_description, template_id, user_id))
        matrix_id = cur.fetchone()['id']
        
        cur.execute('''
            SELECT axis, name, weight, min_value, max_value, hint, sort_order
            FROM template_criteria
            WHERE template_id = %s
        ''', (template_id,))
        template_criteria = cur.fetchall()
        
        for criterion in template_criteria:
            cur.execute('''
                INSERT INTO matrix_criteria (matrix_id, axis, name, description, weight, min_value, max_value, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                matrix_id,
                criterion['axis'],
                criterion['name'],
                criterion.get('hint', ''),
                criterion['weight'],
                criterion['min_value'],
                criterion['max_value'],
                criterion['sort_order']
            ))
        
        conn.commit()
        return {'matrix_id': matrix_id, 'message': 'Матрица создана из шаблона'}


def create_custom_matrix(conn, matrix_name: str, matrix_description: str, organization_id: int, user_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            INSERT INTO matrices (organization_id, name, description, created_by)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (organization_id, matrix_name, matrix_description, user_id))
        matrix_id = cur.fetchone()['id']
        
        cur.execute('''
            INSERT INTO matrix_criteria (matrix_id, axis, name, weight, min_value, max_value, description, sort_order)
            VALUES (%s, 'universal', 'Зрелость потребности', 1, 0, 10, 'Насколько клиент осознаёт потребность в решении', 1)
        ''', (matrix_id,))
        
        conn.commit()
        return {'matrix_id': matrix_id, 'message': 'Пустая матрица создана'}


def add_criterion_to_matrix(conn, matrix_id: int, axis: str, name: str, weight: float, min_value: float, max_value: float, hint: str, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT id FROM matrices WHERE id = %s AND organization_id = %s
        ''', (matrix_id, organization_id))
        if not cur.fetchone():
            raise ValueError('Матрица не найдена')
        
        cur.execute('''
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
            FROM matrix_criteria
            WHERE matrix_id = %s AND axis = %s
        ''', (matrix_id, axis))
        next_order = cur.fetchone()['next_order']
        
        cur.execute('''
            INSERT INTO matrix_criteria (matrix_id, axis, name, weight, min_value, max_value, description, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (matrix_id, axis, name, weight, min_value, max_value, hint, next_order))
        criterion_id = cur.fetchone()['id']
        
        conn.commit()
        return {'criterion_id': criterion_id, 'message': 'Критерий добавлен'}


def update_criterion(conn, criterion_id: int, updates: dict, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT mc.id
            FROM matrix_criteria mc
            JOIN matrices m ON mc.matrix_id = m.id
            WHERE mc.id = %s AND m.organization_id = %s
        ''', (criterion_id, organization_id))
        if not cur.fetchone():
            raise ValueError('Критерий не найден')
        
        allowed_fields = ['name', 'weight', 'min_value', 'max_value', 'description']
        set_clause = ', '.join([f"{field} = %s" for field in updates.keys() if field in allowed_fields])
        values = [updates[field] for field in updates.keys() if field in allowed_fields]
        values.append(criterion_id)
        
        if set_clause:
            cur.execute(f'UPDATE matrix_criteria SET {set_clause} WHERE id = %s', values)
            conn.commit()
        
        return {'message': 'Критерий обновлён'}


def remove_criterion(conn, criterion_id: int, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT mc.id
            FROM matrix_criteria mc
            JOIN matrices m ON mc.matrix_id = m.id
            WHERE mc.id = %s AND m.organization_id = %s
        ''', (criterion_id, organization_id))
        if not cur.fetchone():
            raise ValueError('Критерий не найден')
        
        cur.execute('UPDATE matrix_criteria SET is_active = FALSE WHERE id = %s', (criterion_id,))
        conn.commit()
        
        return {'message': 'Критерий удалён'}