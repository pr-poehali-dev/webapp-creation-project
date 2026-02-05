"""
API для управления пользователями в организации.
Позволяет получать список пользователей, обновлять роли и статус активности.
Доступ только для owner и admin ролей.
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


def check_permission(user_role: str, required_roles: list) -> bool:
    """Проверка прав доступа"""
    return user_role in required_roles


def handler(event: dict, context) -> dict:
    """
    Управление пользователями организации:
    GET /list - список пользователей организации
    POST /update - обновление роли или статуса пользователя
    POST /delete - деактивация пользователя
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authorization required'})
        }
    
    payload = verify_jwt_token(token)
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    try:
        if method == 'GET':
            return handle_list(payload)
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'update':
                return handle_update(payload, body)
            elif action == 'delete':
                return handle_delete(payload, body)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action. Use: update or delete'})
                }
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def handle_list(payload: dict) -> dict:
    """Получение списка пользователей организации"""
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT id, email, full_name, role, is_active, last_login_at, created_at
            FROM users
            WHERE organization_id = %s
            ORDER BY created_at ASC
            """ % organization_id
        )
        
        users = []
        for row in cur.fetchall():
            users.append({
                'id': row[0],
                'email': row[1],
                'full_name': row[2],
                'role': row[3],
                'is_active': row[4],
                'last_login_at': row[5].isoformat() if row[5] else None,
                'created_at': row[6].isoformat() if row[6] else None
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': users})
        }
    
    finally:
        cur.close()
        conn.close()


def handle_update(payload: dict, body: dict) -> dict:
    """Обновление роли или статуса пользователя"""
    if not check_permission(payload['role'], ['owner', 'admin']):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Permission denied. Only owner and admin can update users'})
        }
    
    user_id = body.get('user_id')
    new_role = body.get('role')
    is_active = body.get('is_active')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id is required'})
        }
    
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id, role, organization_id FROM users WHERE id = %s" % user_id
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        target_role = result[1]
        target_org_id = result[2]
        
        if target_org_id != organization_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot modify user from different organization'})
            }
        
        if target_role == 'owner' and payload['role'] != 'owner':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Only owner can modify owner role'})
            }
        
        updates = []
        if new_role and new_role != target_role:
            if new_role not in ['owner', 'admin', 'manager', 'viewer']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid role'})
                }
            if new_role == 'owner' and payload['role'] != 'owner':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Only owner can assign owner role'})
                }
            updates.append("role = '%s'" % new_role)
        
        if is_active is not None:
            updates.append("is_active = %s" % ('true' if is_active else 'false'))
        
        if not updates:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No updates provided'})
            }
        
        cur.execute(
            "UPDATE users SET %s WHERE id = %s" % (', '.join(updates), user_id)
        )
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'User updated successfully'})
        }
    
    finally:
        cur.close()
        conn.close()


def handle_delete(payload: dict, body: dict) -> dict:
    """Деактивация пользователя"""
    if not check_permission(payload['role'], ['owner', 'admin']):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Permission denied. Only owner and admin can delete users'})
        }
    
    user_id = body.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id is required'})
        }
    
    if user_id == payload['user_id']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Cannot delete yourself'})
        }
    
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT role, organization_id FROM users WHERE id = %s" % user_id
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        target_role = result[0]
        target_org_id = result[1]
        
        if target_org_id != organization_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot delete user from different organization'})
            }
        
        if target_role == 'owner':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot delete organization owner'})
            }
        
        cur.execute("UPDATE users SET is_active = false WHERE id = %s" % user_id)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'User deactivated successfully'})
        }
    
    finally:
        cur.close()
        conn.close()
