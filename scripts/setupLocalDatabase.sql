-- TinderClone Local Database Setup
-- Run this script to create the local database and tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tinderClone_local;
USE tinderClone_local;

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'others'),
    about TEXT,
    photo VARCHAR(500) DEFAULT 'https://www.w3schools.com/howto/img_avatar.png',
    skills JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_gender (gender)
);

-- Create connection_requests table
CREATE TABLE IF NOT EXISTS connection_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fromUserId INT NOT NULL,
    toUserId INT NOT NULL,
    fromUserName VARCHAR(255),
    toUserName VARCHAR(255),
    status ENUM('ignore', 'accepted', 'rejected', 'interested') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (fromUserId, toUserId),
    INDEX idx_status (status),
    INDEX idx_from_user (fromUserId),
    INDEX idx_to_user (toUserId)
);

-- Insert sample data for development
INSERT INTO users (firstName, lastName, email, password, age, gender, about, photo) VALUES
('John', 'Doe', 'john@example.com', '$2b$10$hashedpassword', 25, 'male', 'I love coding and hiking', 'https://example.com/john.jpg'),
('Jane', 'Smith', 'jane@example.com', '$2b$10$hashedpassword', 23, 'female', 'Passionate about art and music', 'https://example.com/jane.jpg'),
('Alex', 'Johnson', 'alex@example.com', '$2b$10$hashedpassword', 28, 'others', 'Tech enthusiast and coffee lover', 'https://example.com/alex.jpg')
ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP;

-- Insert sample connection requests
INSERT INTO connection_requests (fromUserId, toUserId, fromUserName, toUserName, status) VALUES
(1, 2, 'John', 'Jane', 'interested'),
(2, 3, 'Jane', 'Alex', 'accepted'),
(3, 1, 'Alex', 'John', 'rejected')
ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP;

-- Show created tables
SHOW TABLES;

-- Show sample data
SELECT 'Users:' as table_name;
SELECT id, firstName, lastName, email, gender, age FROM users;

SELECT 'Connection Requests:' as table_name;
SELECT cr.id, u1.firstName as fromUser, u2.firstName as toUser, cr.status 
FROM connection_requests cr 
JOIN users u1 ON cr.fromUserId = u1.id 
JOIN users u2 ON cr.toUserId = u2.id; 