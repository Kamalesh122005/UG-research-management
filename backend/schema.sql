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
    student_level VARCHAR(50),
    domain VARCHAR(255),
    problem_statement TEXT,
    abstract TEXT,
    team_members TEXT,
    mentor VARCHAR(255),
    venue VARCHAR(255),
    budget VARCHAR(100),
    position VARCHAR(100),
    journal_name VARCHAR(255),
    publisher VARCHAR(255),
    doi VARCHAR(255),
    issued_by VARCHAR(255),
    certificate_path VARCHAR(500),
    status ENUM('ongoing', 'completed') NOT NULL DEFAULT 'ongoing',
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================================
-- PROJECTS TABLE (Team-based research projects)
-- ====================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain ENUM('Education','Manufacturing','Technology','Medical','Agriculture') NOT NULL,
    keywords VARCHAR(500),
    mentor_id INT NOT NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ====================================================
-- PROJECT MEMBERS (Many students per project)
-- ====================================================
CREATE TABLE IF NOT EXISTS project_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY unique_member (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================================
-- PROJECT DOCUMENTS
-- ====================================================
CREATE TABLE IF NOT EXISTS project_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
