# BookYourShow - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run the database script
source bookyourshow_updated.sql

# Verify setup
SHOW DATABASES;
USE bookyourshow_db;
SHOW TABLES;
```

### Step 2: Install Dependencies
```bash
# Install Python packages
pip install -r requirements.txt
```

### Step 3: Configure Database
Edit `config.py` and update your MySQL password:
```python
MYSQL_PASSWORD = 'Your_MySQL_Password_Here'
```

### Step 4: Test Setup
```bash
# Run the test script
python test_setup.py
```

### Step 5: Launch Application
```bash
# Start the server
python run.py

# Or use Flask directly
python app.py
```

### Step 6: Access Application
- **URL**: http://localhost:5000
- **Admin**: admin@bys.com / secret
- **Customer**: rajesh.k@email.com / pass123

## 🎯 What You Get

### Customer Features
✅ Browse movies with filters  
✅ Interactive seat selection  
✅ Booking management  
✅ Payment simulation  

### Admin Features  
✅ Dashboard with analytics  
✅ Movie management  
✅ Theater management  
✅ Show scheduling  
✅ Comprehensive reports  

### Technical Features
✅ MySQL integration with procedures/functions  
✅ Responsive Bootstrap UI  
✅ Session-based authentication  
✅ Real-time seat availability  
✅ Booking triggers and validations  

## 🔧 Troubleshooting

### Database Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Reset MySQL password if needed
sudo mysql_secure_installation
```

### Python Issues
```bash
# Check Python version (3.8+ required)
python --version

# Install missing packages
pip install flask flask-mysqldb flask-session flask-wtf
```

### Port Issues
```bash
# Check if port 5000 is in use
lsof -i :5000

# Use different port
export FLASK_RUN_PORT=8000
python app.py
```

## 📊 Sample Data Included

- **10 Movies**: Popular titles with ratings
- **8 Theaters**: Multiple screens each  
- **50+ Shows**: Scheduled across different times
- **15 Users**: Including admin and customers
- **Sample Bookings**: With realistic data

## 🎬 Demo Workflow

1. **Browse Movies** → Filter by genre/rating
2. **Select Movie** → View showtimes  
3. **Choose Show** → Interactive seat map
4. **Book Tickets** → Select payment method
5. **View Bookings** → Manage reservations
6. **Admin Panel** → Analytics and management

## 📱 Mobile Friendly

The application is fully responsive and works on:
- Desktop browsers
- Tablets  
- Mobile phones

## 🔒 Security Features

- Password hashing
- Session management
- SQL injection prevention
- Input validation
- CSRF protection

## 📈 Analytics Available

- Revenue by theater/movie
- Booking trends
- Occupancy rates
- Customer activity
- Cancellation logs

---

**Need Help?** Check the main README.md for detailed documentation.