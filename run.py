#!/usr/bin/env python3
"""
BookYourShow Application Launcher
"""

import os
import sys
from app import app

def main():
    """Launch the BookYourShow application"""
    print("🎬 Starting BookYourShow Application...")
    print("=" * 50)
    
    # Check if running in development mode
    debug_mode = os.environ.get('FLASK_ENV') == 'development' or '--debug' in sys.argv
    
    if debug_mode:
        print("🔧 Running in DEBUG mode")
        print("📝 Auto-reload enabled")
    else:
        print("🚀 Running in PRODUCTION mode")
    
    print(f"🌐 Server will start at: http://localhost:5000")
    print("📧 Admin Login: admin@bys.com / secret")
    print("👤 Customer Login: rajesh.k@email.com / pass123")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=debug_mode,
            use_reloader=debug_mode
        )
    except KeyboardInterrupt:
        print("\n👋 BookYourShow server stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()