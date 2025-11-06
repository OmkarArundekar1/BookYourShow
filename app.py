from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_mysqldb import MySQL
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
from config import Config
from utils.db_helper import execute_query, call_procedure, call_function, execute_transaction

# Add datetime to template globals
def inject_now():
    return {'moment': datetime.now}

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
mysql = MySQL(app)
app.mysql = mysql  # Make mysql accessible to db_helper
Session(app)

# Add template globals
app.context_processor(inject_now)

# Create upload directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Helper functions
def login_required(f):
    """Decorator to require login"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'admin':
            flash('Admin access required.', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    """Home page with movie listings"""
    try:
        # Get all movies with show counts
        movies_query = """
        SELECT m.*, COUNT(s.show_id) as show_count
        FROM movies m
        LEFT JOIN shows s ON m.movie_id = s.movie_id 
        WHERE s.show_time > NOW()
        GROUP BY m.movie_id
        ORDER BY m.release_date DESC
        """
        movies = execute_query(movies_query)
        
        # Get unique genres for filter
        genres = execute_query("SELECT DISTINCT genre FROM movies ORDER BY genre")
        
        return render_template('index.html', movies=movies, genres=genres)
    except Exception as e:
        flash(f'Error loading movies: {str(e)}', 'error')
        return render_template('index.html', movies=[], genres=[])

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        
        if not all([name, email, password]):
            flash('All fields are required.', 'error')
            return render_template('register.html')
        
        try:
            # Check if email already exists
            existing_user = execute_query("SELECT user_id FROM users WHERE email = %s", (email,))
            if existing_user:
                flash('Email already registered. Please login.', 'error')
                return render_template('register.html')
            
            # Hash password and create user
            hashed_password = generate_password_hash(password)
            user_id = execute_query(
                "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, 'customer')",
                (name, email, hashed_password),
                fetch=False
            )
            
            flash('Registration successful! Please login.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            flash(f'Registration failed: {str(e)}', 'error')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        try:
            user = execute_query("SELECT * FROM users WHERE email = %s", (email,))
            
            if user and (check_password_hash(user[0]['password'], password) or user[0]['password'] == password):
                session['user_id'] = user[0]['user_id']
                session['name'] = user[0]['name']
                session['role'] = user[0]['role']
                session.permanent = True  # Make session permanent
                
                flash(f'Welcome back, {user[0]["name"]}!', 'success')
                
                if user[0]['role'] == 'admin':
                    return redirect(url_for('admin_dashboard'))
                else:
                    return redirect(url_for('index'))
            else:
                flash('Invalid email or password.', 'error')
                
        except Exception as e:
            flash(f'Login failed: {str(e)}', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/movie/<int:movie_id>')
def movie_detail(movie_id):
    """Movie details and show listings"""
    try:
        # Get movie details
        movie = execute_query("SELECT * FROM movies WHERE movie_id = %s", (movie_id,))
        if not movie:
            flash('Movie not found.', 'error')
            return redirect(url_for('index'))
        
        movie = movie[0]
        
        # Get shows for this movie
        shows_query = """
        SELECT s.show_id, s.show_time, s.price,
               t.name as theater_name, sc.screen_name,
               total_seats_booked(s.show_id) as booked_seats,
               sc.total_seats
        FROM shows s
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        WHERE s.movie_id = %s AND s.show_time > NOW()
        ORDER BY s.show_time
        """
        shows = execute_query(shows_query, (movie_id,))
        
        return render_template('movie_detail.html', movie=movie, shows=shows)
        
    except Exception as e:
        flash(f'Error loading movie details: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/booking/<int:show_id>')
@login_required
def booking(show_id):
    """Seat selection page"""
    try:
        # Get show details
        show_query = """
        SELECT s.*, m.title as movie_title, t.name as theater_name, 
               sc.screen_name, sc.total_seats
        FROM shows s
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        WHERE s.show_id = %s
        """
        show = execute_query(show_query, (show_id,))
        if not show:
            flash('Show not found.', 'error')
            return redirect(url_for('index'))
        
        show = show[0]
        
        # Get booked seats
        booked_seats_query = """
        SELECT bd.seat_number
        FROM booking_details bd
        JOIN bookings b ON bd.booking_id = b.booking_id
        WHERE b.show_id = %s AND b.status = 'confirmed'
        """
        booked_seats = execute_query(booked_seats_query, (show_id,))
        booked_seat_numbers = [seat['seat_number'] for seat in booked_seats]
        
        return render_template('booking.html', show=show, booked_seats=booked_seat_numbers)
        
    except Exception as e:
        flash(f'Error loading booking page: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/confirm_booking', methods=['POST'])
@login_required
def confirm_booking():
    """Process booking confirmation"""
    try:
        show_id = int(request.form['show_id'])
        selected_seats = request.form.getlist('seats')
        payment_mode = request.form['payment_mode']
        
        if not selected_seats:
            flash('Please select at least one seat.', 'error')
            return redirect(url_for('booking', show_id=show_id))
        
        # Get show price
        show = execute_query("SELECT price FROM shows WHERE show_id = %s", (show_id,))
        if not show:
            flash('Invalid show.', 'error')
            return redirect(url_for('index'))
        
        price_per_seat = float(show[0]['price'])
        total_amount = price_per_seat * len(selected_seats)
        
        # Check if seats are still available
        booked_seats_query = """
        SELECT bd.seat_number
        FROM booking_details bd
        JOIN bookings b ON bd.booking_id = b.booking_id
        WHERE b.show_id = %s AND b.status = 'confirmed'
        """
        booked_seats = execute_query(booked_seats_query, (show_id,))
        booked_seat_numbers = [seat['seat_number'] for seat in booked_seats]
        
        for seat in selected_seats:
            if seat in booked_seat_numbers:
                flash(f'Seat {seat} is already booked. Please select different seats.', 'error')
                return redirect(url_for('booking', show_id=show_id))
        
        # Create booking transaction
        queries = [
            ("INSERT INTO bookings (user_id, show_id, total_amount, status) VALUES (%s, %s, %s, 'confirmed')",
             (session['user_id'], show_id, total_amount))
        ]
        
        # Execute booking creation
        booking_id = execute_query(queries[0][0], queries[0][1], fetch=False)
        
        # Add seat details
        for seat in selected_seats:
            execute_query(
                "INSERT INTO booking_details (booking_id, seat_number) VALUES (%s, %s)",
                (booking_id, seat),
                fetch=False
            )
        
        # Add payment record
        execute_query(
            "INSERT INTO payments (booking_id, amount, payment_mode, payment_status) VALUES (%s, %s, %s, 'success')",
            (booking_id, total_amount, payment_mode),
            fetch=False
        )
        
        flash(f'Booking confirmed! Booking ID: {booking_id}', 'success')
        return redirect(url_for('my_bookings'))
        
    except Exception as e:
        flash(f'Booking failed: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/my_bookings')
@login_required
def my_bookings():
    """User's booking history"""
    try:
        bookings_query = """
        SELECT b.booking_id, b.booking_date, b.total_amount, b.status,
               m.title as movie_title, t.name as theater_name, 
               sc.screen_name, s.show_time,
               GROUP_CONCAT(bd.seat_number ORDER BY bd.seat_number SEPARATOR ', ') as seats,
               CASE WHEN s.show_time > NOW() THEN 1 ELSE 0 END as can_cancel
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        LEFT JOIN booking_details bd ON b.booking_id = bd.booking_id
        WHERE b.user_id = %s
        GROUP BY b.booking_id, b.booking_date, b.total_amount, b.status, 
                 m.title, t.name, sc.screen_name, s.show_time
        ORDER BY b.booking_date DESC
        """
        bookings = execute_query(bookings_query, (session['user_id'],))
        
        return render_template('my_bookings.html', bookings=bookings)
        
    except Exception as e:
        flash(f'Error loading bookings: {str(e)}', 'error')
        return render_template('my_bookings.html', bookings=[])

