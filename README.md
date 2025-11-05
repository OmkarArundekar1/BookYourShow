# BookYourShow - Movie Ticket Booking Platform

A full-stack movie ticket booking application built with Next.js, Node.js, MySQL, and MongoDB.

## Tech Stack

- **Frontend**: Next.js 15+ with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes
- **Databases**: 
  - MySQL: Movies, shows, theaters, bookings, payments
  - MongoDB: User authentication (login/registration)
- **Authentication**: JWT-based authentication
- **UI**: shadcn/ui components

## Project Structure

\`\`\`
bookyourshow/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── movies/         # Movie management
│   │   ├── shows/          # Show management
│   │   ├── bookings/       # Booking management
│   │   ├── seats/          # Seat availability
│   │   ├── payments/       # Payment processing
│   │   └── admin/          # Admin dashboard APIs
│   ├── login/              # Login page
│   ├── signup/             # Registration page
│   ├── movies/             # Movie listings
│   ├── shows/              # Show details
│   ├── seats/              # Seat selection
│   ├── checkout/           # Payment checkout
│   ├── bookings/           # User bookings history
│   └── offers/             # Promotional offers
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── movie-carousel.tsx
│   ├── movie-grid.tsx
│   ├── seat-map.tsx
│   └── navbar.tsx
├── lib/
│   ├── db/
│   │   ├── mysql.ts        # MySQL connection
│   │   └── mongodb.ts      # MongoDB connection
│   ├── auth.ts             # JWT utilities
│   └── email.ts            # Email service
└── public/                 # Static assets

\`\`\`

## Environment Setup

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- MongoDB 4.0+ (local or cloud)

### 1. Clone & Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. MySQL Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=bookyourshow_db

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/bookyourshow

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Node Environment
NODE_ENV=development
\`\`\`

**Create the database:**

\`\`\`bash
mysql -u root -p < path/to/bookyourshow_updated.sql
\`\`\`

This will:
- Create the `bookyourshow_db` database
- Create all necessary tables (users, movies, theaters, shows, bookings, etc.)
- Set up database functions and triggers
- Create required views

### 3. MongoDB Setup

**Local MongoDB:**

\`\`\`bash
# Start MongoDB service
mongod
\`\`\`

**MongoDB Atlas (Cloud):**

Sign up at [mongodb.com/cloud](https://mongodb.com/cloud) and update `MONGO_URI` in `.env.local`.

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema Overview

### Core Tables

**users** (MySQL)
- Stores customer and admin profiles
- Used for general application user data

**users_mongo** (MongoDB)
- Stores authentication credentials
- Email, password hash, role
- Used for login/registration

**movies**
- Movie details (title, genre, rating, duration)

**theaters**
- Theater locations and names

**screens**
- Movie screens within theaters
- Seat capacity per screen

**shows**
- Scheduled movie shows
- Links: movie_id, screen_id, show_time, price

**bookings**
- Ticket booking records
- Links: user_id, show_id, total_amount, status

**booking_details**
- Individual seat numbers per booking

**payments**
- Payment transaction records
- Payment mode, status, amount

### Key Database Functions

- `total_seats_booked(show_id)` - Get booked seats count
- `theater_total_revenue(theater_id)` - Theater revenue calculation
- `movie_total_bookings(movie_id)` - Movie booking count

### Key Triggers

- `prevent_overbooking` - Prevents selling more seats than available
- `update_booking_status_after_payment` - Auto-updates booking status
- `log_booking_cancellation` - Audit trail for cancellations

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Movies & Shows
- `GET /api/movies` - List all movies
- `GET /api/movies/[id]` - Movie details
- `GET /api/shows` - List shows with filters
- `GET /api/shows/[id]` - Show details
- `GET /api/theaters` - List all theaters

### Bookings & Seats
- `GET /api/seats/[showId]` - Get seat availability
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - User's bookings
- `GET /api/bookings/[id]` - Booking details

### Payments
- `POST /api/payments` - Process payment

### Admin
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/bookings` - All bookings
- `POST /api/admin/movies` - Create movie
- `PUT /api/admin/movies` - Update movie
- `DELETE /api/admin/bookings` - Cancel booking

## Features

- Movie discovery with search and filtering
- Dynamic seat selection with real-time availability
- Multiple payment methods (Card, UPI, Wallet)
- Booking confirmation with email
- User booking history
- Admin dashboard with analytics
- Responsive design for all devices
- Dark/Light theme support

## Running SQL Scripts

All database migrations are included in the `.sql` file. Import it once:

\`\`\`bash
mysql -u root -p bookyourshow_db < bookyourshow_updated.sql
\`\`\`

## Deployment

### Vercel (Recommended for Frontend)

\`\`\`bash
npm run build
vercel deploy
\`\`\`

### Database Deployment

- **MySQL**: Use Amazon RDS, DigitalOcean, or Planetscale
- **MongoDB**: Use MongoDB Atlas

Update `.env` with production database URLs.

## Testing

Test the booking flow:

1. Go to [http://localhost:3000](http://localhost:3000)
2. Create an account at `/signup`
3. Browse movies and select a show
4. Choose seats and proceed to checkout
5. Complete payment
6. View confirmation and booking history

## Troubleshooting

**MySQL Connection Error**
- Ensure MySQL service is running: `sudo service mysql start`
- Verify credentials in `.env.local`

**MongoDB Connection Error**
- Check MongoDB service: `mongod --version`
- Update `MONGO_URI` if using Atlas

**Seat Availability Not Showing**
- Verify database has show records
- Check MySQL connection

**Payment Processing Fails**
- Ensure booking was created successfully
- Check payment method is valid

## Future Enhancements

- Email confirmation with ticket PDF
- SMS notifications
- Advanced admin reporting
- Refund management
- Multi-language support
- Mobile app (React Native)
- Stripe/PayPal integration

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - See LICENSE file for details
