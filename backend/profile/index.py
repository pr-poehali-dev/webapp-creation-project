"""Управление профилем пользователя (ФИО, смена пароля)."""
import json
import os
import jwt
import bcrypt
import psycopg2


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


def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def escape_sql(val):
    if val is None:
        return 'NULL'
    return str(val).replace("'", "''")


def handler(event, context):
    """Управление профилем: смена ФИО и пароля."""
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

    user_id = payload.get('user_id')

    try:
        body = json.loads(event.get('body', '{}'))
    except Exception:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Invalid JSON body'})}

    action = body.get('action')

    if action == 'update_profile':
        return update_profile(user_id, body, cors)
    elif action == 'change_password':
        return change_password(user_id, body, cors)
    elif action == 'skip_password_change':
        return skip_password_change(user_id, cors)
    else:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Invalid action'})}


def update_profile(user_id, body, cors):
    """Обновление ФИО пользователя."""
    full_name = (body.get('full_name') or '').strip()

    if not full_name:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'full_name обязательно'})}

    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        cur.execute(
            "UPDATE users SET full_name = '%s', updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            % (escape_sql(full_name), int(user_id))
        )
        conn.commit()
        cur.close()

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'success': True, 'message': 'Профиль обновлён'})}

    except Exception as e:
        if conn:
            conn.rollback()
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': str(e)})}

    finally:
        if conn:
            conn.close()


def change_password(user_id, body, cors):
    """Смена пароля пользователя."""
    new_password = body.get('new_password', '')

    if not new_password or len(new_password) < 6:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})}

    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        password_hash = hash_password(new_password)

        cur.execute(
            "UPDATE users SET password_hash = '%s', password_change_required = false, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            % (escape_sql(password_hash), int(user_id))
        )
        conn.commit()
        cur.close()

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'success': True, 'message': 'Пароль изменён'})}

    except Exception as e:
        if conn:
            conn.rollback()
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': str(e)})}

    finally:
        if conn:
            conn.close()


def skip_password_change(user_id, cors):
    """Пропуск обязательной смены пароля."""
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        cur.execute(
            "UPDATE users SET password_change_required = false WHERE id = %s"
            % int(user_id)
        )
        conn.commit()
        cur.close()

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'success': True, 'message': 'Флаг сброшен'})}

    except Exception as e:
        if conn:
            conn.rollback()
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': str(e)})}

    finally:
        if conn:
            conn.close()
