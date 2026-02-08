import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Создание таблицы user_permissions и заполнение дефолтными правами"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_permissions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                organization_id INTEGER NOT NULL,
                client_visibility VARCHAR(20) NOT NULL DEFAULT 'own',
                client_edit VARCHAR(20) NOT NULL DEFAULT 'no_delete',
                matrix_access VARCHAR(20) NOT NULL DEFAULT 'view',
                team_access VARCHAR(20) NOT NULL DEFAULT 'view',
                import_export VARCHAR(20) NOT NULL DEFAULT 'none',
                settings_access BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, organization_id)
            )
        """)
        
        cur.execute("SELECT id, organization_id, role FROM users")
        users = cur.fetchall()
        
        for user_id, org_id, role in users:
            cur.execute(
                "SELECT id FROM user_permissions WHERE user_id = %s AND organization_id = %s",
                (user_id, org_id)
            )
            
            if not cur.fetchone():
                if role in ['owner', 'admin']:
                    perms = ('all', 'full', 'create', 'invite', 'both', True)
                elif role == 'department_head':
                    perms = ('all', 'full', 'create', 'invite', 'both', False)
                else:
                    perms = ('own', 'no_delete', 'view', 'view', 'none', False)
                
                cur.execute("""
                    INSERT INTO user_permissions 
                    (user_id, organization_id, client_visibility, client_edit, matrix_access, team_access, import_export, settings_access)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (user_id, org_id, perms[0], perms[1], perms[2], perms[3], perms[4], perms[5]))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Таблица user_permissions создана и заполнена',
                'users_processed': len(users)
            }),
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
