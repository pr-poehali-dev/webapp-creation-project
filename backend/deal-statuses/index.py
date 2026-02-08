"""API для получения списка статусов сделок организации"""
import json
import os
import psycopg2
import jwt

def handler(event: dict, context) -> dict:
    """Получение списка статусов сделок"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authorization required'}),
            'isBase64Encoded': False
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        organization_id = payload['organization_id']
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, name, weight, sort_order
            FROM deal_statuses
            WHERE organization_id = %s AND is_active = true
            ORDER BY sort_order
        """ % organization_id)
        
        rows = cur.fetchall()
        statuses = []
        
        for row in rows:
            statuses.append({
                'id': row[0],
                'name': row[1],
                'weight': row[2],
                'sort_order': row[3]
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'statuses': statuses}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
