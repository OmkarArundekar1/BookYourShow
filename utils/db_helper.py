from flask import current_app
import MySQLdb.cursors

def get_db_connection():
    """Get database connection using Flask-MySQLdb"""
    return current_app.mysql.connection

def execute_query(query, params=None, fetch=True):
    """Execute a query and return results"""
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute(query, params or ())
        
        if fetch:
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                return results
            else:
                conn.commit()
                return cursor.lastrowid
        else:
            conn.commit()
            return True
            
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()

def call_procedure(proc_name, params=None):
    """Call a stored procedure"""
    conn = get_db_connection()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        cursor.callproc(proc_name, params or ())
        
        # Handle multiple result sets
        results = []
        try:
            # Get the first result set
            results = cursor.fetchall()
            
            # Consume any additional result sets
            while cursor.nextset():
                pass
                
        except Exception:
            # If no results, that's okay for some procedures
            pass
            
        conn.commit()
        return results
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()

def call_function(func_query, params=None):
    """Call a database function"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(func_query, params or ())
        result = cursor.fetchone()
        return result[0] if result else 0
    except Exception as e:
        raise e
    finally:
        cursor.close()

def execute_transaction(queries_with_params):
    """Execute multiple queries in a transaction"""
    conn = get_db_connection()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)
    
    try:
        for query, params in queries_with_params:
            cursor.execute(query, params)
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()