"""
API для авторизации администраторов админ-панели CRM.
Возвращает JWT токен для доступа к управлению организациями.
"""
import json
import os
import jwt
import bcrypt
import psycopg2
from datetime import datetime, timedelta


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def verify_admin_password(username: str, password: str) -> dict:
    """Проверить учётные данные администратора"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
            (username,)
        )
        result = cur.fetchone()
        
        if not result:
            print(f"[DEBUG] User not found: {username}")
            return None
        
        admin_id, admin_username, password_hash = result
        print(f"[DEBUG] Found user: {admin_username}, hash type: {type(password_hash)}")
        
        # ВРЕМЕННО: генерируем новый хеш и сравниваем
        test_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        print(f"[DEBUG] Generated test hash: {test_hash.decode('utf-8')}")
        print(f"[DEBUG] DB hash: {password_hash}")
        
        # Проверить пароль - хеш из базы уже строка, конвертируем в bytes
        password_bytes = password.encode('utf-8')
        hash_bytes = password_hash.encode('utf-8') if isinstance(password_hash, str) else password_hash
        
        print(f"[DEBUG] Password length: {len(password)}, Hash length: {len(hash_bytes)}")
        print(f"[DEBUG] Attempting bcrypt.checkpw...")
        
        try:
            result_check = bcrypt.checkpw(password_bytes, hash_bytes)
            print(f"[DEBUG] bcrypt.checkpw result: {result_check}")
        except Exception as check_err:
            print(f"[ERROR] bcrypt.checkpw failed: {check_err}")
            return None
        
        if result_check:
            print(f"[DEBUG] Password verified successfully for {admin_username}")
            return {
                'id': admin_id,
                'username': admin_username
            }
        
        print(f"[DEBUG] Password verification failed for {admin_username}")
        return None
        
    except Exception as e:
        print(f"[ERROR] verify_admin_password exception: {e}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return None
        
    finally:
        cur.close()
        conn.close()


def generate_admin_token(admin_id: int, username: str) -> str:
    """Сгенерировать JWT токен для админа"""
    secret = os.environ.get('JWT_SECRET')
    
    payload = {
        'admin_id': admin_id,
        'username': username,
        'role': 'admin',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    
    return jwt.encode(payload, secret, algorithm='HS256')


def handler(event: dict, context) -> dict:
    """
    Авторизация администратора админ-панели.
    POST /crmadminauth - вход по username и password
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
        username = body.get('username', '').strip()
        password = body.get('password', '')
        
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Username and password required'})
            }
        
        # Проверить учётные данные
        admin = verify_admin_password(username, password)
        
        if not admin:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid credentials'})
            }
        
        # Сгенерировать токен
        token = generate_admin_token(admin['id'], admin['username'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': token,
                'username': admin['username']
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }