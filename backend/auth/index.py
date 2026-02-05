"""
API для аутентификации пользователей в TechSale CRM.
Поддерживает регистрацию новой организации с первым пользователем (owner),
вход существующих пользователей и проверку JWT токенов.
"""
import json
import os
import jwt
import bcrypt
import psycopg2
from datetime import datetime, timedelta
from typing import Optional


def hash_password(password: str) -> str:
    """Хеширование пароля с использованием bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Проверка пароля"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def create_jwt_token(user_id: int, organization_id: int, email: str, role: str) -> str:
    """Создание JWT токена"""
    secret = os.environ.get('JWT_SECRET')
    payload = {
        'user_id': user_id,
        'organization_id': organization_id,
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, secret, algorithm='HS256')


def verify_jwt_token(token: str) -> Optional[dict]:
    """Проверка JWT токена"""
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_db_connection():
    """Подключение к базе данных"""
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def handler(event: dict, context) -> dict:
    """
    Обработка запросов аутентификации:
    POST /signup - регистрация организации и первого пользователя
    POST /login - вход пользователя
    POST /verify - проверка JWT токена
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'signup':
            return handle_signup(body)
        elif action == 'login':
            return handle_login(body)
        elif action == 'verify':
            return handle_verify(body)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action. Use: signup, login, or verify'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def handle_signup(body: dict) -> dict:
    """Регистрация новой организации с первым пользователем (owner)"""
    organization_name = body.get('organization_name', '').strip()
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    full_name = body.get('full_name', '').strip()
    
    if not all([organization_name, email, password, full_name]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'All fields are required'})
        }
    
    if len(password) < 8:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Password must be at least 8 characters'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM users WHERE email = '%s'" % email)
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email already registered'})
            }
        
        cur.execute(
            "INSERT INTO organizations (name, subscription_tier, subscription_status) VALUES ('%s', '%s', '%s') RETURNING id" % (organization_name, 'free', 'trial')
        )
        organization_id = cur.fetchone()[0]
        
        password_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (organization_id, email, password_hash, full_name, role) VALUES (%s, '%s', '%s', '%s', '%s') RETURNING id" % (organization_id, email, password_hash, full_name, 'owner')
        )
        user_id = cur.fetchone()[0]
        
        conn.commit()
        
        token = create_jwt_token(user_id, organization_id, email, 'owner')
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'full_name': full_name,
                    'role': 'owner',
                    'organization_id': organization_id,
                    'organization_name': organization_name
                }
            })
        }
    
    finally:
        cur.close()
        conn.close()


def handle_login(body: dict) -> dict:
    """Вход пользователя"""
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    if not all([email, password]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and password are required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT u.id, u.organization_id, u.email, u.password_hash, u.full_name, u.role, u.is_active, o.name
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE u.email = '%s'
            """ % email
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid email or password'})
            }
        
        user_id, organization_id, email, password_hash, full_name, role, is_active, organization_name = result
        
        if not is_active:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Account is disabled'})
            }
        
        if not verify_password(password, password_hash):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid email or password'})
            }
        
        cur.execute("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = %s" % user_id)
        conn.commit()
        
        token = create_jwt_token(user_id, organization_id, email, role)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'full_name': full_name,
                    'role': role,
                    'organization_id': organization_id,
                    'organization_name': organization_name
                }
            })
        }
    
    finally:
        cur.close()
        conn.close()


def handle_verify(body: dict) -> dict:
    """Проверка JWT токена"""
    token = body.get('token', '')
    
    if not token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token is required'})
        }
    
    payload = verify_jwt_token(token)
    
    if not payload:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid or expired token'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT u.id, u.email, u.full_name, u.role, u.is_active, o.id, o.name
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE u.id = %s
            """ % payload['user_id']
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        user_id, email, full_name, role, is_active, organization_id, organization_name = result
        
        if not is_active:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Account is disabled'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'valid': True,
                'user': {
                    'id': user_id,
                    'email': email,
                    'full_name': full_name,
                    'role': role,
                    'organization_id': organization_id,
                    'organization_name': organization_name
                }
            })
        }
    
    finally:
        cur.close()
        conn.close()