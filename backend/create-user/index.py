"""
API для создания новых пользователей в организации.
Только для owner и admin с правами на приглашение пользователей.
"""
import json
import os
import jwt
import bcrypt
import psycopg2
import secrets
import string


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def generate_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def verify_jwt_token(token: str) -> dict:
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except:
        return None


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def handler(event: dict, context) -> dict:
    """
    Создание нового пользователя в организации.
    Требуется авторизация owner/admin с правами team_access.
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    payload = verify_jwt_token(token)
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    user_id = payload.get('user_id')
    organization_id = payload.get('organization_id')
    user_role = payload.get('role')
    
    if user_role not in ['owner', 'admin']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Только owner и admin могут создавать пользователей'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip().lower()
        full_name = body.get('full_name', '').strip()
        role = body.get('role', 'manager')
        auto_password = body.get('auto_password', True)
        password = body.get('password', '') if not auto_password else generate_password()
        
        if not all([username, full_name, role]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Username, full_name и role обязательны'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(
                """
                SELECT users_limit, 
                       (SELECT COUNT(*) FROM users WHERE organization_id = %s AND is_active = true) as current_users
                FROM organizations 
                WHERE id = %s
                """ % (organization_id, organization_id)
            )
            result = cur.fetchone()
            
            if not result:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Организация не найдена'})
                }
            
            users_limit, current_users = result
            
            if current_users >= users_limit:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'error': f'Достигнут лимит пользователей ({users_limit}). Обновите тариф.'
                    })
                }
            
            cur.execute("SELECT id FROM users WHERE username = '%s'" % username)
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username уже занят'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                """
                INSERT INTO users (organization_id, username, password_hash, full_name, role, is_active)
                VALUES (%s, '%s', '%s', '%s', '%s', true)
                RETURNING id
                """ % (organization_id, username, password_hash, full_name, role)
            )
            new_user_id = cur.fetchone()[0]
            
            cur.execute(
                """
                INSERT INTO user_permissions (user_id, organization_id)
                VALUES (%s, %s)
                """ % (new_user_id, organization_id)
            )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': new_user_id,
                        'username': username,
                        'password': password,
                        'full_name': full_name,
                        'role': role
                    }
                })
            }
        
        finally:
            cur.close()
            conn.close()
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