@app.route('/cancel_booking/<int:booking_id>')
@login_required
def cancel_booking_route(booking_id):
    """Cancel a booking (redirect version for compatibility)"""
    try:
        result = cancel_booking_api(booking_id)
        if result['success']:
            flash(result['message'], 'success')
        else:
            flash(result['message'], 'error')
        return redirect(url_for('my_bookings'))
    except Exception as e:
        flash(f'Error cancelling booking: {str(e)}', 'error')
        return redirect(url_for('my_bookings'))

@app.route('/api/cancel_booking/<int:booking_id>', methods=['POST'])
@login_required
def cancel_booking_api(booking_id):
    """Cancel a booking API endpoint"""
    try:
        # Verify booking belongs to user and get show details
        booking_query = """
        SELECT b.*, s.show_time, m.title as movie_title
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE b.booking_id = %s AND b.user_id = %s
        """
        booking = execute_query(booking_query, (booking_id, session['user_id']))
        
        if not booking:
            return jsonify({
                'success': False,
                'message': 'Booking not found or you do not have permission to cancel this booking.',
                'error_code': 'BOOKING_NOT_FOUND'
            }), 404
        
        booking = booking[0]
        
        if booking['status'] == 'cancelled':
            return jsonify({
                'success': False,
                'message': 'This booking has already been cancelled.',
                'error_code': 'ALREADY_CANCELLED'
            }), 400
        
        # Check if show is in the future
        if booking['show_time'] <= datetime.now():
            return jsonify({
                'success': False,
                'message': 'Cannot cancel booking for shows that have already started or ended.',
                'error_code': 'SHOW_PAST'
            }), 400
        
        # Use transaction to ensure data consistency
        try:
            # Update booking status
            execute_query(
                "UPDATE bookings SET status = 'cancelled' WHERE booking_id = %s",
                (booking_id,),
                fetch=False
            )
            
            # Log the cancellation
            execute_query(
                "INSERT INTO cancellations_log (booking_id, user_id, reason) VALUES (%s, %s, %s)",
                (booking_id, session['user_id'], 'User cancelled booking'),
                fetch=False
            )
            
            # Log activity
            execute_query(
                "INSERT INTO activity_log (user_id, booking_id, activity_type, details) VALUES (%s, %s, %s, %s)",
                (session['user_id'], booking_id, 'CANCELLED_BOOKING', f'Cancelled booking for {booking["movie_title"]}'),
                fetch=False
            )
            
            return jsonify({
                'success': True,
                'message': f'Booking #{booking_id} for "{booking["movie_title"]}" has been successfully cancelled.',
                'booking_id': booking_id,
                'movie_title': booking['movie_title']
            })
            
        except Exception as db_error:
            return jsonify({
                'success': False,
                'message': 'Database error occurred while cancelling the booking. Please try again.',
                'error_code': 'DATABASE_ERROR',
                'details': str(db_error)
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.',
            'error_code': 'UNEXPECTED_ERROR',
            'details': str(e)
        }), 500

