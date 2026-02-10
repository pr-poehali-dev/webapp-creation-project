"""
API для управления настройками администратора.
Позволяет менять логин и пароль админа.
"""
import json
import os
import jwt
import bcrypt
import psycopg2


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def verify_admin_token(token: str) -> dict:
    """Проверить JWT токен администратора"""
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        
        if payload.get('role') != 'admin':
            return None
        
        return payload
    except:
        return None


def update_admin_username(admin_id: int, new_username: str):
    """Изменить логин администратора"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        new_username = new_username.strip()
        
        if not new_username:
            return {'error': 'Username required'}
        
        # Проверить, что новый username свободен
        cur.execute(
            "SELECT id FROM admin_users WHERE username = %s AND id != %s",
            (new_username, admin_id)
        )
        if cur.fetchone():
            return {'error': 'Username already taken'}
        
        # Обновить username
        cur.execute(
            "UPDATE admin_users SET username = %s WHERE id = %s",
            (new_username, admin_id)
        )
        conn.commit()
        
        if cur.rowcount == 0:
            return {'error': 'Admin not found'}
        
        return {'success': True, 'username': new_username}
        
    finally:
        cur.close()
        conn.close()


def update_admin_password(admin_id: int, current_password: str, new_password: str):
    """Изменить пароль администратора"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if not current_password or not new_password:
            return {'error': 'Current and new password required'}
        
        if len(new_password) < 8:
            return {'error': 'Password must be at least 8 characters'}
        
        # Получить текущий хеш пароля
        cur.execute(
            "SELECT password_hash FROM admin_users WHERE id = %s",
            (admin_id,)
        )
        result = cur.fetchone()
        
        if not result:
            return {'error': 'Admin not found'}
        
        current_hash = result[0]
        
        # Проверить текущий пароль
        if not bcrypt.checkpw(current_password.encode('utf-8'), current_hash.encode('utf-8')):
            return {'error': 'Current password is incorrect'}
        
        # Сгенерировать новый хеш
        new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Обновить пароль
        cur.execute(
            "UPDATE admin_users SET password_hash = %s WHERE id = %s",
            (new_hash, admin_id)
        )
        conn.commit()
        
        return {'success': True}
        
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    """
    Управление настройками администратора.
    PUT /admin-settings?action=username - изменить логин
    PUT /admin-settings?action=password - изменить пароль
    """
    method = event.get('httpMethod', 'PUT')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    # Проверить авторизацию
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '')
    
    admin = verify_admin_token(token)
    if not admin:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    if method != 'PUT':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        admin_id = admin.get('admin_id')
        body = json.loads(event.get('body', '{}'))
        
        # Определить действие по query параметру
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '')
        
        if action == 'username':
            # Изменить логин
            new_username = body.get('username', '')
            result = update_admin_username(admin_id, new_username)
            
        elif action == 'password':
            # Изменить пароль
            current_password = body.get('current_password', '')
            new_password = body.get('new_password', '')
            result = update_admin_password(admin_id, current_password, new_password)
            
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action. Use ?action=username or ?action=password'})
            }
        
        if 'error' in result:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }