"""
Экспорт данных клиентов в различные форматы
"""
import json
import os
import csv
import io
import base64
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    """API для экспорта клиентов в CSV и другие форматы"""
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
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    try:
        import jwt
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        organization_id = payload['organization_id']
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'})
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'csv':
            return export_csv(organization_id, body)
        elif action == 'bitrix':
            return export_bitrix(organization_id, body)
        elif action == 'amocrm':
            return export_amocrm(organization_id, body)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def export_csv(organization_id: int, body: dict) -> dict:
    """Экспорт клиентов в CSV формат"""
    quadrant = body.get('quadrant')
    matrix_id = body.get('matrix_id')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    query = """
        SELECT 
            c.company_name,
            c.contact_person,
            c.email,
            c.phone,
            c.description,
            c.score_x,
            c.score_y,
            c.quadrant,
            m.name as matrix_name,
            c.created_at
        FROM clients c
        LEFT JOIN matrices m ON c.matrix_id = m.id
        WHERE c.organization_id = {org_id}
    """.format(org_id=organization_id)
    
    conditions = []
    if quadrant:
        conditions.append("c.quadrant = '{}'".format(quadrant))
    if matrix_id:
        conditions.append("c.matrix_id = {}".format(matrix_id))
    
    if conditions:
        query += " AND " + " AND ".join(conditions)
    
    query += " ORDER BY c.score_x DESC, c.score_y DESC"
    
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        'Компания', 'Контактное лицо', 'Email', 'Телефон', 'Описание',
        'Влияние (X)', 'Зрелость (Y)', 'Квадрант', 'Матрица', 'Дата создания'
    ])
    
    for row in rows:
        quadrant_names = {
            'focus': 'Фокус сейчас',
            'grow': 'Выращивать',
            'monitor': 'Мониторить',
            'archive': 'Архив'
        }
        quadrant_name = quadrant_names.get(row[7], row[7])
        
        writer.writerow([
            row[0], row[1], row[2], row[3], row[4],
            row[5], row[6], quadrant_name, row[8], row[9]
        ])
    
    csv_content = output.getvalue()
    csv_base64 = base64.b64encode(csv_content.encode('utf-8-sig')).decode('utf-8')
    
    filename = 'clients_export_{}.csv'.format(datetime.now().strftime('%Y%m%d_%H%M%S'))
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'filename': filename,
            'content': csv_base64,
            'total': len(rows)
        })
    }

def export_bitrix(organization_id: int, body: dict) -> dict:
    """Экспорт в формат Bitrix24"""
    quadrant = body.get('quadrant')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    query = """
        SELECT 
            c.company_name,
            c.contact_person,
            c.email,
            c.phone,
            c.description,
            c.score_x,
            c.score_y,
            c.quadrant,
            m.name as matrix_name
        FROM clients c
        LEFT JOIN matrices m ON c.matrix_id = m.id
        WHERE c.organization_id = {org_id}
    """.format(org_id=organization_id)
    
    if quadrant:
        query += " AND c.quadrant = '{}'".format(quadrant)
    
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    bitrix_data = []
    for row in rows:
        bitrix_data.append({
            'TITLE': row[0],
            'NAME': row[1],
            'EMAIL': [{'VALUE': row[2], 'VALUE_TYPE': 'WORK'}] if row[2] else [],
            'PHONE': [{'VALUE': row[3], 'VALUE_TYPE': 'WORK'}] if row[3] else [],
            'COMMENTS': row[4],
            'UF_CRM_SCORE_X': row[5],
            'UF_CRM_SCORE_Y': row[6],
            'UF_CRM_QUADRANT': row[7],
            'UF_CRM_MATRIX': row[8]
        })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'format': 'bitrix24',
            'leads': bitrix_data,
            'total': len(bitrix_data)
        })
    }

def export_amocrm(organization_id: int, body: dict) -> dict:
    """Экспорт в формат amoCRM"""
    quadrant = body.get('quadrant')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    query = """
        SELECT 
            c.company_name,
            c.contact_person,
            c.email,
            c.phone,
            c.description,
            c.score_x,
            c.score_y,
            c.quadrant,
            m.name as matrix_name
        FROM clients c
        LEFT JOIN matrices m ON c.matrix_id = m.id
        WHERE c.organization_id = {org_id}
    """.format(org_id=organization_id)
    
    if quadrant:
        query += " AND c.quadrant = '{}'".format(quadrant)
    
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    amo_data = []
    for row in rows:
        amo_data.append({
            'name': row[0],
            'contacts': [{
                'name': row[1],
                'custom_fields': [
                    {'id': 'EMAIL', 'values': [{'value': row[2], 'enum': 'WORK'}]} if row[2] else None,
                    {'id': 'PHONE', 'values': [{'value': row[3], 'enum': 'WORK'}]} if row[3] else None
                ]
            }],
            'custom_fields': [
                {'id': 'DESCRIPTION', 'values': [{'value': row[4]}]},
                {'id': 'SCORE_X', 'values': [{'value': str(row[5])}]},
                {'id': 'SCORE_Y', 'values': [{'value': str(row[6])}]},
                {'id': 'QUADRANT', 'values': [{'value': row[7]}]},
                {'id': 'MATRIX', 'values': [{'value': row[8]}]}
            ]
        })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'format': 'amocrm',
            'leads': amo_data,
            'total': len(amo_data)
        })
    }
