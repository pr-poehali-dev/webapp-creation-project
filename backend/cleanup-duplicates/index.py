import os
import json
import psycopg2

def handler(event: dict, context) -> dict:
    '''Удаляет дубликаты статусов критериев из базы данных'''
    
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Сначала считаем дубли
        cur.execute("""
            SELECT COUNT(*) 
            FROM criterion_statuses cs1
            WHERE EXISTS (
                SELECT 1 FROM criterion_statuses cs2
                WHERE cs2.criterion_id = cs1.criterion_id
                AND cs2.label = cs1.label
                AND cs2.weight = cs1.weight
                AND cs2.sort_order = cs1.sort_order
                AND cs2.id > cs1.id
            )
        """)
        duplicates_count = cur.fetchone()[0]
        
        # Удаляем дубли, оставляя записи с минимальным id
        cur.execute("""
            DELETE FROM criterion_statuses
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM criterion_statuses
                GROUP BY criterion_id, label, weight, sort_order
            )
        """)
        
        deleted_count = cur.rowcount
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'deleted_count': deleted_count,
                'duplicates_found': duplicates_count,
                'message': f'Удалено {deleted_count} дублирующихся записей'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
