# BookYourShow - Setup Guide

This guide will help you set up the BookYourShow application locally with MySQL and MongoDB.

## Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **MySQL**: 8.0 or higher
- **MongoDB**: 4.0 or higher (local or Atlas)
- **Git**: For cloning the repository

## Installation Steps

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd bookyourshow
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Copy the example environment file and update it with your configuration:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your database credentials:

\`\`\`env
# MySQL Configuration
NEXT_PUBLIC_MYSQL_HOST=localhost
NEXT_PUBLIC_MYSQL_PORT=3306
NEXT_PUBLIC_MYSQL_USER=root
NEXT_PUBLIC_MYSQL_PASSWORD=your_mysql_password
NEXT_PUBLIC_MYSQL_DATABASE=bookyourshow_db

# MongoDB Configuration
NEXT_PUBLIC_MONGO_URI=mongodb://localhost:27017/bookyourshow

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Security (Generate a strong random string for production)
JWT_SECRET=your-secure-jwt-secret-key-here
\`\`\`

## MySQL Setup

### On Windows

1. Download and install MySQL from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. During installation, remember the root password
3. Open Command Prompt or PowerShell as Administrator
4. Start MySQL:
   \`\`\`bash
   net start MySQL80
   \`\`\`

### On macOS

Using Homebrew:

\`\`\`bash
brew install mysql
brew services start mysql
\`\`\`

### On Linux (Ubuntu/Debian)

\`\`\`bash
sudo apt-get install mysql-server
sudo service mysql start
\`\`\`

### Initialize the Database

1. Open MySQL CLI:
   \`\`\`bash
   mysql -u root -p
   \`\`\`
   (Enter your password when prompted)

2. Create the database and tables:
   \`\`\`bash
   mysql -u root -p < bookyourshow_updated.sql
   \`\`\`

3. Verify the setup:
   \`\`\`bash
   mysql -u root -p -e "USE bookyourshow_db; SHOW TABLES;"
   \`\`\`

## MongoDB Setup

### Option 1: Local MongoDB

#### On Windows

1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the prompts
3. MongoDB will start automatically

#### On macOS

\`\`\`bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
\`\`\`

#### On Linux (Ubuntu/Debian)

\`\`\`bash
sudo apt-get install -y mongodb
sudo service mongod start
\`\`\`

### Option 2: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster
4. Generate a connection string
5. Update \`NEXT_PUBLIC_MONGO_URI\` in \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookyourshow
   \`\`\`

## Running the Application

### Development Mode

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Testing the Application

### 1. Create an Account

- Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
- Fill in the registration form
- Click "Sign Up"

### 2. Login

- Go to [http://localhost:3000/login](http://localhost:3000/login)
- Enter your credentials
- You'll receive a JWT token

### 3. Browse Movies

- Visit [http://localhost:3000](http://localhost:3000)
- View featured movies and coming soon releases

### 4. Book a Ticket

1. Click on a movie
2. Select a theater and showtime
3. Choose your seats
4. Fill in checkout details
5. Complete payment

### 5. View Bookings

- Navigate to [http://localhost:3000/bookings](http://localhost:3000/bookings)
- View all your bookings

## Troubleshooting

### MySQL Connection Issues

**Error**: \`connect ECONNREFUSED 127.0.0.1:3306\`

**Solution**:
- Ensure MySQL is running
- Check connection credentials in \`.env.local\`
- Verify MySQL port (default 3306)

**Windows**:
\`\`\`bash
net start MySQL80
\`\`\`

**macOS/Linux**:
\`\`\`bash
sudo service mysql start
\`\`\`

### MongoDB Connection Issues

**Error**: \`MongooseError: Cannot connect to MongoDB\`

**Solution**:
- Ensure MongoDB is running: \`mongod\`
- Check connection URI in \`.env.local\`
- If using Atlas, verify IP whitelist and credentials

### JWT Token Issues

**Error**: \`Invalid token\`

**Solution**:
- Ensure \`JWT_SECRET\` is set in \`.env.local\`
- Check token is being sent in Authorization header as \`Bearer <token>\`

### Database Table Issues

**Error**: \`Table 'bookyourshow_db.movies' doesn't exist\`

**Solution**:
- Verify SQL script was imported: \`mysql -u root -p bookyourshow_db < bookyourshow_updated.sql\`
- Check database name matches \`NEXT_PUBLIC_MYSQL_DATABASE\`

## Common Commands

### View MySQL Databases

\`\`\`bash
mysql -u root -p -e "SHOW DATABASES;"
\`\`\`

### View Tables in BookYourShow Database

\`\`\`bash
mysql -u root -p -e "USE bookyourshow_db; SHOW TABLES;"
\`\`\`

### Check MongoDB Connection

\`\`\`bash
mongo
\`\`\`

### Stop Services

**MySQL**:
\`\`\`bash
# Windows
net stop MySQL80

# macOS
brew services stop mongodb-community

# Linux
sudo service mysql stop
\`\`\`

**MongoDB**:
\`\`\`bash
# Windows - Stop from Services

# macOS
brew services stop mongodb-community

# Linux
sudo service mongod stop
\`\`\`

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Database Hosting

**MySQL**:
- Amazon RDS
- DigitalOcean Managed Database
- PlanetScale

**MongoDB**:
- MongoDB Atlas (recommended)
- AWS DocumentDB
- Azure Cosmos DB

## Security Checklist

- [ ] Generate a strong \`JWT_SECRET\` for production
- [ ] Never commit \`.env.local\` to version control
- [ ] Use HTTPS for production
- [ ] Enable firewall rules for database access
- [ ] Set up SSL/TLS for database connections
- [ ] Use strong passwords for MySQL and MongoDB
- [ ] Enable authentication for MongoDB
- [ ] Regular database backups
- [ ] Use environment variables for all sensitive data

## Support

If you encounter issues:

1. Check this guide first
2. Review error messages in console
3. Check logs in \`.env.local\` configuration
4. Ensure all services are running
5. Try resetting databases and re-importing schema

For additional help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MongoDB Documentation](https://docs.mongodb.com/)