# Admin Routes
@app.route('/admin')
@admin_required
def admin_dashboard():
    """Admin dashboard with key metrics"""
    try:
        # Get total revenue
        total_revenue = execute_query(
            "SELECT SUM(total_amount) as revenue FROM bookings WHERE status = 'confirmed'"
        )[0]['revenue'] or 0
        
        # Get total bookings
        total_bookings = execute_query("SELECT COUNT(*) as count FROM bookings")[0]['count']
        
        # Get top movies by revenue (using direct query instead of procedure)
        top_movies_query = """
        SELECT 
            m.title AS Movie,
            COUNT(b.booking_id) AS TotalBookings,
            SUM(b.total_amount) AS Revenue
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE b.status = 'confirmed'
        GROUP BY m.movie_id, m.title
        ORDER BY Revenue DESC
        LIMIT 3
        """
        top_movies = execute_query(top_movies_query)
        
        # Get recent activity
        recent_activity = execute_query(
            "SELECT * FROM activity_log ORDER BY log_timestamp DESC LIMIT 10"
        )
        
        return render_template('admin/dashboard.html',
                             total_revenue=total_revenue,
                             total_bookings=total_bookings,
                             top_movies=top_movies,
                             recent_activity=recent_activity)
        
    except Exception as e:
        flash(f'Error loading dashboard: {str(e)}', 'error')
        return render_template('admin/dashboard.html',
                             total_revenue=0, total_bookings=0,
                             top_movies=[], recent_activity=[])

@app.route('/admin/movies')
@admin_required
def admin_movies():
    """Admin movies management"""
    try:
        movies = execute_query("SELECT * FROM movies ORDER BY release_date DESC")
        return render_template('admin/movies.html', movies=movies)
    except Exception as e:
        flash(f'Error loading movies: {str(e)}', 'error')
        return render_template('admin/movies.html', movies=[])

@app.route('/admin/theaters')
@admin_required
def admin_theaters():
    """Admin theaters management"""
    try:
        theaters_query = """
        SELECT t.*, COUNT(s.screen_id) as screen_count
        FROM theaters t
        LEFT JOIN screens s ON t.theater_id = s.theater_id
        GROUP BY t.theater_id
        ORDER BY t.name
        """
        theaters = execute_query(theaters_query)
        return render_template('admin/theaters.html', theaters=theaters)
    except Exception as e:
        flash(f'Error loading theaters: {str(e)}', 'error')
        return render_template('admin/theaters.html', theaters=[])

