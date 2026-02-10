"""
API для управления организациями в админ-панели.
Позволяет просматривать список организаций и редактировать тарифы.
"""
import json
import os
import jwt
import bcrypt
import psycopg2
import secrets
import string
from datetime import datetime


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


def get_all_organizations():
    """Получить список всех организаций с информацией"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT 
                o.id,
                o.name,
                o.subscription_tier,
                o.subscription_start_date,
                o.subscription_end_date,
                o.users_limit,
                o.matrices_limit,
                o.clients_limit,
                o.created_at,
                o.status,
                COUNT(DISTINCT u.id) as users_count,
                COUNT(DISTINCT m.id) as matrices_count,
                COUNT(DISTINCT c.id) as clients_count
            FROM organizations o
            LEFT JOIN users u ON u.organization_id = o.id AND u.is_active = true
            LEFT JOIN matrices m ON m.organization_id = o.id
            LEFT JOIN clients c ON c.organization_id = o.id AND c.is_active = true
            GROUP BY o.id, o.name, o.subscription_tier, o.subscription_start_date, 
                     o.subscription_end_date, o.users_limit, o.matrices_limit, 
                     o.clients_limit, o.created_at, o.status
            ORDER BY o.created_at DESC
            """
        )
        
        organizations = []
        for row in cur.fetchall():
            org = {
                'id': row[0],
                'name': row[1],
                'subscription_tier': row[2],
                'subscription_start_date': row[3].isoformat() if row[3] else None,
                'subscription_end_date': row[4].isoformat() if row[4] else None,
                'users_limit': row[5],
                'matrices_limit': row[6],
                'clients_limit': row[7],
                'created_at': row[8].isoformat() if row[8] else None,
                'status': row[9],
                'users_count': row[10],
                'matrices_count': row[11],
                'clients_count': row[12]
            }
            organizations.append(org)
        
        return organizations
        
    finally:
        cur.close()
        conn.close()


def get_tier_limits(tier: str) -> dict:
    """Получить лимиты по тарифу"""
    tier_limits = {
        'free': {'users_limit': 3, 'matrices_limit': 1, 'clients_limit': 10},
        'pro': {'users_limit': 10, 'matrices_limit': 3, 'clients_limit': 500},
        'enterprise': {'users_limit': 100, 'matrices_limit': 50, 'clients_limit': 10000}
    }
    return tier_limits.get(tier, tier_limits['free'])


def generate_password(length=12):
    """Сгенерировать случайный пароль"""
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


