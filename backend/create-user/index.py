"""Создание нового пользователя в организации (owner/admin)."""
import json
import os
import jwt
import bcrypt
import psycopg2
import secrets
import string


def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def verify_jwt_token(token):
    try:
        secret = os.environ.get('JWT_SECRET')
        return jwt.decode(token, secret, algorithms=['HS256'])
    except Exception:
        return None


def get_auth_token(headers):
    for key in ['X-Authorization', 'x-authorization']:
        val = headers.get(key, '')
        if val:
            return val.replace('Bearer ', '')
    return ''


def escape_sql(val):
    if val is None:
        return 'NULL'
    return str(val).replace("'", "''")


def handler(event, context):
    """Создание нового пользователя в организации."""
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers', {}) or {}

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    cors = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    if method != 'POST':
        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    token = get_auth_token(headers)
    if not token:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Unauthorized'})}

    payload = verify_jwt_token(token)
    if not payload:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Invalid token'})}

    organization_id = payload.get('organization_id')
    user_role = payload.get('role')

    if user_role not in ['owner', 'admin']:
        return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'Только owner и admin могут создавать пользователей'})}

    try:
        body = json.loads(event.get('body', '{}'))
    except Exception:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Invalid JSON body'})}

    username = (body.get('username') or '').strip().lower()
    full_name = (body.get('full_name') or '').strip()
    email = (body.get('email') or '').strip().lower()
    role = body.get('role', 'manager')
    password = generate_password() if body.get('auto_password', True) else (body.get('password') or '')

    if not username or not full_name:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'username и full_name обязательны'})}

    if not email:
        email = username + '@team.local'

    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        cur.execute(
            "SELECT users_limit, (SELECT COUNT(*) FROM users WHERE organization_id = %s AND is_active = true) FROM organizations WHERE id = %s"
            % (int(organization_id), int(organization_id))
        )
        org_row = cur.fetchone()

        if not org_row:
            return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'Организация не найдена'})}

        users_limit, current_count = org_row
        if current_count >= users_limit:
            return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'Достигнут лимит пользователей (%s). Обновите тариф.' % users_limit})}

        cur.execute("SELECT id FROM users WHERE username = '%s'" % escape_sql(username))
        if cur.fetchone():
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Username уже занят'})}

        cur.execute("SELECT id FROM users WHERE email = '%s'" % escape_sql(email))
        if cur.fetchone():
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Email уже используется'})}

        password_hash = hash_password(password)

        cur.execute(
            "INSERT INTO users (organization_id, username, email, password_hash, full_name, role, is_active, password_change_required) "
            "VALUES (%s, '%s', '%s', '%s', '%s', '%s', true, true) RETURNING id"
            % (int(organization_id), escape_sql(username), escape_sql(email), escape_sql(password_hash), escape_sql(full_name), escape_sql(role))
        )
        new_user_id = cur.fetchone()[0]

        cur.execute(
            "INSERT INTO user_permissions (user_id, organization_id) VALUES (%s, %s)"
            % (int(new_user_id), int(organization_id))
        )

        conn.commit()
        cur.close()

        return {
            'statusCode': 201,
            'headers': cors,
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

    except Exception as e:
        if conn:
            conn.rollback()
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': str(e)})}

    finally:
        if conn:
            conn.close()