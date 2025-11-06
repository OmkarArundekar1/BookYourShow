import os

class Config:
    # Database Configuration
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'Root999'
    MYSQL_DB = 'bookyourshow_db'
    MYSQL_CURSORCLASS = 'DictCursor'
    MYSQL_AUTOCOMMIT = True
    MYSQL_CONNECT_TIMEOUT = 60
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-change-in-production'
    
    # Session Configuration
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = 'bookyourshow:'
    
    # Upload Configuration
    UPLOAD_FOLDER = 'static/images'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size