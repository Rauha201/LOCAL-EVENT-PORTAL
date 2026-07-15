/*-- =====================================================
--  Local Event Portal — Database Schema (Part 1)
-- =====================================================
--  Run this whole file once in MySQL Workbench (or the
--  mysql CLI) to create the database and every table the
--  project needs. `events` and `registrations` are created
--  now so the full relational design exists from day one,
--  even though the API routes that write to them arrive in
--  Part 2 and Part 3.
-- =====================================================

CREATE DATABASE IF NOT EXISTS local_event_portal;
USE local_event_portal;

-- ---------------------------------------------------
-- USERS — people who browse and register for events
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id     INT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,       -- bcrypt hash, never plain text
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------
-- MANAGERS — people who create and manage events
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS managers (
  manager_id  INT AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------
-- EVENTS — one manager owns many events (1:N)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  event_id          INT AUTO_INCREMENT PRIMARY KEY,
  manager_id        INT NOT NULL,
  title             VARCHAR(150) NOT NULL,
  description       TEXT,
  category          ENUM('Concert','Meetup','Workshop','Sports','Festival') NOT NULL,
  event_date        DATE NOT NULL,
  event_time        TIME NOT NULL,
  location          VARCHAR(200) NOT NULL,
  organizer         VARCHAR(150) NOT NULL,
  ticket_price      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image             VARCHAR(255),
  max_participants  INT NOT NULL DEFAULT 50,
  rating            DECIMAL(2,1) DEFAULT 0.0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES managers(manager_id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- REGISTRATIONS — join table between users & events (M:N)
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  registration_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  event_id         INT NOT NULL,
  payment_status   ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  registered_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (user_id, event_id)  -- can't book the same event twice
);