@app.route('/admin/shows')
@admin_required
def admin_shows():
    """Admin shows management"""
    try:
        shows_query = """
        SELECT s.*, m.title as movie_title, t.name as theater_name, 
               sc.screen_name, total_seats_booked(s.show_id) as booked_seats,
               sc.total_seats
        FROM shows s
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        ORDER BY s.show_time DESC
        """
        shows = execute_query(shows_query)
        return render_template('admin/shows.html', shows=shows)
    except Exception as e:
        flash(f'Error loading shows: {str(e)}', 'error')
        return render_template('admin/shows.html', shows=[])

@app.route('/admin/reports')
@admin_required
def admin_reports():
    """Admin reports and analytics"""
    try:
        # Get full booking report (using direct query instead of procedure)
        booking_report_query = """
        SELECT 
            b.booking_id,
            u.name AS Customer,
            m.title AS Movie,
            t.name AS Theater,
            s.show_time AS ShowTime,
            b.total_amount AS Amount,
            b.status AS Status
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN theaters t ON sc.theater_id = t.theater_id
        ORDER BY b.booking_date DESC
        """
        booking_report = execute_query(booking_report_query)
        
        # Get movie revenue view
        movie_revenue = execute_query("SELECT * FROM movie_revenue ORDER BY total_revenue DESC")
        
        # Get theater revenue summary
        theater_revenue = execute_query("SELECT * FROM theater_revenue_summary ORDER BY TotalRevenue DESC")
        
        # Get customer booking summary
        customer_summary = execute_query("SELECT * FROM customer_booking_summary ORDER BY Amount DESC LIMIT 20")
        
        return render_template('admin/reports.html',
                             booking_report=booking_report,
                             movie_revenue=movie_revenue,
                             theater_revenue=theater_revenue,
                             customer_summary=customer_summary)
    except Exception as e:
        flash(f'Error loading reports: {str(e)}', 'error')
        return render_template('admin/reports.html',
                             booking_report=[], movie_revenue=[],
                             theater_revenue=[], customer_summary=[])

@app.route('/admin/add_movie', methods=['GET', 'POST'])
@admin_required
def admin_add_movie():
    """Add new movie"""
    if request.method == 'POST':
        title = request.form['title']
        genre = request.form['genre']
        duration = int(request.form['duration'])
        rating = float(request.form['rating'])
        release_date = request.form['release_date']
        
        try:
            execute_query(
                "INSERT INTO movies (title, genre, duration, rating, release_date) VALUES (%s, %s, %s, %s, %s)",
                (title, genre, duration, rating, release_date),
                fetch=False
            )
            flash('Movie added successfully!', 'success')
            return redirect(url_for('admin_movies'))
        except Exception as e:
            flash(f'Error adding movie: {str(e)}', 'error')
    
    return render_template('admin/add_movie.html')

@app.route('/admin/add_theater', methods=['GET', 'POST'])
@admin_required
def admin_add_theater():
    """Add new theater"""
    if request.method == 'POST':
        name = request.form['name']
        location = request.form['location']
        
        try:
            theater_id = execute_query(
                "INSERT INTO theaters (name, location) VALUES (%s, %s)",
                (name, location),
                fetch=False
            )
            flash('Theater added successfully!', 'success')
            return redirect(url_for('admin_theaters'))
        except Exception as e:
            flash(f'Error adding theater: {str(e)}', 'error')
    
    return render_template('admin/add_theater.html')

@app.route('/admin/add_show', methods=['GET', 'POST'])
@admin_required
def admin_add_show():
    """Add new show"""
    if request.method == 'POST':
        movie_id = int(request.form['movie_id'])
        screen_id = int(request.form['screen_id'])
        show_time = request.form['show_time']
        price = float(request.form['price'])
        
        try:
            execute_query(
                "INSERT INTO shows (movie_id, screen_id, show_time, price) VALUES (%s, %s, %s, %s)",
                (movie_id, screen_id, show_time, price),
                fetch=False
            )
            flash('Show added successfully!', 'success')
            return redirect(url_for('admin_shows'))
        except Exception as e:
            flash(f'Error adding show: {str(e)}', 'error')
    
    # Get movies and screens for form
    movies = execute_query("SELECT * FROM movies ORDER BY title")
    screens_query = """
    SELECT s.*, t.name as theater_name
    FROM screens s
    JOIN theaters t ON s.theater_id = t.theater_id
    ORDER BY t.name, s.screen_name
    """
    screens = execute_query(screens_query)
    
    return render_template('admin/add_show.html', movies=movies, screens=screens)

