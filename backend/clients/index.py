import json
import os
import psycopg2
from datetime import datetime
import jwt

def handler(event: dict, context) -> dict:
    """API для управления клиентами с оценкой по критериям матрицы"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': ''
        }
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен не предоставлен'})
        }
    
    try:
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload['user_id']
        organization_id = payload['organization_id']
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен истёк'})
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        body = json.loads(event.get('body', '{}')) if event.get('body') else {}
        action = body.get('action', 'list')
        
        if action == 'list':
            quadrant_filter = body.get('quadrant')
            matrix_filter = body.get('matrix_id')
            
            query = """
                SELECT c.id, c.company_name, c.contact_person, c.email, c.phone,
                       c.description, c.score_x, c.score_y, c.quadrant,
                       c.matrix_id, m.name as matrix_name, c.created_at
                FROM clients c
                LEFT JOIN matrices m ON c.matrix_id = m.id
                WHERE c.organization_id = %s AND c.is_active = true
            """ % organization_id
            
            if quadrant_filter:
                query += " AND c.quadrant = '%s'" % quadrant_filter
            if matrix_filter:
                query += " AND c.matrix_id = %s" % matrix_filter
            
            query += " ORDER BY c.created_at DESC"
            
            cur.execute(query)
            rows = cur.fetchall()
            
            clients = []
            for row in rows:
                clients.append({
                    'id': row[0],
                    'company_name': row[1],
                    'contact_person': row[2],
                    'email': row[3],
                    'phone': row[4],
                    'description': row[5],
                    'score_x': float(row[6]) if row[6] else 0,
                    'score_y': float(row[7]) if row[7] else 0,
                    'quadrant': row[8],
                    'matrix_id': row[9],
                    'matrix_name': row[10],
                    'created_at': row[11].isoformat() if row[11] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'clients': clients})
            }
        
        elif action == 'get':
            client_id = body.get('client_id')
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_id обязателен'})
                }
            
            cur.execute("""
                SELECT c.id, c.company_name, c.contact_person, c.email, c.phone,
                       c.description, c.notes, c.score_x, c.score_y, c.quadrant,
                       c.matrix_id, m.name as matrix_name
                FROM clients c
                LEFT JOIN matrices m ON c.matrix_id = m.id
                WHERE c.id = %s AND c.organization_id = %s AND c.is_active = true
            """ % (client_id, organization_id))
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Клиент не найден'})
                }
            
            cur.execute("""
                SELECT cs.id, cs.criterion_id, cs.score, cs.comment,
                       mc.name, mc.axis, mc.weight, mc.min_value, mc.max_value
                FROM client_scores cs
                JOIN matrix_criteria mc ON cs.criterion_id = mc.id
                WHERE cs.client_id = %s
                ORDER BY mc.axis, mc.sort_order
            """ % client_id)
            
            score_rows = cur.fetchall()
            scores = []
            for score_row in score_rows:
                scores.append({
                    'id': score_row[0],
                    'criterion_id': score_row[1],
                    'score': float(score_row[2]),
                    'comment': score_row[3],
                    'criterion_name': score_row[4],
                    'axis': score_row[5],
                    'weight': float(score_row[6]),
                    'min_value': float(score_row[7]),
                    'max_value': float(score_row[8])
                })
            
            client = {
                'id': row[0],
                'company_name': row[1],
                'contact_person': row[2],
                'email': row[3],
                'phone': row[4],
                'description': row[5],
                'notes': row[6],
                'score_x': float(row[7]) if row[7] else 0,
                'score_y': float(row[8]) if row[8] else 0,
                'quadrant': row[9],
                'matrix_id': row[10],
                'matrix_name': row[11],
                'scores': scores
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'client': client})
            }
        
        elif action == 'create':
            company_name = body.get('company_name')
            matrix_id = body.get('matrix_id')
            
            if not company_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'company_name обязателен'})
                }
            
            cur.execute("""
                INSERT INTO clients (organization_id, matrix_id, company_name, contact_person, 
                                     email, phone, description, notes, created_by)
                VALUES (%s, %s, '%s', '%s', '%s', '%s', '%s', '%s', %s)
                RETURNING id
            """ % (
                organization_id,
                matrix_id if matrix_id else 'NULL',
                company_name.replace("'", "''"),
                body.get('contact_person', '').replace("'", "''"),
                body.get('email', '').replace("'", "''"),
                body.get('phone', '').replace("'", "''"),
                body.get('description', '').replace("'", "''"),
                body.get('notes', '').replace("'", "''"),
                user_id
            ))
            
            client_id = cur.fetchone()[0]
            
            scores = body.get('scores', [])
            for score_item in scores:
                criterion_id = score_item.get('criterion_id')
                score = score_item.get('score', 0)
                comment = score_item.get('comment', '')
                
                cur.execute("""
                    INSERT INTO client_scores (client_id, criterion_id, score, comment)
                    VALUES (%s, %s, %s, '%s')
                """ % (client_id, criterion_id, score, comment.replace("'", "''")))
            
            if matrix_id and scores:
                score_x, score_y = calculate_scores(cur, client_id)
                quadrant = determine_quadrant(score_x, score_y)
                
                cur.execute("""
                    UPDATE clients 
                    SET score_x = %s, score_y = %s, quadrant = '%s'
                    WHERE id = %s
                """ % (score_x, score_y, quadrant, client_id))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'client_id': client_id, 'message': 'Клиент создан'})
            }
        
        elif action == 'update':
            client_id = body.get('client_id')
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_id обязателен'})
                }
            
            cur.execute("""
                SELECT id FROM clients 
                WHERE id = %s AND organization_id = %s AND is_active = true
            """ % (client_id, organization_id))
            
            if not cur.fetchone():
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Клиент не найден'})
                }
            
            updates = []
            if 'company_name' in body:
                updates.append("company_name = '%s'" % body['company_name'].replace("'", "''"))
            if 'contact_person' in body:
                updates.append("contact_person = '%s'" % body['contact_person'].replace("'", "''"))
            if 'email' in body:
                updates.append("email = '%s'" % body['email'].replace("'", "''"))
            if 'phone' in body:
                updates.append("phone = '%s'" % body['phone'].replace("'", "''"))
            if 'description' in body:
                updates.append("description = '%s'" % body['description'].replace("'", "''"))
            if 'notes' in body:
                updates.append("notes = '%s'" % body['notes'].replace("'", "''"))
            if 'matrix_id' in body:
                updates.append("matrix_id = %s" % body['matrix_id'])
            
            updates.append("updated_at = CURRENT_TIMESTAMP")
            
            if updates:
                cur.execute("""
                    UPDATE clients SET %s WHERE id = %s
                """ % (', '.join(updates), client_id))
            
            if 'scores' in body:
                for score_item in body['scores']:
                    criterion_id = score_item.get('criterion_id')
                    score = score_item.get('score', 0)
                    comment = score_item.get('comment', '')
                    
                    cur.execute("""
                        INSERT INTO client_scores (client_id, criterion_id, score, comment)
                        VALUES (%s, %s, %s, '%s')
                        ON CONFLICT (client_id, criterion_id) 
                        DO UPDATE SET score = %s, comment = '%s', updated_at = CURRENT_TIMESTAMP
                    """ % (client_id, criterion_id, score, comment.replace("'", "''"), score, comment.replace("'", "''")))
                
                score_x, score_y = calculate_scores(cur, client_id)
                quadrant = determine_quadrant(score_x, score_y)
                
                cur.execute("""
                    UPDATE clients 
                    SET score_x = %s, score_y = %s, quadrant = '%s'
                    WHERE id = %s
                """ % (score_x, score_y, quadrant, client_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Клиент обновлен'})
            }
        
        elif action == 'delete':
            client_id = body.get('client_id')
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_id обязателен'})
                }
            
            cur.execute("""
                UPDATE clients SET is_active = false 
                WHERE id = %s AND organization_id = %s
            """ % (client_id, organization_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Клиент деактивирован'})
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()


def calculate_scores(cur, client_id: int) -> tuple:
    """Рассчитывает итоговые оценки по осям X и Y на основе критериев"""
    cur.execute("""
        SELECT mc.axis, cs.score, mc.weight, mc.max_value
        FROM client_scores cs
        JOIN matrix_criteria mc ON cs.criterion_id = mc.id
        WHERE cs.client_id = %s
    """ % client_id)
    
    rows = cur.fetchall()
    
    x_scores = []
    y_scores = []
    
    for row in rows:
        axis = row[0]
        score = float(row[1])
        weight = float(row[2])
        max_value = float(row[3])
        
        normalized_score = (score / max_value) * weight
        
        if axis == 'x':
            x_scores.append(normalized_score)
        elif axis == 'y':
            y_scores.append(normalized_score)
    
    score_x = sum(x_scores) / len(x_scores) * 10 if x_scores else 0
    score_y = sum(y_scores) / len(y_scores) * 10 if y_scores else 0
    
    return round(score_x, 2), round(score_y, 2)


def determine_quadrant(score_x: float, score_y: float) -> str:
    """Определяет квадрант на основе оценок по осям"""
    threshold = 5.0
    
    if score_x >= threshold and score_y >= threshold:
        return 'focus'
    elif score_x >= threshold and score_y < threshold:
        return 'grow'
    elif score_x < threshold and score_y >= threshold:
        return 'monitor'
    else:
        return 'archive'
