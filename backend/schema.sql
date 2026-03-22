-- ====================================================
-- Academic Portal Database Schema (Unified Activities)
-- ====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop old tables if they exist
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS publications;
DROP TABLE IF EXISTS hackathons;
DROP TABLE IF EXISTS conferences;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================
-- USERS TABLE
-- ====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
    register_number VARCHAR(100),
    department VARCHAR(100),
    year INT CHECK (year BETWEEN 1 AND 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================
-- ACTIVITIES TABLE (Unified with Dynamic Fields)
-- ====================================================
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type ENUM(
        'Internally Funded Projects',
        'Conferences',
        'Hackathons',
        'Journal Publication',
        'Achievement'
    ) NOT NULL,
    student_level VARCHAR(50),      -- e.g., 1st Year, PG, etc.
    domain VARCHAR(255),
    problem_statement TEXT,
    abstract TEXT,
    team_members TEXT,
    mentor VARCHAR(255),            -- Mentor Staff Name
    venue VARCHAR(255),             -- Venue / Location
    budget VARCHAR(100),            
    position VARCHAR(100),          -- Winner / Runner / Participant
    journal_name VARCHAR(255),
    publisher VARCHAR(255),
    doi VARCHAR(255),               -- DOI / Link
    issued_by VARCHAR(255),
    certificate_path VARCHAR(500),  -- Path to uploaded file
    status ENUM('ongoing', 'completed') NOT NULL DEFAULT 'ongoing',
    date DATE,                      -- Date / Start Date / Publication Date
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
