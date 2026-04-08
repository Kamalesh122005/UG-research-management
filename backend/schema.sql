-- ====================================================
-- Academic Portal Database Schema (Unified Activities)
-- ====================================================

-- ====================================================
-- USERS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_by INT,
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
    mentor_id INT,
    mentor_name VARCHAR(255),
    mentor_email VARCHAR(255),
    mentor_type VARCHAR(50),
    keywords VARCHAR(500),
    venue VARCHAR(255),
    budget VARCHAR(100),
    position VARCHAR(100),
    journal_name VARCHAR(255),
    publisher VARCHAR(255),
    doi VARCHAR(255),
    issued_by VARCHAR(255),
    certificate_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'Submitted',
    approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    feedback TEXT,
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_activity_per_user (title, activity_type, created_by),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================================
-- ACTIVITY MEMBERS (Dynamic team members)
-- ====================================================
CREATE TABLE IF NOT EXISTS activity_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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

-- ====================================================
-- NOTIFICATIONS
-- ====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================================
-- OTP VERIFICATIONS
-- ====================================================
CREATE TABLE IF NOT EXISTS otp_verifications (
    email VARCHAR(255) PRIMARY KEY,
    otp VARCHAR(10) NOT NULL,
    user_data JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL
);
