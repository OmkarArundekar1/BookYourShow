# BookYourShow - Movie Ticket Booking System

A complete Flask web application for movie ticket booking that integrates with MySQL database, featuring user authentication, seat selection, admin dashboard, and comprehensive reporting.

## Features

### Customer Features
- **User Authentication**: Registration, login, and session management
- **Movie Browsing**: View movies with filters (genre, rating, search)
- **Movie Details**: Detailed movie information with available shows
- **Seat Selection**: Interactive seat map with real-time availability
- **Booking Management**: View booking history and cancel tickets
- **Payment Integration**: Simulated online/offline payment options

### Admin Features
- **Dashboard**: Key metrics and analytics overview
- **Movie Management**: Add, edit, and delete movies
- **Theater Management**: Manage theaters and screens
- **Show Scheduling**: Create and manage movie shows
- **Reports & Analytics**: Comprehensive booking and revenue reports
- **Real-time Data**: Live booking statistics and activity logs

### Technical Features
- **Database Integration**: MySQL with stored procedures, functions, views, and triggers
- **Responsive Design**: Bootstrap 5 with mobile-friendly interface
- **Security**: Password hashing, session management, SQL injection prevention
- **Error Handling**: Graceful error handling with user-friendly messages
- **Interactive UI**: Dynamic seat selection and real-time updates

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: MySQL 8.0+
- **Frontend**: Bootstrap 5, jQuery, Font Awesome
- **Authentication**: Flask-Session, Werkzeug Security
- **Database Connectivity**: Flask-MySQLdb

## Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bookyourshow
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create and populate database
source bookyourshow_updated.sql
```

### 4. Configuration
Update `config.py` with your database credentials:
```python
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'Root999'  # Change to your MySQL password
MYSQL_DB = 'bookyourshow_db'
```

### 5. Run the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Default Login Credentials

### Admin Access
- **Email**: admin@bys.com
- **Password**: secret

### Customer Access
- **Email**: rajesh.k@email.com
- **Password**: pass123

## Project Structure

```
bookyourshow/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── bookyourshow_updated.sql # Database schema and data
├── utils/
│   └── db_helper.py      # Database utility functions
├── static/
│   ├── css/
│   │   └── style.css     # Custom styles
│   ├── js/
│   │   └── main.js       # JavaScript functionality
│   └── images/           # Static images
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Home page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── movie_detail.html # Movie details
│   ├── booking.html      # Seat selection
│   ├── my_bookings.html  # User bookings
│   └── admin/            # Admin templates
│       ├── dashboard.html
│       ├── movies.html
│       ├── add_movie.html
│       └── reports.html
└── README.md             # This file
```

## Database Schema

### Core Tables
- **users**: User accounts (customers and admins)
- **theaters**: Movie theater information
- **screens**: Theater screens with seat capacity
- **movies**: Movie catalog with details
- **shows**: Movie showtimes and pricing
- **bookings**: Ticket bookings
- **booking_details**: Individual seat bookings
- **payments**: Payment transactions
- **cancellations_log**: Booking cancellation history
- **activity_log**: System activity tracking

### Database Features
- **Stored Procedures**: `get_full_booking_report`, `cancel_booking`, `top_movies_by_revenue`
- **Functions**: `total_seats_booked`, `theater_total_revenue`, `movie_total_bookings`
- **Views**: `movie_revenue`, `theater_revenue_summary`, `customer_booking_summary`
- **Triggers**: Automatic booking status updates, overbooking prevention, activity logging

## Key Features Implementation

### Seat Selection System
- Visual seat map (10 rows × 12 seats with aisle)
- Real-time seat availability checking
- Interactive seat selection with visual feedback
- Automatic total calculation

### Booking Flow
1. Browse movies and select show
2. Choose seats from interactive map
3. Select payment method
4. Confirm booking with automatic seat reservation
5. View booking confirmation and receipt

### Admin Dashboard
- Revenue analytics and key metrics
- Top movies by revenue (using stored procedures)
- Recent activity monitoring
- Quick action buttons for common tasks

### Security Features
- Password hashing with Werkzeug
- Session-based authentication
- SQL injection prevention with parameterized queries
- CSRF protection with Flask-WTF
- Input validation and sanitization

## API Endpoints

### Public Routes
- `GET /` - Home page with movie listings
- `GET /movie/<id>` - Movie details and shows
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /register` - Registration page
- `POST /register` - Process registration

### Authenticated Routes
- `GET /booking/<show_id>` - Seat selection page
- `POST /confirm_booking` - Process booking
- `GET /my_bookings` - User booking history
- `GET /cancel_booking/<booking_id>` - Cancel booking

### Admin Routes
- `GET /admin` - Admin dashboard
- `GET /admin/movies` - Movie management
- `GET /admin/theaters` - Theater management
- `GET /admin/shows` - Show management
- `GET /admin/reports` - Analytics and reports

### API Routes
- `GET /api/movies/search` - Movie search API
- `GET /api/shows/<show_id>/seats` - Get booked seats

## Testing Checklist

- [ ] User registration and login
- [ ] Browse movies with filters
- [ ] View movie details and shows
- [ ] Select seats and book tickets
- [ ] View and cancel bookings
- [ ] Admin dashboard access
- [ ] Movie/theater/show management
- [ ] Reports and analytics
- [ ] Database triggers and procedures
- [ ] Overbooking prevention
- [ ] Payment processing simulation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in `config.py`
   - Ensure database exists

2. **Import Errors**
   - Install all requirements: `pip install -r requirements.txt`
   - Check Python version compatibility

3. **Template Not Found**
   - Ensure all template files are in correct directories
   - Check file permissions

4. **Seat Selection Not Working**
   - Verify JavaScript is enabled
   - Check browser console for errors
   - Ensure jQuery and Bootstrap are loaded

## Future Enhancements

- Email notifications for bookings
- QR code ticket generation
- Movie trailer integration
- Rating and review system
- Multi-language support
- Mobile app development
- Advanced analytics dashboard
- Integration with payment gateways

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the database schema documentation

---

**Note**: This is a demonstration project. For production use, implement proper security measures, error handling, and testing.