-- BookYourShow Database Schema (Corrected)

CREATE DATABASE IF NOT EXISTS bookyourshow_db;
USE bookyourshow_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'customer') DEFAULT 'customer'
);

-- Theaters Table
CREATE TABLE IF NOT EXISTS theaters (
  theater_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255)
);

-- Screens Table
CREATE TABLE IF NOT EXISTS screens (
  screen_id INT AUTO_INCREMENT PRIMARY KEY,
  theater_id INT,
  screen_name VARCHAR(50),
  total_seats INT,
  FOREIGN KEY (theater_id) REFERENCES theaters(theater_id)
);

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  genre VARCHAR(50),
  duration INT,
  rating DECIMAL(2,1),
  release_date DATE
);

-- Shows Table
CREATE TABLE IF NOT EXISTS shows (
  show_id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT,
  screen_id INT,
  show_time DATETIME,
  price DECIMAL(8,2),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (screen_id) REFERENCES screens(screen_id)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  show_id INT,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(8,2),
  status ENUM('confirmed','cancelled') DEFAULT 'confirmed',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (show_id) REFERENCES shows(show_id)
);

-- Booking Details Table
CREATE TABLE IF NOT EXISTS booking_details (
  booking_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  seat_number VARCHAR(10),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  amount DECIMAL(8,2),
  payment_mode ENUM('online','offline'),
  payment_status ENUM('success','failed') DEFAULT 'success',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Cancellations Log Table
CREATE TABLE IF NOT EXISTS cancellations_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  user_id INT,
  cancel_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255)
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  log_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  booking_id INT,
  activity_type VARCHAR(50),
  details VARCHAR(255)
);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS total_seats_booked;
DROP FUNCTION IF EXISTS theater_total_revenue;
DROP FUNCTION IF EXISTS movie_total_bookings;

