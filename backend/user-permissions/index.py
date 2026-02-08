import json
import os
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления правами доступа пользователей"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = body.get('action', 'get_permissions')
        
        if action == 'get_default_permissions':
            target_role = body.get('role', 'manager')
            result = get_default_permissions(target_role)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
    except:
        pass
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload['user_id']
        organization_id = payload['organization_id']
        role = payload.get('role', 'manager')
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = body.get('action', 'get_permissions')
        
        if action == 'get_permissions':
            target_user_id = body.get('user_id', user_id)
            result = get_permissions(conn, target_user_id, organization_id)
        elif action == 'update_permissions':
            if role not in ['owner', 'admin']:
                conn.close()
                return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Недостаточно прав'}), 'isBase64Encoded': False}
            result = update_permissions(conn, body, organization_id)
        else:
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
        
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f'ERROR: {str(e)}')
        print(f'TRACEBACK: {error_details}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_permissions(conn, user_id: int, organization_id: int):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute('''
            SELECT client_visibility, client_edit, matrix_access, team_access, 
                   import_export, settings_access
            FROM user_permissions
            WHERE user_id = %s AND organization_id = %s
        ''', (user_id, organization_id))
        permissions = cur.fetchone()
        
        if not permissions:
            return {'permissions': None}
        
        return {'permissions': dict(permissions)}


def update_permissions(conn, body: dict, organization_id: int):
    target_user_id = body.get('user_id')
    
    if not target_user_id:
        raise ValueError('ID пользователя обязателен')
    
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id FROM users 
            WHERE id = %s AND organization_id = %s
        ''', (target_user_id, organization_id))
        
        if not cur.fetchone():
            raise ValueError('Пользователь не найден')
        
        cur.execute('''
            SELECT id FROM user_permissions 
            WHERE user_id = %s AND organization_id = %s
        ''', (target_user_id, organization_id))
        exists = cur.fetchone()
        
        if exists:
            updates = []
            params = []
            
            if 'client_visibility' in body:
                updates.append("client_visibility = %s")
                params.append(body['client_visibility'])
            if 'client_edit' in body:
                updates.append("client_edit = %s")
                params.append(body['client_edit'])
            if 'matrix_access' in body:
                updates.append("matrix_access = %s")
                params.append(body['matrix_access'])
            if 'team_access' in body:
                updates.append("team_access = %s")
                params.append(body['team_access'])
            if 'import_export' in body:
                updates.append("import_export = %s")
                params.append(body['import_export'])
            if 'settings_access' in body:
                updates.append("settings_access = %s")
                params.append(body['settings_access'])
            
            if updates:
                updates.append("updated_at = CURRENT_TIMESTAMP")
                params.extend([target_user_id, organization_id])
                query = f"UPDATE user_permissions SET {', '.join(updates)} WHERE user_id = %s AND organization_id = %s"
                cur.execute(query, params)
        else:
            cur.execute('''
                INSERT INTO user_permissions 
                (user_id, organization_id, client_visibility, client_edit, matrix_access, team_access, import_export, settings_access)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                target_user_id,
                organization_id,
                body.get('client_visibility', 'own'),
                body.get('client_edit', 'no_delete'),
                body.get('matrix_access', 'view'),
                body.get('team_access', 'view'),
                body.get('import_export', 'none'),
                body.get('settings_access', False)
            ))
        
        conn.commit()
        return {'message': 'Права обновлены'}


def get_default_permissions(role: str):
    if role == 'admin':
        return {
            'permissions': {
                'client_visibility': 'all',
                'client_edit': 'full',
                'matrix_access': 'create',
                'team_access': 'invite',
                'import_export': 'both',
                'settings_access': True
            }
        }
    elif role == 'department_head':
        return {
            'permissions': {
                'client_visibility': 'all',
                'client_edit': 'full',
                'matrix_access': 'create',
                'team_access': 'invite',
                'import_export': 'both',
                'settings_access': False
            }
        }
    else:
        return {
            'permissions': {
                'client_visibility': 'own',
                'client_edit': 'no_delete',
                'matrix_access': 'view',
                'team_access': 'view',
                'import_export': 'none',
                'settings_access': False
            }
        }