# API Routes for AJAX calls
@app.route('/api/movies/search')
def api_search_movies():
    """API endpoint for movie search"""
    search = request.args.get('q', '')
    genre = request.args.get('genre', '')
    rating = request.args.get('rating', '')
    
    query = "SELECT * FROM movies WHERE 1=1"
    params = []
    
    if search:
        query += " AND title LIKE %s"
        params.append(f"%{search}%")
    
    if genre:
        query += " AND genre = %s"
        params.append(genre)
    
    if rating:
        query += " AND rating >= %s"
        params.append(float(rating))
    
    query += " ORDER BY release_date DESC"
    
    try:
        movies = execute_query(query, params)
        return jsonify({'success': True, 'movies': movies})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/shows/<int:show_id>/seats')
def api_show_seats(show_id):
    """API endpoint to get booked seats for a show"""
    try:
        booked_seats_query = """
        SELECT bd.seat_number
        FROM booking_details bd
        JOIN bookings b ON bd.booking_id = b.booking_id
        WHERE b.show_id = %s AND b.status = 'confirmed'
        """
        booked_seats = execute_query(booked_seats_query, (show_id,))
        seat_numbers = [seat['seat_number'] for seat in booked_seats]
        
        return jsonify({'success': True, 'booked_seats': seat_numbers})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/favicon.ico')
def favicon():
    """Serve favicon to prevent 404 errors"""
    from flask import Response
    # Return a simple 1x1 transparent PNG as favicon
    favicon_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    return Response(favicon_data, mimetype='image/png')

@app.route('/sw.js')
def service_worker():
    """Serve empty service worker to prevent 404 errors"""
    return '', 204

@app.route('/debug/session')
def debug_session():
    """Debug session data (remove in production)"""
    return f"""
    <h2>Session Debug</h2>
    <p><strong>User ID:</strong> {session.get('user_id', 'Not set')}</p>
    <p><strong>Name:</strong> {session.get('name', 'Not set')}</p>
    <p><strong>Role:</strong> {session.get('role', 'Not set')}</p>
    <p><strong>All Session Data:</strong> {dict(session)}</p>
    <a href="/">Back to Home</a>
    """

@app.route('/debug/test_db')
def test_db():
    """Test database connection"""
    try:
        result = execute_query("SELECT 1 as test")
        return f"Database connection OK: {result}"
    except Exception as e:
        return f"Database error: {str(e)}"

@app.route('/debug/test_cancel_api/<int:booking_id>')
@login_required
def test_cancel_api(booking_id):
    """Test cancel booking API functionality"""
    try:
        # Test the API endpoint
        result = cancel_booking_api(booking_id)
        return result
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/debug/create_test_booking')
@login_required
def create_test_booking():
    """Create a test booking for debugging (remove in production)"""
    try:
        # Get a show
        show = execute_query("SELECT show_id FROM shows LIMIT 1")
        if not show:
            return "No shows available"
        
        show_id = show[0]['show_id']
        
        # Create test booking
        booking_id = execute_query(
            "INSERT INTO bookings (user_id, show_id, total_amount, status) VALUES (%s, %s, %s, 'confirmed')",
            (session['user_id'], show_id, 500.00),
            fetch=False
        )
        
        # Add seat details
        execute_query(
            "INSERT INTO booking_details (booking_id, seat_number) VALUES (%s, %s)",
            (booking_id, 'A1'),
            fetch=False
        )
        
        flash('Test booking created successfully!', 'success')
        return redirect(url_for('my_bookings'))
        
    except Exception as e:
        return f"Error: {str(e)}"

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>404 - Page Not Found</title></head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>404 - Page Not Found</h1>
        <p>The requested page could not be found.</p>
        <a href="/" style="color: #007bff;">Go back to home</a>
    </body>
    </html>
    ''', 404

@app.errorhandler(500)
def internal_error(error):
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>500 - Internal Server Error</title></head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>500 - Internal Server Error</h1>
        <p>Something went wrong on our end.</p>
        <a href="/" style="color: #007bff;">Go back to home</a>
    </body>
    </html>
    ''', 500

@app.errorhandler(403)
def forbidden_error(error):
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>403 - Forbidden</title></head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>403 - Forbidden</h1>
        <p>You don't have permission to access this resource.</p>
        <a href="/" style="color: #007bff;">Go back to home</a>
    </body>
    </html>
    ''', 403

if __name__ == '__main__':
    app.run(debug=True)