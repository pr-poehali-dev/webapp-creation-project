"""
API для управления матрицами приоритизации.
Позволяет создавать матрицы с критериями оценки по осям X и Y,
редактировать, деактивировать и получать список всех матриц организации.
"""
import json
import os
import jwt
import psycopg2
from typing import Optional


def verify_jwt_token(token: str) -> Optional[dict]:
    """Проверка JWT токена"""
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except:
        return None


def get_db_connection():
    """Подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def handler(event: dict, context) -> dict:
    """
    Управление матрицами приоритизации:
    GET /list - список всех матриц организации
    GET /get?id=X - получить матрицу с критериями
    POST /create - создать новую матрицу с критериями
    POST /update - обновить матрицу и критерии
    POST /delete - деактивировать матрицу
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
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
            'body': json.dumps({'error': 'Authorization required'}),
            'isBase64Encoded': False
        }
    
    payload = verify_jwt_token(token)
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            matrix_id = query_params.get('id')
            
            if matrix_id:
                return handle_get(payload, matrix_id)
            else:
                return handle_list(payload)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'create':
                return handle_create(payload, body)
            elif action == 'update':
                return handle_update(payload, body)
            elif action == 'delete':
                return handle_delete(payload, body)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action. Use: create, update, or delete'}),
                    'isBase64Encoded': False
                }
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_list(payload: dict) -> dict:
    """Список всех матриц организации"""
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT m.id, m.name, m.description, m.is_active, m.created_at, u.full_name,
                   COUNT(DISTINCT mc.id) as criteria_count
            FROM matrices m
            LEFT JOIN users u ON m.created_by = u.id
            LEFT JOIN matrix_criteria mc ON m.id = mc.matrix_id
            WHERE m.organization_id = %s
            GROUP BY m.id, m.name, m.description, m.is_active, m.created_at, u.full_name
            ORDER BY m.is_active DESC, m.created_at DESC
            """ % organization_id
        )
        
        matrices = []
        for row in cur.fetchall():
            matrices.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'is_active': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'created_by_name': row[5],
                'criteria_count': row[6]
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'matrices': matrices}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_get(payload: dict, matrix_id: str) -> dict:
    """Получить матрицу с критериями"""
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT m.id, m.name, m.description, m.is_active, m.created_at, u.full_name
            FROM matrices m
            LEFT JOIN users u ON m.created_by = u.id
            WHERE m.id = %s AND m.organization_id = %s
            """ % (matrix_id, organization_id)
        )
        
        result = cur.fetchone()
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Matrix not found'}),
                'isBase64Encoded': False
            }
        
        matrix = {
            'id': result[0],
            'name': result[1],
            'description': result[2],
            'is_active': result[3],
            'created_at': result[4].isoformat() if result[4] else None,
            'created_by_name': result[5]
        }
        
        cur.execute(
            """
            SELECT id, axis, name, description, weight, min_value, max_value, sort_order
            FROM matrix_criteria
            WHERE matrix_id = %s
            ORDER BY axis, sort_order
            """ % matrix_id
        )
        
        criteria = []
        for row in cur.fetchall():
            criteria.append({
                'id': row[0],
                'axis': row[1],
                'name': row[2],
                'description': row[3],
                'weight': row[4],
                'min_value': row[5],
                'max_value': row[6],
                'sort_order': row[7]
            })
        
        matrix['criteria'] = criteria
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'matrix': matrix}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_create(payload: dict, body: dict) -> dict:
    """Создание новой матрицы с критериями"""
    if payload['role'] not in ['owner', 'admin', 'manager']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Permission denied'}),
            'isBase64Encoded': False
        }
    
    name = body.get('name', '').strip()
    description = body.get('description', '').strip()
    criteria = body.get('criteria', [])
    
    if not name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Matrix name is required'}),
            'isBase64Encoded': False
        }
    
    if not criteria or len(criteria) == 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'At least one criterion is required'}),
            'isBase64Encoded': False
        }
    
    organization_id = payload['organization_id']
    created_by = payload['user_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "INSERT INTO matrices (organization_id, name, description, created_by) VALUES (%s, '%s', '%s', %s) RETURNING id" % (organization_id, name.replace("'", "''"), description.replace("'", "''"), created_by)
        )
        matrix_id = cur.fetchone()[0]
        
        for criterion in criteria:
            axis = criterion.get('axis', 'x')
            crit_name = criterion.get('name', '').strip()
            crit_desc = criterion.get('description', '').strip()
            weight = criterion.get('weight', 1)
            min_val = criterion.get('min_value', 0)
            max_val = criterion.get('max_value', 10)
            sort_order = criterion.get('sort_order', 0)
            
            if not crit_name:
                continue
            
            if axis not in ['x', 'y']:
                axis = 'x'
            
            cur.execute(
                "INSERT INTO matrix_criteria (matrix_id, axis, name, description, weight, min_value, max_value, sort_order) VALUES (%s, '%s', '%s', '%s', %s, %s, %s, %s)" % (matrix_id, axis, crit_name.replace("'", "''"), crit_desc.replace("'", "''"), weight, min_val, max_val, sort_order)
            )
        
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'matrix_id': matrix_id,
                'message': 'Matrix created successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_update(payload: dict, body: dict) -> dict:
    """Обновление матрицы и критериев"""
    if payload['role'] not in ['owner', 'admin', 'manager']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Permission denied'}),
            'isBase64Encoded': False
        }
    
    matrix_id = body.get('matrix_id')
    name = body.get('name', '').strip()
    description = body.get('description', '').strip()
    criteria = body.get('criteria', [])
    
    if not matrix_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'matrix_id is required'}),
            'isBase64Encoded': False
        }
    
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT organization_id FROM matrices WHERE id = %s" % matrix_id
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Matrix not found'})
            }
        
        if result[0] != organization_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot modify matrix from different organization'}),
                'isBase64Encoded': False
            }
        
        if name:
            cur.execute(
                "UPDATE matrices SET name = '%s', description = '%s', updated_at = CURRENT_TIMESTAMP WHERE id = %s" % (name.replace("'", "''"), description.replace("'", "''"), matrix_id)
            )
        
        if criteria:
            existing_ids = [c.get('id') for c in criteria if c.get('id')]
            
            if existing_ids:
                cur.execute(
                    "SELECT id FROM matrix_criteria WHERE matrix_id = %s AND id NOT IN (%s)" % (matrix_id, ','.join(map(str, existing_ids)))
                )
            else:
                cur.execute(
                    "SELECT id FROM matrix_criteria WHERE matrix_id = %s" % matrix_id
                )
            
            for criterion in criteria:
                crit_id = criterion.get('id')
                axis = criterion.get('axis', 'x')
                crit_name = criterion.get('name', '').strip()
                crit_desc = criterion.get('description', '').strip()
                weight = criterion.get('weight', 1)
                min_val = criterion.get('min_value', 0)
                max_val = criterion.get('max_value', 10)
                sort_order = criterion.get('sort_order', 0)
                
                if not crit_name:
                    continue
                
                if axis not in ['x', 'y']:
                    axis = 'x'
                
                if crit_id:
                    cur.execute(
                        "UPDATE matrix_criteria SET axis = '%s', name = '%s', description = '%s', weight = %s, min_value = %s, max_value = %s, sort_order = %s WHERE id = %s AND matrix_id = %s" % (axis, crit_name.replace("'", "''"), crit_desc.replace("'", "''"), weight, min_val, max_val, sort_order, crit_id, matrix_id)
                    )
                else:
                    cur.execute(
                        "INSERT INTO matrix_criteria (matrix_id, axis, name, description, weight, min_value, max_value, sort_order) VALUES (%s, '%s', '%s', '%s', %s, %s, %s, %s)" % (matrix_id, axis, crit_name.replace("'", "''"), crit_desc.replace("'", "''"), weight, min_val, max_val, sort_order)
                    )
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Matrix updated successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_delete(payload: dict, body: dict) -> dict:
    """Деактивация матрицы"""
    if payload['role'] not in ['owner', 'admin']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only owner and admin can delete matrices'}),
            'isBase64Encoded': False
        }
    
    matrix_id = body.get('matrix_id')
    
    if not matrix_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'matrix_id is required'}),
            'isBase64Encoded': False
        }
    
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT organization_id FROM matrices WHERE id = %s" % matrix_id
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Matrix not found'}),
                'isBase64Encoded': False
            }
        
        if result[0] != organization_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot delete matrix from different organization'}),
                'isBase64Encoded': False
            }
        
        cur.execute("UPDATE matrices SET is_active = false WHERE id = %s" % matrix_id)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Matrix deactivated successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()