-- =============================================================================
-- SmartMail AI Database Schema
-- Database: smartmail_db
-- DBMS: MySQL 8.x
-- =============================================================================

CREATE DATABASE IF NOT EXISTS smartmail_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smartmail_db;

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email CHECK (email LIKE '%_@__%.__%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: email_generations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_generations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_content LONGTEXT NOT NULL,
    generated_content LONGTEXT NOT NULL,
    generation_type VARCHAR(30) NOT NULL, -- 'REPLY' or 'SUMMARY'
    tone VARCHAR(30) NULL,               -- 'Professional', 'Formal', 'Friendly', etc.
    response_length VARCHAR(30) NULL,    -- 'Short', 'Medium', 'Detailed'
    metadata_json TEXT NULL,             -- JSON string for points, action items, deadlines
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_generations_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for optimized querying and analytics
CREATE INDEX idx_email_gen_user_id ON email_generations(user_id);
CREATE INDEX idx_email_gen_created_at ON email_generations(created_at);
CREATE INDEX idx_email_gen_type ON email_generations(generation_type);

-- -----------------------------------------------------------------------------
-- Initial Seed Data (Optional Demonstration Account)
-- Note: Password is 'password123' hashed with BCrypt (10 rounds)
-- -----------------------------------------------------------------------------
INSERT INTO users (name, email, password, role)
SELECT 'Demo User', 'demo@smartmail.ai', '$2a$10$wT0Y5s6rD4wP8hN8N7iUme7gQ1h/zGkV8h3M6aN0oN7hD4wP8hN8N', 'ROLE_USER'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@smartmail.ai');
