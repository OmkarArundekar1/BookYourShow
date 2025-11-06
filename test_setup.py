#!/usr/bin/env python3
"""
BookYourShow Setup Test Script
Tests database connectivity and basic functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    from utils.db_helper import execute_query
    print("✓ Flask app imports successful")
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)

def test_database_connection():
    """Test database connectivity"""
    try:
        with app.app_context():
            result = execute_query("SELECT COUNT(*) as count FROM users")
            print(f"✓ Database connection successful - {result[0]['count']} users found")
            return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def test_sample_data():
    """Test if sample data exists"""
    try:
        with app.app_context():
            # Test movies
            movies = execute_query("SELECT COUNT(*) as count FROM movies")
            print(f"✓ Movies table: {movies[0]['count']} movies")
            
            # Test theaters
            theaters = execute_query("SELECT COUNT(*) as count FROM theaters")
            print(f"✓ Theaters table: {theaters[0]['count']} theaters")
            
            # Test shows
            shows = execute_query("SELECT COUNT(*) as count FROM shows")
            print(f"✓ Shows table: {shows[0]['count']} shows")
            
            # Test bookings
            bookings = execute_query("SELECT COUNT(*) as count FROM bookings")
            print(f"✓ Bookings table: {bookings[0]['count']} bookings")
            
            return True
    except Exception as e:
        print(f"✗ Sample data test failed: {e}")
        return False

def test_stored_procedures():
    """Test stored procedures"""
    try:
        with app.app_context():
            from utils.db_helper import call_procedure, call_function
            
            # Test procedure
            report = call_procedure('get_full_booking_report')
            print(f"✓ Stored procedure test: {len(report)} booking records")
            
            # Test function
            total_seats = call_function("SELECT total_seats_booked(%s)", (1,))
            print(f"✓ Function test: {total_seats} seats booked for show 1")
            
            return True
    except Exception as e:
        print(f"✗ Stored procedures test failed: {e}")
        return False

def test_admin_user():
    """Test admin user exists"""
    try:
        with app.app_context():
            admin = execute_query("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
            if admin:
                print(f"✓ Admin user found: {admin[0]['email']}")
                return True
            else:
                print("✗ No admin user found")
                return False
    except Exception as e:
        print(f"✗ Admin user test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("BookYourShow Setup Test")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_sample_data,
        test_stored_procedures,
        test_admin_user
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✓ All tests passed! Your BookYourShow setup is ready.")
        print("\nNext steps:")
        print("1. Run: python app.py")
        print("2. Open: http://localhost:5000")
        print("3. Login with admin@bys.com / secret")
    else:
        print("✗ Some tests failed. Please check your setup.")
        sys.exit(1)

if __name__ == "__main__":
    main()