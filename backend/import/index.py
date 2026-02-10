"""
Импорт клиентов из CSV/Excel/JSON с визуальным маппингом колонок
"""
import json
import os
import csv
import io
import base64
from datetime import datetime
import psycopg2

def handler(event: dict, context) -> dict:
    """API для импорта клиентов с гибким маппингом полей"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'}),
            'isBase64Encoded': False
        }
    
    try:
        import jwt
        secret = os.environ.get('JWT_SECRET')
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        user_id = payload['user_id']
        organization_id = payload['organization_id']
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный токен'}),
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'parse':
            return parse_file(body)
        elif action == 'preview':
            return preview_import(organization_id, body)
        elif action == 'import':
            return import_clients(organization_id, user_id, body)
        elif action == 'save_template':
            return save_template(organization_id, user_id, body)
        elif action == 'load_templates':
            return load_templates(organization_id)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def parse_file(body: dict) -> dict:
    """Этап 1: Парсинг файла и возврат превью первых 5 строк"""
    file_content = body.get('file_content')
    file_type = body.get('file_type', 'csv')
    
    if not file_content:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Файл не предоставлен'}),
            'isBase64Encoded': False
        }
    
    try:
        decoded = base64.b64decode(file_content).decode('utf-8-sig')
    except:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Ошибка декодирования файла'}),
            'isBase64Encoded': False
        }
    
    if file_type == 'csv':
        reader = csv.DictReader(io.StringIO(decoded))
        rows = list(reader)
        
        if not rows:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Файл пуст'}),
                'isBase64Encoded': False
            }
        
        columns = list(rows[0].keys())
        preview_rows = rows[:5]
        
        auto_mapping = auto_match_columns(columns)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'columns': columns,
                'preview': preview_rows,
                'total_rows': len(rows),
                'auto_mapping': auto_mapping
            }),
            'isBase64Encoded': False
        }
    elif file_type == 'json':
        data = json.loads(decoded)
        
        if isinstance(data, list) and len(data) > 0:
            columns = list(data[0].keys())
            preview_rows = data[:5]
            auto_mapping = auto_match_columns(columns)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'columns': columns,
                    'preview': preview_rows,
                    'total_rows': len(data),
                    'auto_mapping': auto_mapping
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'JSON должен содержать массив объектов'}),
                'isBase64Encoded': False
            }
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неподдерживаемый тип файла'}),
            'isBase64Encoded': False
        }

def auto_match_columns(columns: list) -> dict:
    """Автоматическое сопоставление колонок с полями CRM"""
    mapping_rules = {
        'company_name': ['company', 'компания', 'название', 'name', 'company_name', 'organization'],
        'contact_person': ['contact', 'контакт', 'person', 'contact_person', 'representative'],
        'email': ['email', 'e-mail', 'mail', 'почта'],
        'phone': ['phone', 'телефон', 'tel', 'telephone', 'mobile'],
        'description': ['description', 'описание', 'notes', 'комментарий', 'comment']
    }
    
    auto_mapping = {}
    
    for col in columns:
        col_lower = col.lower().strip()
        matched = False
        
        for field, keywords in mapping_rules.items():
            if any(keyword in col_lower for keyword in keywords):
                auto_mapping[col] = field
                matched = True
                break
        
        if not matched:
            auto_mapping[col] = 'skip'
    
    return auto_mapping

def preview_import(organization_id: int, body: dict) -> dict:
    """Этап 3: Превью импорта - показать что будет создано"""
    file_content = body.get('file_content')
    file_type = body.get('file_type', 'csv')
    mapping = body.get('mapping', {})
    matrix_id = body.get('matrix_id')
    
    if not file_content or not mapping:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недостаточно данных'}),
            'isBase64Encoded': False
        }
    
    decoded = base64.b64decode(file_content).decode('utf-8-sig')
    
    if file_type == 'csv':
        reader = csv.DictReader(io.StringIO(decoded))
        rows = list(reader)
    elif file_type == 'json':
        rows = json.loads(decoded)
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неподдерживаемый тип'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("""
        SELECT LOWER(company_name) FROM clients 
        WHERE organization_id = {org_id} 
        AND is_active = true 
        AND deleted_at IS NULL
    """.format(org_id=organization_id))
    
    existing_companies = {row[0] for row in cur.fetchall()}
    cur.close()
    conn.close()
    
    preview_clients = []
    new_criteria = set()
    duplicates_count = 0
    
    for row in rows[:10]:
        client = {}
        custom_scores = {}
        
        for file_col, crm_field in mapping.items():
            value = row.get(file_col, '')
            
            if crm_field == 'skip' or not value:
                continue
            
            if crm_field in ['company_name', 'contact_person', 'email', 'phone', 'description']:
                client[crm_field] = value
            elif crm_field.startswith('criterion_'):
                criterion_name = crm_field.replace('criterion_', '')
                new_criteria.add(criterion_name)
                try:
                    custom_scores[criterion_name] = float(value)
                except:
                    custom_scores[criterion_name] = 0.0
        
        if client.get('company_name'):
            is_duplicate = client['company_name'].lower() in existing_companies
            if is_duplicate:
                duplicates_count += 1
            client['custom_scores'] = custom_scores
            client['is_duplicate'] = is_duplicate
            preview_clients.append(client)
    
    total_duplicates = sum(1 for row in rows if any(
        mapping.get(col) == 'company_name' and row.get(col, '').lower() in existing_companies 
        for col in row.keys()
    ))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'preview': preview_clients,
            'total': len(rows),
            'new_criteria': list(new_criteria),
            'valid_count': len([r for r in rows if mapping and any(r.get(k) for k in mapping.keys())]),
            'duplicates_count': total_duplicates
        }),
        'isBase64Encoded': False
    }

def import_clients(organization_id: int, user_id: int, body: dict) -> dict:
    """Импорт клиентов в базу данных"""
    file_content = body.get('file_content')
    file_type = body.get('file_type', 'csv')
    mapping = body.get('mapping', {})
    matrix_id = body.get('matrix_id')
    
    if not matrix_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимо выбрать матрицу'}),
            'isBase64Encoded': False
        }
    
    decoded = base64.b64decode(file_content).decode('utf-8-sig')
    
    if file_type == 'csv':
        reader = csv.DictReader(io.StringIO(decoded))
        rows = list(reader)
    elif file_type == 'json':
        rows = json.loads(decoded)
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неподдерживаемый тип'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    new_criteria = {}
    for file_col, crm_field in mapping.items():
        if crm_field.startswith('criterion_'):
            criterion_name = crm_field.replace('criterion_', '')
            
            cur.execute("""
                SELECT id FROM matrix_criteria 
                WHERE matrix_id = {matrix_id} AND name = '{name}'
            """.format(matrix_id=matrix_id, name=criterion_name.replace("'", "''")))
            
            result = cur.fetchone()
            if result:
                new_criteria[criterion_name] = result[0]
            else:
                cur.execute("""
                    INSERT INTO matrix_criteria (matrix_id, name, axis, weight, min_value, max_value, created_at)
                    VALUES ({matrix_id}, '{name}', 'x', 1.0, 0.0, 10.0, NOW())
                    RETURNING id
                """.format(matrix_id=matrix_id, name=criterion_name.replace("'", "''")))
                
                criterion_id = cur.fetchone()[0]
                new_criteria[criterion_name] = criterion_id
    
    conn.commit()
    
    imported_count = 0
    skipped_count = 0
    
    for row in rows:
        client_data = {}
        custom_scores = {}
        
        for file_col, crm_field in mapping.items():
            value = row.get(file_col, '')
            
            if crm_field == 'skip' or not value:
                continue
            
            if crm_field in ['company_name', 'contact_person', 'email', 'phone', 'description']:
                client_data[crm_field] = value
            elif crm_field.startswith('criterion_'):
                criterion_name = crm_field.replace('criterion_', '')
                try:
                    custom_scores[criterion_name] = float(value)
                except:
                    pass
        
        if not client_data.get('company_name'):
            skipped_count += 1
            continue
        
        company_name = client_data.get('company_name', '').replace("'", "''")
        
        cur.execute("""
            SELECT id FROM clients 
            WHERE organization_id = {org_id} 
            AND company_name = '{company}' 
            AND is_active = true 
            AND deleted_at IS NULL
        """.format(org_id=organization_id, company=company_name))
        
        existing_client = cur.fetchone()
        if existing_client:
            skipped_count += 1
            continue
        
        try:
            cur.execute("""
                INSERT INTO clients 
                (organization_id, matrix_id, company_name, contact_person, email, phone, description, score_x, score_y, quadrant, created_by, responsible_user_id, created_at)
                VALUES ({org_id}, {matrix_id}, '{company}', '{contact}', '{email}', '{phone}', '{desc}', 0.0, 0.0, 'archive', {user_id}, {user_id}, NOW())
                RETURNING id
            """.format(
                org_id=organization_id,
                matrix_id=matrix_id,
                company=company_name,
                contact=client_data.get('contact_person', '').replace("'", "''"),
                email=client_data.get('email', '').replace("'", "''"),
                phone=client_data.get('phone', '').replace("'", "''"),
                desc=client_data.get('description', '').replace("'", "''"),
                user_id=user_id
            ))
            
            client_id = cur.fetchone()[0]
            
            for criterion_name, score_value in custom_scores.items():
                criterion_id = new_criteria.get(criterion_name)
                if criterion_id:
                    cur.execute("""
                        INSERT INTO client_scores (client_id, criterion_id, score, created_at)
                        VALUES ({client_id}, {criterion_id}, {score}, NOW())
                    """.format(client_id=client_id, criterion_id=criterion_id, score=score_value))
            
            score_x, score_y = calculate_scores(cur, client_id)
            quadrant = determine_quadrant(cur, matrix_id, score_x, score_y)
            
            cur.execute("""
                UPDATE clients
                SET score_x = {score_x}, score_y = {score_y}, quadrant = '{quadrant}'
                WHERE id = {client_id}
            """.format(score_x=score_x, score_y=score_y, quadrant=quadrant, client_id=client_id))
            
            imported_count += 1
            
        except Exception as e:
            skipped_count += 1
            continue
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'imported': imported_count,
            'skipped': skipped_count,
            'total': len(rows)
        }),
        'isBase64Encoded': False
    }

def calculate_scores(cur, client_id: int) -> tuple:
    """Расчет score_x и score_y на основе критериев"""
    cur.execute("""
        SELECT mc.axis, mc.weight, mc.min_value, mc.max_value, cs.score
        FROM client_scores cs
        JOIN matrix_criteria mc ON cs.criterion_id = mc.id
        WHERE cs.client_id = {client_id}
    """.format(client_id=client_id))
    
    scores = cur.fetchall()
    
    x_scores = []
    y_scores = []
    
    for axis, weight, min_val, max_val, score in scores:
        normalized = ((score - min_val) / (max_val - min_val)) * weight if (max_val - min_val) > 0 else 0
        
        if axis == 'x':
            x_scores.append(normalized)
        else:
            y_scores.append(normalized)
    
    score_x = sum(x_scores) / len(x_scores) * 10 if x_scores else 0
    score_y = sum(y_scores) / len(y_scores) * 10 if y_scores else 0
    
    return round(score_x, 2), round(score_y, 2)

def determine_quadrant(cur, matrix_id: int, score_x: float, score_y: float) -> str:
    """Определяет квадрант на основе правил матрицы (гибкая логика)"""
    cur.execute("""
        SELECT quadrant, x_min, y_min, x_operator
        FROM matrix_quadrant_rules
        WHERE matrix_id = {matrix_id}
        ORDER BY priority ASC
    """.format(matrix_id=matrix_id))
    
    rules = cur.fetchall()
    
    for rule in rules:
        quadrant, x_min, y_min, x_operator = rule
        x_min = float(x_min)
        y_min = float(y_min)
        
        if x_operator == 'AND':
            if score_x >= x_min and score_y >= y_min:
                return quadrant
        else:  # OR
            if score_x >= x_min or score_y >= y_min:
                return quadrant
    
    return 'archive'  # fallback

def save_template(organization_id: int, user_id: int, body: dict) -> dict:
    """Сохранение шаблона маппинга для повторного использования"""
    template_name = body.get('template_name')
    mapping = body.get('mapping')
    
    if not template_name or not mapping:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Не указано имя шаблона или маппинг'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS import_templates (
            id SERIAL PRIMARY KEY,
            organization_id INT NOT NULL,
            created_by INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            mapping JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    
    cur.execute("""
        INSERT INTO import_templates (organization_id, created_by, name, mapping, created_at)
        VALUES ({org_id}, {user_id}, '{name}', '{mapping}', NOW())
        RETURNING id
    """.format(
        org_id=organization_id,
        user_id=user_id,
        name=template_name.replace("'", "''"),
        mapping=json.dumps(mapping).replace("'", "''")
    ))
    
    template_id = cur.fetchone()[0]
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'template_id': template_id
        }),
        'isBase64Encoded': False
    }

def load_templates(organization_id: int) -> dict:
    """Загрузка сохраненных шаблонов маппинга"""
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS import_templates (
            id SERIAL PRIMARY KEY,
            organization_id INT NOT NULL,
            created_by INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            mapping JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    
    cur.execute("""
        SELECT id, name, mapping, created_at
        FROM import_templates
        WHERE organization_id = {org_id}
        ORDER BY created_at DESC
    """.format(org_id=organization_id))
    
    templates = []
    for row in cur.fetchall():
        templates.append({
            'id': row[0],
            'name': row[1],
            'mapping': json.loads(row[2]) if isinstance(row[2], str) else row[2],
            'created_at': row[3].isoformat() if row[3] else None
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'templates': templates
        }),
        'isBase64Encoded': False
    }