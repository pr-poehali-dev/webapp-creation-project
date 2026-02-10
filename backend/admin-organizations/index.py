"""
API для управления организациями в админ-панели.
Позволяет просматривать список организаций и редактировать тарифы.
"""
import json
import os
import jwt
import psycopg2
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
                COUNT(DISTINCT u.id) as users_count,
                COUNT(DISTINCT m.id) as matrices_count,
                COUNT(DISTINCT c.id) as clients_count
            FROM organizations o
            LEFT JOIN users u ON u.organization_id = o.id AND u.is_active = true
            LEFT JOIN matrices m ON m.organization_id = o.id
            LEFT JOIN clients c ON c.organization_id = o.id AND c.is_active = true
            GROUP BY o.id, o.name, o.subscription_tier, o.subscription_start_date, 
                     o.subscription_end_date, o.users_limit, o.matrices_limit, 
                     o.clients_limit, o.created_at
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
                'users_count': row[9],
                'matrices_count': row[10],
                'clients_count': row[11]
            }
            organizations.append(org)
        
        return organizations
        
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


def handler(event: dict, context) -> dict:
    """
    Управление организациями в админ-панели.
    GET /admin-organizations - список всех организаций
    PUT /admin-organizations/:id - обновить тариф организации
    """
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