-- Function: total_seats_booked
DELIMITER //
CREATE FUNCTION total_seats_booked(p_show_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total
  FROM bookings b
  JOIN booking_details bd ON b.booking_id = bd.booking_id
  WHERE b.show_id = p_show_id AND b.status = 'confirmed';
  RETURN total;
END //
DELIMITER ;

-- Function: Get total revenue for a specific theater
DELIMITER //
CREATE FUNCTION theater_total_revenue(p_theater_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE total DECIMAL(10,2);
  SELECT IFNULL(SUM(b.total_amount), 0) INTO total
  FROM bookings b
  JOIN shows sh ON b.show_id = sh.show_id
  JOIN screens sc ON sh.screen_id = sc.screen_id
  WHERE sc.theater_id = p_theater_id AND b.status = 'confirmed';
  RETURN total;
END //
DELIMITER ;

-- Function: Get total bookings for a movie
DELIMITER //
CREATE FUNCTION movie_total_bookings(p_movie_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total
  FROM bookings b
  JOIN shows s ON b.show_id = s.show_id
  WHERE s.movie_id = p_movie_id AND b.status = 'confirmed';
  RETURN total;
END //
DELIMITER ;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_booking_status_after_payment;
DROP TRIGGER IF EXISTS prevent_overbooking;
DROP TRIGGER IF EXISTS log_booking_cancellation;
DROP TRIGGER IF EXISTS log_new_booking;
DROP TRIGGER IF EXISTS log_cancellation_to_activity_log;

-- Trigger: update_booking_status_after_payment
DELIMITER //
CREATE TRIGGER update_booking_status_after_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  IF NEW.payment_status = 'success' THEN
    UPDATE bookings SET status = 'confirmed' WHERE booking_id = NEW.booking_id;
  ELSE
    UPDATE bookings SET status = 'cancelled' WHERE booking_id = NEW.booking_id;
  END IF;
END //
DELIMITER ;

-- Trigger: Prevent Overbooking
DELIMITER //
CREATE TRIGGER prevent_overbooking
BEFORE INSERT ON booking_details
FOR EACH ROW
BEGIN
  DECLARE booked_count INT DEFAULT 0;
  DECLARE seat_limit INT DEFAULT 0;
  DECLARE showid INT;

  SELECT show_id INTO showid FROM bookings WHERE booking_id = NEW.booking_id;
  SELECT COUNT(*) INTO booked_count 
  FROM booking_details bd
  JOIN bookings b ON b.booking_id = bd.booking_id
  WHERE b.show_id = showid AND b.status = 'confirmed';

  SELECT s.total_seats INTO seat_limit
  FROM screens s
  JOIN shows sh ON sh.screen_id = s.screen_id
  WHERE sh.show_id = showid;

  IF booked_count >= seat_limit THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = '❌ No seats available for this show!';
  END IF;
END //
DELIMITER ;

-- Trigger: Log new bookings to activity log
DELIMITER //
CREATE TRIGGER log_new_booking
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  DECLARE movie_title VARCHAR(100);
  
  SELECT m.title INTO movie_title
  FROM movies m
  JOIN shows s ON m.movie_id = s.movie_id
  WHERE s.show_id = NEW.show_id;
  
  INSERT INTO activity_log (user_id, booking_id, activity_type, details)
  VALUES (NEW.user_id, NEW.booking_id, 'NEW_BOOKING', 
          CONCAT('Booked: ', movie_title, '. Amount: $', NEW.total_amount));
END //
DELIMITER ;

-- Trigger: Log booking cancellations (to both tables)
DELIMITER //
CREATE TRIGGER log_booking_cancellation
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  DECLARE movie_title VARCHAR(100);
  
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    SELECT m.title INTO movie_title
    FROM movies m
    JOIN shows s ON m.movie_id = s.movie_id
    WHERE s.show_id = NEW.show_id;
    
    -- Log to cancellations_log
    INSERT INTO cancellations_log (booking_id, user_id, reason)
    VALUES (NEW.booking_id, NEW.user_id, 'User cancelled booking');
    
    -- Log to activity_log
    INSERT INTO activity_log (user_id, booking_id, activity_type, details)
    VALUES (NEW.user_id, NEW.booking_id, 'CANCELLED_BOOKING', 
            CONCAT('Cancelled: ', movie_title));
  END IF;
END //
DELIMITER ;

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS get_full_booking_report;
DROP PROCEDURE IF EXISTS cancel_booking;
DROP PROCEDURE IF EXISTS top_movies_by_revenue;

-- Procedure: Get all bookings with movie, user, and theater details
DELIMITER //
CREATE PROCEDURE get_full_booking_report()
BEGIN
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
  ORDER BY b.booking_date DESC;
END //
DELIMITER ;

-- Procedure: Cancel Booking
DELIMITER //
CREATE PROCEDURE cancel_booking(IN p_booking_id INT)
BEGIN
  UPDATE bookings SET status = 'cancelled' WHERE booking_id = p_booking_id;
END //
DELIMITER ;

-- Procedure: Top 3 movies by revenue
DELIMITER //
CREATE PROCEDURE top_movies_by_revenue()
BEGIN
  SELECT 
    m.title AS Movie,
    COUNT(b.booking_id) AS TotalBookings,
    SUM(b.total_amount) AS Revenue
  FROM bookings b
  JOIN shows s ON b.show_id = s.show_id
  JOIN movies m ON s.movie_id = m.movie_id
  WHERE b.status = 'confirmed'
  GROUP BY m.movie_id
  ORDER BY Revenue DESC
  LIMIT 3;
END //
DELIMITER ;

-- Drop existing views if they exist
DROP VIEW IF EXISTS movie_revenue;
DROP VIEW IF EXISTS customer_booking_summary;
DROP VIEW IF EXISTS theater_revenue_summary;

-- View: movie_revenue
CREATE VIEW movie_revenue AS
SELECT 
  m.title,
  COUNT(b.booking_id) AS total_bookings,
  SUM(b.total_amount) AS total_revenue
FROM movies m
JOIN shows s ON m.movie_id = s.movie_id
JOIN bookings b ON s.show_id = b.show_id
WHERE b.status = 'confirmed'
GROUP BY m.title;

-- View: Customer Booking Summary
CREATE VIEW customer_booking_summary AS
SELECT 
  u.name AS CustomerName,
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
JOIN theaters t ON sc.theater_id = t.theater_id;

-- View: Theater Revenue Summary
CREATE VIEW theater_revenue_summary AS
SELECT 
  t.name AS TheaterName,
  SUM(b.total_amount) AS TotalRevenue,
  COUNT(b.booking_id) AS TotalBookings
FROM bookings b
JOIN shows s ON b.show_id = s.show_id
JOIN screens sc ON s.screen_id = sc.screen_id
JOIN theaters t ON sc.theater_id = t.theater_id
WHERE b.status = 'confirmed'
GROUP BY t.theater_id, t.name;

-- ========================================
-- DATA INSERTION
-- ========================================

-- Insert admin user
INSERT INTO users (name, email, password, role) 
VALUES ('admin', 'admin@bys.com', 'secret', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Insert theaters (REQUIRED for screens to work)
INSERT INTO theaters (theater_id, name, location) VALUES
(1, 'PVR Cinemas', 'Downtown Mall'),
(2, 'INOX', 'Central Plaza'),
(3, 'Cinepolis', 'Westside Complex')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert initial screens for each theater
INSERT INTO screens (theater_id, screen_name, total_seats) VALUES
(1, 'Screen 1', 120),
(1, 'Screen 2', 100),
(2, 'Screen 1', 150),
(3, 'Screen 1', 130),
(3, 'Screen 2', 90)
ON DUPLICATE KEY UPDATE screen_name=VALUES(screen_name);

-- Insert movies
INSERT INTO movies (title, genre, duration, rating, release_date) 
VALUES 
('The Matrix', 'Sci-Fi', 136, 8.7, '1999-03-31'),
('Pulp Fiction', 'Crime', 154, 8.9, '1994-10-14'),
('Forrest Gump', 'Drama', 142, 8.8, '1994-07-06'),
('The Shawshank Redemption', 'Drama', 142, 9.3, '1994-09-23'),
('The Godfather', 'Crime', 175, 9.2, '1972-03-24'),
('Fight Club', 'Drama', 139, 8.8, '1999-10-15'),
('Pokemon', 'Action', 184, 10.0, '2023-07-21'),
('Spider-Man: No Way Home', 'Action', 148, 8.2, '2021-12-17'),
('Avengers: Endgame', 'Action', 181, 8.4, '2019-04-26'),
('Joker', 'Thriller', 122, 8.4, '2019-10-04')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Add 2 new screens to INOX
INSERT INTO screens (theater_id, screen_name, total_seats) VALUES
(2, 'Screen 2', 110),
(2, 'Screen 3', 75)
ON DUPLICATE KEY UPDATE screen_name=VALUES(screen_name);

-- Get movie IDs
SET @matrix_id = (SELECT movie_id FROM movies WHERE title = 'The Matrix');
SET @pulp_id = (SELECT movie_id FROM movies WHERE title = 'Pulp Fiction');
SET @gump_id = (SELECT movie_id FROM movies WHERE title = 'Forrest Gump');
SET @shawshank_id = (SELECT movie_id FROM movies WHERE title = 'The Shawshank Redemption');
SET @godfather_id = (SELECT movie_id FROM movies WHERE title = 'The Godfather');
SET @fightclub_id = (SELECT movie_id FROM movies WHERE title = 'Fight Club');
SET @pokemon_id = (SELECT movie_id FROM movies WHERE title = 'Pokemon');
SET @spiderman_id = (SELECT movie_id FROM movies WHERE title = 'Spider-Man: No Way Home');
SET @avengers_id = (SELECT movie_id FROM movies WHERE title = 'Avengers: Endgame');
SET @joker_id = (SELECT movie_id FROM movies WHERE title = 'Joker');

-- Add shows for movies (future dates)
INSERT INTO shows (movie_id, screen_id, show_time, price) 
VALUES
-- The Matrix (2 shows)
(@matrix_id, 1, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 350.00),
(@matrix_id, 3, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 18 HOUR, 380.00),

-- Pulp Fiction (1 show)
(@pulp_id, 4, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, 375.00),

-- Forrest Gump (3 shows)
(@gump_id, 2, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 360.00),
(@gump_id, 5, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 17 HOUR, 370.00),
(@gump_id, 6, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 390.00),

-- The Shawshank Redemption (2 shows)
(@shawshank_id, 7, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 15 HOUR, 400.00),
(@shawshank_id, 1, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 19 HOUR, 350.00),

-- The Godfather (1 show)
(@godfather_id, 3, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 18 HOUR, 420.00),

-- Fight Club (2 shows)
(@fightclub_id, 4, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR, 380.00),
(@fightclub_id, 6, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 20 HOUR, 390.00),

-- Pokemon (3 shows)
(@pokemon_id, 1, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR, 400.00),
(@pokemon_id, 3, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 15 HOUR, 400.00),
(@pokemon_id, 5, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 410.00),

-- Spider-Man: No Way Home (3 shows)
(@spiderman_id, 2, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 450.00),
(@spiderman_id, 6, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 18 HOUR, 460.00),
(@spiderman_id, 7, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 14 HOUR, 460.00),

-- Avengers: Endgame (2 shows)
(@avengers_id, 4, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR, 480.00),
(@avengers_id, 5, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 14 HOUR, 480.00),

-- Joker (2 shows)
(@joker_id, 1, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 18 HOUR, 430.00),
(@joker_id, 3, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 21 HOUR, 440.00);

SELECT 'Database setup completed successfully!' AS Result;
SELECT 'Added 10 movies, 3 theaters, 7 screens, and 23 shows!' AS Summary;

-- ========================================
-- BOOKYOURSHOW - COMPREHENSIVE DATA POPULATION
-- ========================================

USE bookyourshow_db;

-- ========================================
-- 1. ADD MORE USERS (Customers)
-- ========================================

INSERT INTO users (name, email, password, role) VALUES
('Rajesh Kumar', 'rajesh.k@email.com', 'pass123', 'customer'),
('Priya Sharma', 'priya.sharma@email.com', 'pass123', 'customer'),
('Amit Patel', 'amit.patel@email.com', 'pass123', 'customer'),
('Sneha Reddy', 'sneha.r@email.com', 'pass123', 'customer'),
('Vikram Singh', 'vikram.singh@email.com', 'pass123', 'customer'),
('Anjali Mehta', 'anjali.mehta@email.com', 'pass123', 'customer'),
('Rahul Verma', 'rahul.v@email.com', 'pass123', 'customer'),
('Deepika Iyer', 'deepika.iyer@email.com', 'pass123', 'customer'),
('Arjun Nair', 'arjun.nair@email.com', 'pass123', 'customer'),
('Kavya Desai', 'kavya.desai@email.com', 'pass123', 'customer'),
('Sanjay Gupta', 'sanjay.g@email.com', 'pass123', 'customer'),
('Pooja Joshi', 'pooja.joshi@email.com', 'pass123', 'customer'),
('Karthik Rao', 'karthik.rao@email.com', 'pass123', 'customer'),
('Nisha Kapoor', 'nisha.kapoor@email.com', 'pass123', 'customer'),
('Rohit Malhotra', 'rohit.m@email.com', 'pass123', 'customer')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ========================================
-- 2. ADD MORE THEATERS
-- ========================================

INSERT INTO theaters (name, location) VALUES
('Carnival Cinemas', 'Phoenix Mall, Anna Nagar'),
('AGS Cinemas', 'T Nagar, Chennai'),
('Sathyam Cinemas', 'Royapettah, Chennai'),
('Escape Cinemas', 'Express Avenue Mall'),
('Mayajaal Multiplex', 'ECR, Chennai')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ========================================
-- 3. ADD MORE SCREENS TO EXISTING THEATERS
-- ========================================

-- Get theater IDs
SET @carnival_id = (SELECT theater_id FROM theaters WHERE name = 'Carnival Cinemas');
SET @ags_id = (SELECT theater_id FROM theaters WHERE name = 'AGS Cinemas');
SET @sathyam_id = (SELECT theater_id FROM theaters WHERE name = 'Sathyam Cinemas');
SET @escape_id = (SELECT theater_id FROM theaters WHERE name = 'Escape Cinemas');
SET @mayajaal_id = (SELECT theater_id FROM theaters WHERE name = 'Mayajaal Multiplex');

INSERT INTO screens (theater_id, screen_name, total_seats) VALUES
-- Carnival Cinemas
(@carnival_id, 'Screen 1', 180),
(@carnival_id, 'Screen 2', 150),
(@carnival_id, 'Screen 3', 120),
-- AGS Cinemas
(@ags_id, 'Audi 1', 200),
(@ags_id, 'Audi 2', 160),
-- Sathyam Cinemas
(@sathyam_id, 'Screen 1', 220),
(@sathyam_id, 'Screen 2', 180),
(@sathyam_id, 'Screen 3', 140),
-- Escape Cinemas
(@escape_id, 'Hall 1', 190),
(@escape_id, 'Hall 2', 150),
-- Mayajaal Multiplex
(@mayajaal_id, 'Theatre 1', 250),
(@mayajaal_id, 'Theatre 2', 200),
(@mayajaal_id, 'Theatre 3', 170)
ON DUPLICATE KEY UPDATE screen_name=VALUES(screen_name);

-- ========================================
-- 4. ADD MORE MOVIES (Recent & Popular)
-- ========================================

INSERT INTO movies (title, genre, duration, rating, release_date) VALUES
('Inception', 'Sci-Fi', 148, 8.8, '2010-07-16'),
('The Dark Knight', 'Action', 152, 9.0, '2008-07-18'),
('Interstellar', 'Sci-Fi', 169, 8.6, '2014-11-07'),
('Parasite', 'Thriller', 132, 8.5, '2019-05-30'),
('Dangal', 'Drama', 161, 8.3, '2016-12-23'),
('3 Idiots', 'Comedy', 170, 8.4, '2009-12-25'),
('Bahubali 2', 'Action', 167, 8.2, '2017-04-28'),
('RRR', 'Action', 187, 8.0, '2022-03-25'),
('KGF Chapter 2', 'Action', 168, 8.3, '2022-04-14'),
('Pathaan', 'Action', 146, 7.8, '2023-01-25'),
('Jawan', 'Action', 169, 7.2, '2023-09-07'),
('Animal', 'Thriller', 201, 7.1, '2023-12-01'),
('Dunki', 'Drama', 161, 6.9, '2023-12-21'),
('Salaar', 'Action', 175, 7.3, '2023-12-22'),
('Fighter', 'Action', 166, 7.5, '2024-01-25')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ========================================
-- 5. ADD SHOWS FOR ALL MOVIES
-- ========================================

-- Get all movie IDs
SET @inception_id = (SELECT movie_id FROM movies WHERE title = 'Inception');
SET @dark_knight_id = (SELECT movie_id FROM movies WHERE title = 'The Dark Knight');
SET @interstellar_id = (SELECT movie_id FROM movies WHERE title = 'Interstellar');
SET @parasite_id = (SELECT movie_id FROM movies WHERE title = 'Parasite');
SET @dangal_id = (SELECT movie_id FROM movies WHERE title = 'Dangal');
SET @3idiots_id = (SELECT movie_id FROM movies WHERE title = '3 Idiots');
SET @bahubali_id = (SELECT movie_id FROM movies WHERE title = 'Bahubali 2');
SET @rrr_id = (SELECT movie_id FROM movies WHERE title = 'RRR');
SET @kgf_id = (SELECT movie_id FROM movies WHERE title = 'KGF Chapter 2');
SET @pathaan_id = (SELECT movie_id FROM movies WHERE title = 'Pathaan');
SET @jawan_id = (SELECT movie_id FROM movies WHERE title = 'Jawan');
SET @animal_id = (SELECT movie_id FROM movies WHERE title = 'Animal');
SET @dunki_id = (SELECT movie_id FROM movies WHERE title = 'Dunki');
SET @salaar_id = (SELECT movie_id FROM movies WHERE title = 'Salaar');
SET @fighter_id = (SELECT movie_id FROM movies WHERE title = 'Fighter');

-- Get screen IDs (assuming we now have many screens)
SET @pvr_screen1 = 1;
SET @pvr_screen2 = 2;
SET @inox_screen1 = 3;
SET @inox_screen2 = 6;
SET @inox_screen3 = 7;
SET @cinepolis_screen1 = 4;
SET @cinepolis_screen2 = 5;

-- Add diverse shows across different times and theaters
INSERT INTO shows (movie_id, screen_id, show_time, price) VALUES
-- Inception shows
(@inception_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 10 HOUR, 280.00),
(@inception_id, @inox_screen1, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 300.00),
(@inception_id, @cinepolis_screen1, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 18 HOUR, 320.00),
(@inception_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 21 HOUR, 280.00),

-- The Dark Knight shows
(@dark_knight_id, @inox_screen2, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 11 HOUR, 350.00),
(@dark_knight_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 15 HOUR, 340.00),
(@dark_knight_id, @cinepolis_screen2, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 19 HOUR, 360.00),

-- Interstellar shows
(@interstellar_id, @inox_screen3, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 12 HOUR, 380.00),
(@interstellar_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 16 HOUR, 370.00),
(@interstellar_id, @cinepolis_screen1, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 20 HOUR, 390.00),

-- Parasite shows
(@parasite_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 250.00),
(@parasite_id, @inox_screen1, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 17 HOUR, 260.00),

-- Dangal shows
(@dangal_id, @inox_screen2, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 10 HOUR, 220.00),
(@dangal_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 2 DAY) + INTERVAL 14 HOUR, 230.00),
(@dangal_id, @cinepolis_screen2, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 18 HOUR, 240.00),

-- 3 Idiots shows
(@3idiots_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 11 HOUR, 200.00),
(@3idiots_id, @inox_screen3, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 15 HOUR, 210.00),

-- Bahubali 2 shows
(@bahubali_id, @inox_screen1, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 12 HOUR, 450.00),
(@bahubali_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 16 HOUR, 440.00),
(@bahubali_id, @cinepolis_screen1, DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 20 HOUR, 460.00),

-- RRR shows
(@rrr_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, 500.00),
(@rrr_id, @inox_screen2, DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 17 HOUR, 510.00),
(@rrr_id, @cinepolis_screen2, DATE_ADD(NOW(), INTERVAL 4 DAY) + INTERVAL 21 HOUR, 520.00),

-- KGF Chapter 2 shows
(@kgf_id, @inox_screen3, DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 10 HOUR, 480.00),
(@kgf_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 14 HOUR, 470.00),
(@kgf_id, @cinepolis_screen1, DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 18 HOUR, 490.00),

-- Pathaan shows
(@pathaan_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 12 HOUR, 420.00),
(@pathaan_id, @inox_screen1, DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 16 HOUR, 430.00),

-- Jawan shows
(@jawan_id, @inox_screen2, DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 11 HOUR, 440.00),
(@jawan_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 15 HOUR, 450.00),
(@jawan_id, @cinepolis_screen2, DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 19 HOUR, 460.00),

-- Animal shows
(@animal_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 13 HOUR, 400.00),
(@animal_id, @inox_screen3, DATE_ADD(NOW(), INTERVAL 6 DAY) + INTERVAL 17 HOUR, 410.00),

-- Dunki shows
(@dunki_id, @inox_screen1, DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 10 HOUR, 380.00),
(@dunki_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 14 HOUR, 390.00),

-- Salaar shows
(@salaar_id, @pvr_screen1, DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 12 HOUR, 470.00),
(@salaar_id, @inox_screen2, DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 16 HOUR, 480.00),
(@salaar_id, @cinepolis_screen1, DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 20 HOUR, 490.00),

-- Fighter shows
(@fighter_id, @inox_screen3, DATE_ADD(NOW(), INTERVAL 8 DAY) + INTERVAL 11 HOUR, 450.00),
(@fighter_id, @pvr_screen2, DATE_ADD(NOW(), INTERVAL 8 DAY) + INTERVAL 15 HOUR, 460.00),
(@fighter_id, @cinepolis_screen2, DATE_ADD(NOW(), INTERVAL 8 DAY) + INTERVAL 19 HOUR, 470.00);

-- ========================================
-- 6. ADD SAMPLE BOOKINGS
-- ========================================

-- Get user IDs
SET @user1 = (SELECT user_id FROM users WHERE email = 'rajesh.k@email.com');
SET @user2 = (SELECT user_id FROM users WHERE email = 'priya.sharma@email.com');
SET @user3 = (SELECT user_id FROM users WHERE email = 'amit.patel@email.com');
SET @user4 = (SELECT user_id FROM users WHERE email = 'sneha.r@email.com');
SET @user5 = (SELECT user_id FROM users WHERE email = 'vikram.singh@email.com');
SET @user6 = (SELECT user_id FROM users WHERE email = 'anjali.mehta@email.com');
SET @user7 = (SELECT user_id FROM users WHERE email = 'rahul.v@email.com');
SET @user8 = (SELECT user_id FROM users WHERE email = 'deepika.iyer@email.com');

-- Get some show IDs (we'll use the first few shows)
SET @show1 = (SELECT show_id FROM shows WHERE movie_id = @inception_id LIMIT 1);
SET @show2 = (SELECT show_id FROM shows WHERE movie_id = @dark_knight_id LIMIT 1);
SET @show3 = (SELECT show_id FROM shows WHERE movie_id = @rrr_id LIMIT 1);
SET @show4 = (SELECT show_id FROM shows WHERE movie_id = @kgf_id LIMIT 1);
SET @show5 = (SELECT show_id FROM shows WHERE movie_id = @pathaan_id LIMIT 1);

-- Add bookings with realistic amounts (price × number of seats)
INSERT INTO bookings (user_id, show_id, booking_date, total_amount, status) VALUES
(@user1, @show1, DATE_SUB(NOW(), INTERVAL 5 DAY), 840.00, 'confirmed'),  -- 3 seats × 280
(@user2, @show1, DATE_SUB(NOW(), INTERVAL 4 DAY), 560.00, 'confirmed'),  -- 2 seats × 280
(@user3, @show2, DATE_SUB(NOW(), INTERVAL 3 DAY), 1400.00, 'confirmed'), -- 4 seats × 350
(@user4, @show2, DATE_SUB(NOW(), INTERVAL 3 DAY), 700.00, 'cancelled'),  -- 2 seats × 350
(@user5, @show3, DATE_SUB(NOW(), INTERVAL 2 DAY), 2500.00, 'confirmed'), -- 5 seats × 500
(@user6, @show3, DATE_SUB(NOW(), INTERVAL 2 DAY), 1000.00, 'confirmed'), -- 2 seats × 500
(@user7, @show4, DATE_SUB(NOW(), INTERVAL 1 DAY), 960.00, 'confirmed'),  -- 2 seats × 480
(@user8, @show5, DATE_SUB(NOW(), INTERVAL 1 DAY), 1260.00, 'confirmed'), -- 3 seats × 420
(@user1, @show4, DATE_SUB(NOW(), INTERVAL 1 DAY), 1440.00, 'confirmed'), -- 3 seats × 480
(@user2, @show5, NOW(), 840.00, 'confirmed');                             -- 2 seats × 420

-- ========================================
-- 7. ADD BOOKING DETAILS (Seat Numbers)
-- ========================================

-- Get booking IDs
SET @booking1 = (SELECT booking_id FROM bookings WHERE user_id = @user1 AND show_id = @show1 LIMIT 1);
SET @booking2 = (SELECT booking_id FROM bookings WHERE user_id = @user2 AND show_id = @show1 LIMIT 1);
SET @booking3 = (SELECT booking_id FROM bookings WHERE user_id = @user3 AND show_id = @show2 LIMIT 1);
SET @booking4 = (SELECT booking_id FROM bookings WHERE user_id = @user4 AND show_id = @show2 LIMIT 1);
SET @booking5 = (SELECT booking_id FROM bookings WHERE user_id = @user5 AND show_id = @show3 LIMIT 1);
SET @booking6 = (SELECT booking_id FROM bookings WHERE user_id = @user6 AND show_id = @show3 LIMIT 1);
SET @booking7 = (SELECT booking_id FROM bookings WHERE user_id = @user7 AND show_id = @show4 LIMIT 1);
SET @booking8 = (SELECT booking_id FROM bookings WHERE user_id = @user8 AND show_id = @show5 LIMIT 1);

-- Add seat numbers
INSERT INTO booking_details (booking_id, seat_number) VALUES
-- Booking 1: 3 seats
(@booking1, 'A1'), (@booking1, 'A2'), (@booking1, 'A3'),
-- Booking 2: 2 seats
(@booking2, 'B1'), (@booking2, 'B2'),
-- Booking 3: 4 seats
(@booking3, 'C1'), (@booking3, 'C2'), (@booking3, 'C3'), (@booking3, 'C4'),
-- Booking 4: 2 seats (cancelled)
(@booking4, 'D1'), (@booking4, 'D2'),
-- Booking 5: 5 seats
(@booking5, 'E1'), (@booking5, 'E2'), (@booking5, 'E3'), (@booking5, 'E4'), (@booking5, 'E5'),
-- Booking 6: 2 seats
(@booking6, 'F1'), (@booking6, 'F2'),
-- Booking 7: 2 seats
(@booking7, 'G1'), (@booking7, 'G2'),
-- Booking 8: 3 seats
(@booking8, 'H1'), (@booking8, 'H2'), (@booking8, 'H3');

-- ========================================
-- 8. ADD PAYMENT RECORDS
-- ========================================

INSERT INTO payments (booking_id, amount, payment_mode, payment_status, payment_date) VALUES
(@booking1, 840.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@booking2, 560.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(@booking3, 1400.00, 'offline', 'success', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(@booking4, 700.00, 'online', 'failed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(@booking5, 2500.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@booking6, 1000.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@booking7, 960.00, 'offline', 'success', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@booking8, 1260.00, 'online', 'success', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================

SELECT '=== DATABASE SUMMARY ===' AS Info;

SELECT COUNT(*) AS TotalUsers FROM users;
SELECT COUNT(*) AS TotalTheaters FROM theaters;
SELECT COUNT(*) AS TotalScreens FROM screens;
SELECT COUNT(*) AS TotalMovies FROM movies;
SELECT COUNT(*) AS TotalShows FROM shows;
SELECT COUNT(*) AS TotalBookings FROM bookings;
SELECT COUNT(*) AS TotalPayments FROM payments;

SELECT '=== SAMPLE DATA ===' AS Info;

-- Show theaters with screen counts
SELECT t.name AS Theater, t.location, COUNT(s.screen_id) AS TotalScreens
FROM theaters t
LEFT JOIN screens s ON t.theater_id = s.theater_id
GROUP BY t.theater_id
ORDER BY t.name;

-- Show movies with show counts
SELECT m.title AS Movie, m.genre, m.rating, COUNT(s.show_id) AS TotalShows
FROM movies m
LEFT JOIN shows s ON m.movie_id = s.movie_id
GROUP BY m.movie_id
ORDER BY TotalShows DESC
LIMIT 10;

-- Show recent bookings
SELECT 
    u.name AS Customer,
    m.title AS Movie,
    t.name AS Theater,
    b.total_amount AS Amount,
    b.status AS Status,
    COUNT(bd.seat_number) AS Seats
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN shows s ON b.show_id = s.show_id
JOIN movies m ON s.movie_id = m.movie_id
JOIN screens sc ON s.screen_id = sc.screen_id
JOIN theaters t ON sc.theater_id = t.theater_id
LEFT JOIN booking_details bd ON b.booking_id = bd.booking_id
GROUP BY b.booking_id
ORDER BY b.booking_date DESC
LIMIT 10;

-- Show revenue summary
SELECT 
    SUM(total_amount) AS TotalRevenue,
    COUNT(*) AS TotalBookings,
    AVG(total_amount) AS AvgBookingAmount
FROM bookings
WHERE status = 'confirmed';

SELECT '=== DATA POPULATION COMPLETE ===' AS Status;