def create_organization(data: dict):
    """Создать новую организацию с owner"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        print(f"[DEBUG] create_organization called with data: {data}")
        
        name = data.get('name', '').strip()
        owner_username = data.get('owner_username', '').strip()
        owner_password = data.get('owner_password', '').strip()
        tier = data.get('subscription_tier', 'free')
        start_date = data.get('subscription_start_date')
        end_date = data.get('subscription_end_date')
        
        # Автоматически установить лимиты по тарифу, если не указаны явно
        tier_limits = get_tier_limits(tier)
        users_limit = data.get('users_limit') or tier_limits['users_limit']
        matrices_limit = data.get('matrices_limit') or tier_limits['matrices_limit']
        clients_limit = data.get('clients_limit') or tier_limits['clients_limit']
        
        print(f"[DEBUG] Tier: {tier}, Limits: users={users_limit}, matrices={matrices_limit}, clients={clients_limit}")
        
        if not name or not owner_username:
            print(f"[DEBUG] Validation failed: name='{name}', username='{owner_username}'")
            return {'error': 'Name and owner username required'}
        
        # Если пароль не указан, генерируем автоматически
        if not owner_password:
            owner_password = generate_password()
            print(f"[DEBUG] Generated password: {owner_password}")
        
        # Проверить, что username свободен
        cur.execute("SELECT id FROM users WHERE username = %s", (owner_username,))
        if cur.fetchone():
            print(f"[DEBUG] Username already exists: {owner_username}")
            return {'error': 'Username already exists'}
        
        # Создать организацию
        print(f"[DEBUG] Creating organization: {name}")
        cur.execute(
            """
            INSERT INTO organizations 
            (name, subscription_tier, subscription_start_date, subscription_end_date,
             users_limit, matrices_limit, clients_limit, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'active')
            RETURNING id
            """,
            (name, tier, start_date, end_date, users_limit, matrices_limit, clients_limit)
        )
        org_id = cur.fetchone()[0]
        print(f"[DEBUG] Organization created with id: {org_id}")
        
        # Создать owner пользователя
        password_hash = bcrypt.hashpw(owner_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        print(f"[DEBUG] Creating owner user: {owner_username}")
        
        cur.execute(
            """
            INSERT INTO users 
            (username, password_hash, role, organization_id, is_active)
            VALUES (%s, %s, 'owner', %s, true)
            RETURNING id
            """,
            (owner_username, password_hash, org_id)
        )
        user_id = cur.fetchone()[0]
        print(f"[DEBUG] User created with id: {user_id}")
        
        conn.commit()
        print(f"[DEBUG] Transaction committed successfully")
        
        return {
            'success': True,
            'organization_id': org_id,
            'user_id': user_id,
            'username': owner_username,
            'password': owner_password
        }
    except Exception as e:
        print(f"[ERROR] create_organization exception: {e}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return {'error': str(e)}
        
    finally:
        cur.close()
        conn.close()


def update_organization_subscription(org_id: int, data: dict):
    """Обновить тариф организации"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Проверить существование организации
        cur.execute("SELECT id FROM organizations WHERE id = %s", (org_id,))
        if not cur.fetchone():
            return {'error': 'Organization not found'}
        
        # Обновить тариф
        tier = data.get('subscription_tier')
        start_date = data.get('subscription_start_date')
        end_date = data.get('subscription_end_date')
        users_limit = data.get('users_limit')
        matrices_limit = data.get('matrices_limit')
        clients_limit = data.get('clients_limit')
        
        updates = []
        params = []
        
        if tier:
            updates.append("subscription_tier = %s")
            params.append(tier)
        
        if start_date:
            updates.append("subscription_start_date = %s")
            params.append(start_date)
        
        if end_date:
            updates.append("subscription_end_date = %s")
            params.append(end_date)
        
        if users_limit is not None:
            updates.append("users_limit = %s")
            params.append(users_limit)
        
        if matrices_limit is not None:
            updates.append("matrices_limit = %s")
            params.append(matrices_limit)
        
        if clients_limit is not None:
            updates.append("clients_limit = %s")
            params.append(clients_limit)
        
        if not updates:
            return {'error': 'No fields to update'}
        
        params.append(org_id)
        
        query = f"UPDATE organizations SET {', '.join(updates)} WHERE id = %s"
        cur.execute(query, tuple(params))
        conn.commit()
        
        return {'success': True}
        
    finally:
        cur.close()
        conn.close()


def update_organization_status(org_id: int, status: str):
    """Изменить статус организации"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if status not in ['active', 'suspended', 'deleted']:
            return {'error': 'Invalid status'}
        
        cur.execute(
            "UPDATE organizations SET status = %s WHERE id = %s",
            (status, org_id)
        )
        conn.commit()
        
        if cur.rowcount == 0:
            return {'error': 'Organization not found'}
        
        return {'success': True, 'status': status}
        
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    """
    Управление организациями в админ-панели.
    GET /admin-organizations - список всех организаций
    POST /admin-organizations - создать организацию с owner
    PUT /admin-organizations/:id - обновить тариф организации
    PATCH /admin-organizations/:id/status - изменить статус
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
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
    
    try:
        # GET - список организаций
        if method == 'GET':
            organizations = get_all_organizations()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'organizations': organizations})
            }
        
        # POST - создать организацию
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            result = create_organization(body)
            
            if 'error' in result:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result)
                }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        # PUT - обновить тариф
        elif method == 'PUT':
            # Получить ID организации из path params
            path_params = event.get('pathParams', {})
            org_id = path_params.get('id')
            
            if not org_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Organization ID required'})
                }
            
            body = json.loads(event.get('body', '{}'))
            result = update_organization_subscription(int(org_id), body)
            
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
        
        # PATCH - изменить статус
        elif method == 'PATCH':
            path_params = event.get('pathParams', {})
            org_id = path_params.get('id')
            
            if not org_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Organization ID required'})
                }
            
            body = json.loads(event.get('body', '{}'))
            status = body.get('status')
            
            if not status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Status required'})
                }
            
            result = update_organization_status(int(org_id), status)
            
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