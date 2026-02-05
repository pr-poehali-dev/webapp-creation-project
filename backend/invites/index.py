"""
API для управления приглашениями пользователей в организацию.
Позволяет создавать приглашения, принимать их и просматривать список.
"""
import json
import os
import jwt
import bcrypt
import psycopg2
import secrets
from datetime import datetime, timedelta
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


def hash_password(password: str) -> str:
    """Хеширование пароля"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


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


def handler(event: dict, context) -> dict:
    """
    Управление приглашениями:
    POST /create - создать приглашение (требуется auth)
    POST /accept - принять приглашение (публичный)
    GET /list - список приглашений организации (требуется auth)
    POST /cancel - отменить приглашение (требуется auth)
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
    
    try:
        body = json.loads(event.get('body', '{}')) if method == 'POST' else {}
        action = body.get('action')
        
        if action == 'accept':
            return handle_accept(body)
        
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
        
        if method == 'GET':
            return handle_list(payload)
        elif method == 'POST':
            if action == 'create':
                return handle_create(payload, body)
            elif action == 'cancel':
                return handle_cancel(payload, body)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action. Use: create, accept, cancel'})
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


def handle_create(payload: dict, body: dict) -> dict:
    """Создание приглашения"""
    if payload['role'] not in ['owner', 'admin']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only owner and admin can invite users'})
        }
    
    email = body.get('email', '').strip().lower()
    role = body.get('role', 'manager')
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email is required'})
        }
    
    if role not in ['admin', 'manager', 'viewer']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid role. Use: admin, manager, or viewer'})
        }
    
    organization_id = payload['organization_id']
    invited_by = payload['user_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM users WHERE email = '%s'" % email)
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User with this email already exists'})
            }
        
        cur.execute(
            "SELECT id FROM invitations WHERE email = '%s' AND organization_id = %s AND status = 'pending'" % (email, organization_id)
        )
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invitation already sent to this email'})
            }
        
        invitation_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        cur.execute(
            """
            INSERT INTO invitations (organization_id, email, role, invited_by, token, status, expires_at)
            VALUES (%s, '%s', '%s', %s, '%s', 'pending', '%s')
            RETURNING id
            """ % (organization_id, email, role, invited_by, invitation_token, expires_at.isoformat())
        )
        invitation_id = cur.fetchone()[0]
        conn.commit()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'invitation_id': invitation_id,
                'token': invitation_token,
                'expires_at': expires_at.isoformat()
            })
        }
    
    finally:
        cur.close()
        conn.close()


def handle_accept(body: dict) -> dict:
    """Принятие приглашения"""
    token = body.get('token', '')
    full_name = body.get('full_name', '').strip()
    password = body.get('password', '')
    
    if not all([token, full_name, password]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token, full_name, and password are required'})
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
        cur.execute(
            """
            SELECT i.id, i.organization_id, i.email, i.role, i.expires_at, o.name
            FROM invitations i
            JOIN organizations o ON i.organization_id = o.id
            WHERE i.token = '%s' AND i.status = 'pending'
            """ % token
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invitation not found or already used'})
            }
        
        invitation_id, organization_id, email, role, expires_at, organization_name = result
        
        if datetime.utcnow() > expires_at:
            cur.execute("UPDATE invitations SET status = 'expired' WHERE id = %s" % invitation_id)
            conn.commit()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invitation has expired'})
            }
        
        cur.execute("SELECT id FROM users WHERE email = '%s'" % email)
        if cur.fetchone():
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User already registered'})
            }
        
        password_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (organization_id, email, password_hash, full_name, role) VALUES (%s, '%s', '%s', '%s', '%s') RETURNING id" % (organization_id, email, password_hash, full_name, role)
        )
        user_id = cur.fetchone()[0]
        
        cur.execute(
            "UPDATE invitations SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP WHERE id = %s" % invitation_id
        )
        conn.commit()
        
        jwt_token = create_jwt_token(user_id, organization_id, email, role)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'token': jwt_token,
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


def handle_list(payload: dict) -> dict:
    """Список приглашений организации"""
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT i.id, i.email, i.role, i.status, i.created_at, i.expires_at, u.full_name
            FROM invitations i
            LEFT JOIN users u ON i.invited_by = u.id
            WHERE i.organization_id = %s
            ORDER BY i.created_at DESC
            """ % organization_id
        )
        
        invitations = []
        for row in cur.fetchall():
            invitations.append({
                'id': row[0],
                'email': row[1],
                'role': row[2],
                'status': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'expires_at': row[5].isoformat() if row[5] else None,
                'invited_by_name': row[6]
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'invitations': invitations})
        }
    
    finally:
        cur.close()
        conn.close()


def handle_cancel(payload: dict, body: dict) -> dict:
    """Отмена приглашения"""
    if payload['role'] not in ['owner', 'admin']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only owner and admin can cancel invitations'})
        }
    
    invitation_id = body.get('invitation_id')
    
    if not invitation_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'invitation_id is required'})
        }
    
    organization_id = payload['organization_id']
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "SELECT organization_id, status FROM invitations WHERE id = %s" % invitation_id
        )
        result = cur.fetchone()
        
        if not result:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invitation not found'})
            }
        
        inv_org_id, status = result
        
        if inv_org_id != organization_id:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Cannot cancel invitation from different organization'})
            }
        
        if status != 'pending':
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Can only cancel pending invitations'})
            }
        
        cur.execute("UPDATE invitations SET status = 'cancelled' WHERE id = %s" % invitation_id)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Invitation cancelled'})
        }
    
    finally:
        cur.close()
        conn.close()
