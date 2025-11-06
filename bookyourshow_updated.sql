
-- BookYourShow Database Schema

CREATE DATABASE IF NOT EXISTS bookyourshow_db;
USE bookyourshow_db;

-- Users Table
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'customer') DEFAULT 'customer'
);

-- Theaters Table
CREATE TABLE theaters (
  theater_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255)
);

-- Screens Table
CREATE TABLE screens (
  screen_id INT AUTO_INCREMENT PRIMARY KEY,
  theater_id INT,
  screen_name VARCHAR(50),
  total_seats INT,
  FOREIGN KEY (theater_id) REFERENCES theaters(theater_id)
);

-- Movies Table
CREATE TABLE movies (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  genre VARCHAR(50),
  duration INT,
  rating DECIMAL(2,1),
  release_date DATE
);

-- Shows Table
CREATE TABLE shows (
  show_id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT,
  screen_id INT,
  show_time DATETIME,
  price DECIMAL(8,2),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
  FOREIGN KEY (screen_id) REFERENCES screens(screen_id)
);

-- Bookings Table
CREATE TABLE bookings (
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
CREATE TABLE booking_details (
  booking_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  seat_number VARCHAR(10),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Payments Table
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  amount DECIMAL(8,2),
  payment_mode ENUM('online','offline'),
  payment_status ENUM('success','failed') DEFAULT 'success',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Function: total_seats_booked
DELIMITER //
CREATE FUNCTION total_seats_booked(p_show_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total
  FROM bookings b
  JOIN booking_details bd ON b.booking_id = bd.booking_id
  WHERE b.show_id = p_show_id AND b.status = 'confirmed';
  RETURN total;
END //
DELIMITER ;


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


-- TRIGGER: Prevent Overbooking (Before inserting booking detail)
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
END;
//
DELIMITER ;

-- TRIGGER: Log cancellations in a separate audit table
CREATE TABLE IF NOT EXISTS cancellations_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  user_id INT,
  cancel_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(255)
);

DELIMITER //
CREATE TRIGGER log_booking_cancellation
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    INSERT INTO cancellations_log (booking_id, user_id, reason)
    VALUES (NEW.booking_id, NEW.user_id, 'User cancelled booking');
  END IF;
END;
//
DELIMITER ;



-- FUNCTION: Get total revenue for a specific theater
DELIMITER //
CREATE FUNCTION theater_total_revenue(p_theater_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  DECLARE total DECIMAL(10,2);
  SELECT IFNULL(SUM(b.total_amount), 0) INTO total
  FROM bookings b
  JOIN shows sh ON b.show_id = sh.show_id
  JOIN screens sc ON sh.screen_id = sc.screen_id
  WHERE sc.theater_id = p_theater_id AND b.status = 'confirmed';
  RETURN total;
END;
//
DELIMITER ;

-- FUNCTION: Get total bookings for a movie
DELIMITER //
CREATE FUNCTION movie_total_bookings(p_movie_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total
  FROM bookings b
  JOIN shows s ON b.show_id = s.show_id
  WHERE s.movie_id = p_movie_id AND b.status = 'confirmed';
  RETURN total;
END;
//
DELIMITER ;


-- PROCEDURE: Get all bookings with movie, user, and theater details (JOIN)
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
END;
//
DELIMITER ;

-- PROCEDURE: Cancel Booking (updates booking + logs trigger)
DELIMITER //
CREATE PROCEDURE cancel_booking(IN p_booking_id INT)
BEGIN
  UPDATE bookings SET status = 'cancelled' WHERE booking_id = p_booking_id;
END;
//
DELIMITER ;

-- PROCEDURE: Top 3 movies by revenue
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
END;
//
DELIMITER ;

-- View: Customer Booking Summary
CREATE OR REPLACE VIEW customer_booking_summary AS
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
CREATE OR REPLACE VIEW theater_revenue_summary AS
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

-- Get all customer booking summaries
SELECT * FROM customer_booking_summary;

-- Get theater revenue summaries
SELECT * FROM theater_revenue_summary;

-- Get top movies by revenue
CALL top_movies_by_revenue();

-- Get full detailed booking report
CALL get_full_booking_report();





-- Step 1: Create the new unified log table
CREATE TABLE IF NOT EXISTS activity_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  log_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  booking_id INT,
  activity_type VARCHAR(50), -- e.g., 'NEW_BOOKING', 'CANCELLED_BOOKING'
  details VARCHAR(255)
);

-- updated

-- This trigger now finds the movie title before logging
DELIMITER //
CREATE TRIGGER log_new_booking
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  DECLARE movie_title VARCHAR(100);
  
  -- Find the movie title
  SELECT m.title INTO movie_title
  FROM movies m
  JOIN shows s ON m.movie_id = s.movie_id
  WHERE s.show_id = NEW.show_id;
  
  INSERT INTO activity_log (user_id, booking_id, activity_type, details)
  VALUES (NEW.user_id, NEW.booking_id, 'NEW_BOOKING', 
          CONCAT('Booked: ', movie_title, '. Amount: $', NEW.total_amount));
END;
//
DELIMITER ;

-- This trigger also finds the movie title before logging
DELIMITER //
CREATE TRIGGER log_cancellation_to_activity_log
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  DECLARE movie_title VARCHAR(100);
  
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    -- Find the movie title
    SELECT m.title INTO movie_title
    FROM movies m
    JOIN shows s ON m.movie_id = s.movie_id
    WHERE s.show_id = NEW.show_id;
    
    INSERT INTO activity_log (user_id, booking_id, activity_type, details)
    VALUES (NEW.user_id, NEW.booking_id, 'CANCELLED_BOOKING', 
            CONCAT('Cancelled: ', movie_title));
  END IF;
END;
//
DELIMITER ;


-- inserting admin id

INSERT INTO users (name, email, password, role) 
VALUES 
('admin', 'admin@bys.com', 'secret', 'admin');



-- inserting movies vals:
USE bookyourshow_db;

-- Step 1: Add 10 new movies
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
('Joker', 'Thriller', 122, 8.4, '2019-10-04');

-- Step 2: Add 2 new screens to INOX (Theater ID 2)
-- (This assumes PVR is ID 1, INOX is ID 2, Cinepolis is ID 3)
INSERT INTO screens (theater_id, screen_name, total_seats) VALUES
(2, 'Screen 2', 110), -- INOX Screen 2
(2, 'Screen 3', 75);  -- INOX Screen 3
-- This creates screen_id 6 and 7 (assuming 1-5 already exist)

-- Step 3: Get all the new movie IDs
SET @matrix_id = (SELECT movie_id FROM movies WHERE title = 'The Matrix');
SET @pulp_id = (SELECT movie_id FROM movies WHERE title = 'Pulp Fiction');
SET @gump_id = (SELECT movie_id FROM movies WHERE title = 'Forrest Gump');
SET @shawshank_id = (SELECT movie_id FROM movies WHERE title = 'The Shawshank Redemption');
SET @godfather_id = (SELECT movie_id FROM movies WHERE title = 'The Godfather');
SET @fightclub_id = (SELECT movie_id FROM movies WHERE title = 'Fight Club');
SET @pokemon_id = (SELECT movie_id FROM movies WHERE title = 'Pokemon X');
SET @spiderman_id = (SELECT movie_id FROM movies WHERE title = 'Spider-Man: No Way Home');
SET @avengers_id = (SELECT movie_id FROM movies WHERE title = 'Avengers: Endgame');
SET @joker_id = (SELECT movie_id FROM movies WHERE title = 'Joker');

-- Step 4: Add 1-3 shows for each new movie, set in the FUTURE
-- (Assumes screen IDs 1-7 are now available)
INSERT INTO shows (movie_id, screen_id, show_time, price) 
VALUES
-- 'The Matrix' (2 shows)
(@matrix_id, 1, NOW() + INTERVAL 1 DAY + INTERVAL 14 HOUR, 350.00), -- Screen 1 (PVR)
(@matrix_id, 3, NOW() + INTERVAL 1 DAY + INTERVAL 18 HOUR, 380.00), -- Screen 3 (INOX)

-- 'Pulp Fiction' (1 show)
(@pulp_id, 4, NOW() + INTERVAL 1 DAY + INTERVAL 20 HOUR, 375.00), -- Screen 4 (Cinepolis)

-- 'Forrest Gump' (3 shows)
(@gump_id, 2, NOW() + INTERVAL 1 DAY + INTERVAL 13 HOUR, 360.00), -- Screen 2 (PVR)
(@gump_id, 5, NOW() + INTERVAL 1 DAY + INTERVAL 17 HOUR, 370.00), -- Screen 5 (Cinepolis)
(@gump_id, 6, NOW() + INTERVAL 2 DAY + INTERVAL 13 HOUR, 390.00), -- Screen 6 (INOX)

-- 'The Shawshank Redemption' (2 shows)
(@shawshank_id, 7, NOW() + INTERVAL 2 DAY + INTERVAL 15 HOUR, 400.00), -- Screen 7 (INOX)
(@shawshank_id, 1, NOW() + INTERVAL 2 DAY + INTERVAL 19 HOUR, 350.00), -- Screen 1 (PVR)

-- 'The Godfather' (1 show)
(@godfather_id, 3, NOW() + INTERVAL 2 DAY + INTERVAL 18 HOUR, 420.00), -- Screen 3 (INOX)

-- 'Fight Club' (2 shows)
(@fightclub_id, 4, NOW() + INTERVAL 3 DAY + INTERVAL 16 HOUR, 380.00), -- Screen 4 (Cinepolis)
(@fightclub_id, 6, NOW() + INTERVAL 3 DAY + INTERVAL 20 HOUR, 390.00), -- Screen 6 (INOX)

-- 'pokemon' (3 shows)
(@pokemon_id, 1, NOW() + INTERVAL 1 DAY + INTERVAL 12 HOUR, 400.00), -- Screen 1 (PVR)
(@pokemon_id, 3, NOW() + INTERVAL 1 DAY + INTERVAL 15 HOUR, 400.00), -- Screen 3 (INOX)
(@pokemon_id, 5, NOW() + INTERVAL 1 DAY + INTERVAL 19 HOUR, 410.00), -- Screen 5 (Cinepolis)

-- 'Spider-Man: No Way Home' (3 shows)
(@spiderman_id, 2, NOW() + INTERVAL 1 DAY + INTERVAL 14 HOUR, 450.00), -- Screen 2 (PVR)
(@spiderman_id, 6, NOW() + INTERVAL 1 DAY + INTERVAL 18 HOUR, 460.00), -- Screen 6 (INOX)
(@spiderman_id, 7, NOW() + INTERVAL 2 DAY + INTERVAL 14 HOUR, 460.00), -- Screen 7 (INOX)

-- 'Avengers: Endgame' (2 shows)
(@avengers_id, 4, NOW() + INTERVAL 2 DAY + INTERVAL 10 HOUR, 480.00), -- Screen 4 (Cinepolis)
(@avengers_id, 5, NOW() + INTERVAL 2 DAY + INTERVAL 14 HOUR, 480.00), -- Screen 5 (Cinepolis)

-- 'Joker' (2 shows)
(@joker_id, 1, NOW() + INTERVAL 3 DAY + INTERVAL 18 HOUR, 430.00), -- Screen 1 (PVR)
(@joker_id, 3, NOW() + INTERVAL 3 DAY + INTERVAL 21 HOUR, 440.00); -- Screen 3 (INOX)

SELECT 'Successfully added 10 new movies, 2 new screens, and 23 new shows!' AS Result;







