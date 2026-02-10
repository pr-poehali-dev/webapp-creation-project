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
            elif action == 'delete_permanently':
                return handle_delete_permanently(payload, body)
            elif action == 'update_axis_names':
                return handle_update_axis_names(payload, body)
            elif action == 'update_quadrant_rules':
                return handle_update_quadrant_rules(payload, body)
            elif action == 'get':
                matrix_id = body.get('matrix_id')
                return handle_get(payload, matrix_id)
            elif action == 'get_delete_stats':
                return handle_get_delete_stats(payload, body)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action. Use: create, update, delete, delete_permanently, update_axis_names, update_quadrant_rules, get, or get_delete_stats'}),
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
        import traceback
        print(f"ERROR: {str(e)}")
        print(traceback.format_exc())
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
            "DELETE FROM matrices WHERE deleted_at < NOW() - INTERVAL '3 days'"
        )
        conn.commit()
        
        cur.execute(
            """
            SELECT m.id, m.name, m.description, m.is_active, m.created_at, m.deleted_at, u.full_name,
                   COUNT(DISTINCT mc.id) as criteria_count, m.axis_x_name, m.axis_y_name
            FROM matrices m
            LEFT JOIN users u ON m.created_by = u.id
            LEFT JOIN matrix_criteria mc ON m.id = mc.matrix_id
            WHERE m.organization_id = %s
            GROUP BY m.id, m.name, m.description, m.is_active, m.created_at, m.deleted_at, u.id, u.full_name, m.axis_x_name, m.axis_y_name
            ORDER BY m.deleted_at IS NULL DESC, m.is_active DESC, m.created_at DESC
            """,
            (organization_id,)
        )
        
        matrices = []
        for row in cur.fetchall():
            matrices.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'is_active': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'deleted_at': row[5].isoformat() if row[5] else None,
                'created_by_name': row[6],
                'criteria_count': row[7],
                'axis_x_name': row[8] or 'Ось X',
                'axis_y_name': row[9] or 'Ось Y'
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
            SELECT m.id, m.name, m.description, m.is_active, m.created_at, u.full_name, m.axis_x_name, m.axis_y_name
            FROM matrices m
            LEFT JOIN users u ON m.created_by = u.id
            WHERE m.id = %s AND m.organization_id = %s
            """,
            (matrix_id, organization_id)
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
            'created_by_name': result[5],
            'axis_x_name': result[6] or 'Ось X',
            'axis_y_name': result[7] or 'Ось Y'
        }
        
        cur.execute(
            """
            SELECT id, axis, name, description, weight, min_value, max_value, sort_order
            FROM matrix_criteria
            WHERE matrix_id = %s
            ORDER BY axis, sort_order
            """,
            (matrix_id,)
        )
        
        criteria = []
        for row in cur.fetchall():
            criterion_id = row[0]
            
            cur.execute(
                """SELECT label, weight, sort_order FROM criterion_statuses 
                   WHERE criterion_id = %s ORDER BY sort_order""",
                (criterion_id,)
            )
            statuses = []
            for status_row in cur.fetchall():
                statuses.append({
                    'label': status_row[0],
                    'weight': status_row[1],
                    'sort_order': status_row[2]
                })
            
            criteria.append({
                'id': criterion_id,
                'axis': row[1],
                'name': row[2],
                'description': row[3],
                'weight': row[4],
                'min_value': row[5],
                'max_value': row[6],
                'sort_order': row[7],
                'statuses': statuses
            })
        
        matrix['criteria'] = criteria
        
        cur.execute(
            """
            SELECT quadrant, x_min, y_min, x_operator, priority
            FROM matrix_quadrant_rules
            WHERE matrix_id = %s
            ORDER BY priority
            """,
            (matrix_id,)
        )
        
        quadrant_rules = []
        for row in cur.fetchall():
            quadrant_rules.append({
                'quadrant': row[0],
                'x_min': float(row[1]),
                'y_min': float(row[2]),
                'x_operator': row[3],
                'priority': row[4]
            })
        
        matrix['quadrant_rules'] = quadrant_rules
        
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
            statuses = criterion.get('statuses', [])
            
            if not crit_name:
                continue
            
            if axis not in ['x', 'y']:
                axis = 'x'
            
            cur.execute(
                "INSERT INTO matrix_criteria (matrix_id, axis, name, description, weight, min_value, max_value, sort_order) VALUES (%s, '%s', '%s', '%s', %s, %s, %s, %s) RETURNING id" % (matrix_id, axis, crit_name.replace("'", "''"), crit_desc.replace("'", "''"), weight, min_val, max_val, sort_order)
            )
            criterion_id = cur.fetchone()[0]
            
            for status in statuses:
                status_label = status.get('label', '').strip()
                status_weight = status.get('weight', 1)
                status_sort = status.get('sort_order', 0)
                
                if status_label:
                    cur.execute(
                        "INSERT INTO criterion_statuses (criterion_id, label, weight, sort_order) VALUES (%s, '%s', %s, %s)" % (criterion_id, status_label.replace("'", "''"), status_weight, status_sort)
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
                statuses = criterion.get('statuses', [])
                
                if not crit_name:
                    continue
                
                if axis not in ['x', 'y']:
                    axis = 'x'
                
                if crit_id:
                    cur.execute(
                        "UPDATE matrix_criteria SET axis = '%s', name = '%s', description = '%s', weight = %s, min_value = %s, max_value = %s, sort_order = %s WHERE id = %s AND matrix_id = %s" % (axis, crit_name.replace("'", "''"), crit_desc.replace("'", "''"), weight, min_val, max_val, sort_order, crit_id, matrix_id)
                    )
                    
                    cur.execute("DELETE FROM criterion_statuses WHERE criterion_id = %s" % crit_id)
                else:
                    cur.execute(
                        "INSERT INTO matrix_criteria (matrix_id, axis, name, description, weight, min_value, max_value, sort_order) VALUES (%s, '%s', '%s', '%s', %s, %s, %s, %s) RETURNING id" % (matrix_id, axis, crit_name.replace("'", "''"), crit_desc.replace("'", "''"), weight, min_val, max_val, sort_order)
                    )
                    crit_id = cur.fetchone()[0]
                
                for status in statuses:
                    status_label = status.get('label', '').strip()
                    status_weight = status.get('weight', 1)
                    status_sort = status.get('sort_order', 0)
                    
                    if status_label:
                        cur.execute(
                            "INSERT INTO criterion_statuses (criterion_id, label, weight, sort_order) VALUES (%s, '%s', %s, %s)" % (crit_id, status_label.replace("'", "''"), status_weight, status_sort)
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
    """Деактивация матрицы (мягкое удаление)"""
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
        
        cur.execute("UPDATE matrices SET deleted_at = CURRENT_TIMESTAMP WHERE id = %s" % matrix_id)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Матрица будет автоматически удалена через 3 дня'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_update_axis_names(payload: dict, body: dict) -> dict:
    """Обновление названий осей матрицы"""
    if payload['role'] not in ['owner', 'admin', 'manager']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Permission denied'}),
            'isBase64Encoded': False
        }
    
    matrix_id = body.get('matrix_id')
    axis_x_name = body.get('axis_x_name', '').strip()
    axis_y_name = body.get('axis_y_name', '').strip()
    
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
                'body': json.dumps({'error': 'Cannot modify matrix from different organization'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            "UPDATE matrices SET axis_x_name = '%s', axis_y_name = '%s', updated_at = CURRENT_TIMESTAMP WHERE id = %s" % (axis_x_name.replace("'", "''"), axis_y_name.replace("'", "''"), matrix_id)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Axis names updated successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_delete_permanently(payload: dict, body: dict) -> dict:
    """Полное удаление матрицы"""
    if payload['role'] not in ['owner', 'admin']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only owner and admin can permanently delete matrices'}),
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
            "SELECT organization_id, deleted_at FROM matrices WHERE id = %s" % matrix_id
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
        
        if result[1] is None:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Matrix must be deleted first before permanent deletion'}),
                'isBase64Encoded': False
            }
        
        # Каскадное удаление в правильном порядке
        
        # 1. Удаляем оценки клиентов по критериям (client_scores и client_criterion_scores)
        cur.execute(
            "DELETE FROM client_scores WHERE criterion_id IN (SELECT id FROM matrix_criteria WHERE matrix_id = %s)" % matrix_id
        )
        deleted_client_scores = cur.rowcount
        
        cur.execute(
            "DELETE FROM client_criterion_scores WHERE criterion_id IN (SELECT id FROM matrix_criteria WHERE matrix_id = %s)" % matrix_id
        )
        deleted_criterion_scores = cur.rowcount
        
        # 2. Удаляем статусы критериев
        cur.execute(
            "DELETE FROM criterion_statuses WHERE criterion_id IN (SELECT id FROM matrix_criteria WHERE matrix_id = %s)" % matrix_id
        )
        deleted_statuses = cur.rowcount
        
        # 3. Удаляем критерии матрицы
        cur.execute(
            "DELETE FROM matrix_criteria WHERE matrix_id = %s" % matrix_id
        )
        deleted_criteria = cur.rowcount
        
        # 4. Отвязываем клиентов от матрицы (НЕ удаляем их!)
        cur.execute(
            "UPDATE clients SET matrix_id = NULL, score_x = 0, score_y = 0, quadrant = NULL WHERE matrix_id = %s" % matrix_id
        )
        unlinked_clients = cur.rowcount
        
        # 5. Удаляем саму матрицу
        cur.execute("DELETE FROM matrices WHERE id = %s" % matrix_id)
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Матрица удалена навсегда',
                'deleted_criteria': deleted_criteria,
                'deleted_statuses': deleted_statuses,
                'unlinked_clients': unlinked_clients
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_update_quadrant_rules(payload: dict, body: dict) -> dict:
    """Обновление правил квадрантов матрицы"""
    if payload['role'] not in ['owner', 'admin', 'manager']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Permission denied'}),
            'isBase64Encoded': False
        }
    
    matrix_id = body.get('matrix_id')
    quadrant_rules = body.get('quadrant_rules', [])
    
    if not matrix_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'matrix_id is required'}),
            'isBase64Encoded': False
        }
    
    if not quadrant_rules or len(quadrant_rules) == 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'quadrant_rules are required'}),
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
                'body': json.dumps({'error': 'Cannot modify matrix from different organization'}),
                'isBase64Encoded': False
            }
        
        cur.execute("DELETE FROM matrix_quadrant_rules WHERE matrix_id = %s" % matrix_id)
        
        for rule in quadrant_rules:
            quadrant = rule.get('quadrant', '').replace("'", "''")
            x_min = rule.get('x_min', 0)
            y_min = rule.get('y_min', 0)
            x_operator = rule.get('x_operator', 'AND').replace("'", "''")
            priority = rule.get('priority', 1)
            
            cur.execute(
                "INSERT INTO matrix_quadrant_rules (matrix_id, quadrant, x_min, y_min, x_operator, priority) VALUES (%s, '%s', %s, %s, '%s', %s)" % (matrix_id, quadrant, x_min, y_min, x_operator, priority)
            )
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Quadrant rules updated successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()


def handle_get_delete_stats(payload: dict, body: dict) -> dict:
    """Получить статистику для предупреждения перед удалением матрицы"""
    if payload['role'] not in ['owner', 'admin']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only owner and admin can view delete statistics'}),
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
        # Проверка принадлежности матрицы организации
        cur.execute(
            "SELECT name FROM matrices WHERE id = %s AND organization_id = %s" % (matrix_id, organization_id)
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Matrix not found'}),
                'isBase64Encoded': False
            }
        
        matrix_name = result[0]
        
        # Подсчёт критериев
        cur.execute(
            "SELECT COUNT(*) FROM matrix_criteria WHERE matrix_id = %s" % matrix_id
        )
        criteria_count = cur.fetchone()[0]
        
        # Подсчёт статусов критериев
        cur.execute(
            "SELECT COUNT(*) FROM criterion_statuses WHERE criterion_id IN (SELECT id FROM matrix_criteria WHERE matrix_id = %s)" % matrix_id
        )
        statuses_count = cur.fetchone()[0]
        
        # Подсчёт клиентов
        cur.execute(
            "SELECT COUNT(*) FROM clients WHERE matrix_id = %s" % matrix_id
        )
        clients_count = cur.fetchone()[0]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'matrix_name': matrix_name,
                'criteria_count': criteria_count,
                'statuses_count': statuses_count,
                'clients_count': clients_count
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()