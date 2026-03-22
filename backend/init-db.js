/**
 * init-db.js
 * Run this ONCE to:
 * 1. Create the schema tables
 * 2. Seed demo users (admin, staff, student)
 *
 * Usage: node init-db.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const SALT_ROUNDS = 10;

async function init() {
    let connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 3306,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // Re-create connection with multipleStatements true as we need it for schema.sql
    await connection.end();

    connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true,
    });

    console.log("✅ Connected to MySQL and Database created/selected");

    // Read and run schema
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await connection.query(schema);
    console.log("✅ Schema applied");

    // Seed users
    const users = [
        {
            name: "Admin User",
            email: "admin@test.com",
            password: "admin123",
            role: "admin",
            register_number: null,
            department: "Administration",
            year: null,
        },
        {
            name: "Staff Member",
            email: "staff@test.com",
            password: "staff123",
            role: "staff",
            register_number: null,
            department: "Computer Science",
            year: null,
        },
        {
            name: "John Student",
            email: "student@test.com",
            password: "student123",
            role: "student",
            register_number: "CS2021001",
            department: "Computer Science",
            year: 3,
        },
        {
            name: "Alice Scholar",
            email: "alice@test.com",
            password: "alice123",
            role: "student",
            register_number: "CS2021002",
            department: "Computer Science",
            year: 2,
        },
        {
            name: "Bob Researcher",
            email: "bob@test.com",
            password: "bob123",
            role: "student",
            register_number: "EC2021003",
            department: "Electronics",
            year: 4,
        },
    ];

    for (const u of users) {
        const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
        await connection.query(
            `INSERT INTO users (name, email, password_hash, role, register_number, department, year)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
            [u.name, u.email, hash, u.role, u.register_number, u.department, u.year]
        );
        console.log(`  👤 Seeded ${u.role}: ${u.email}`);
    }

    // Seed sample activities for John Student
    const [[johnRow]] = await connection.query(
        "SELECT id FROM users WHERE email = 'student@test.com'"
    );
    const [[aliceRow]] = await connection.query(
        "SELECT id FROM users WHERE email = 'alice@test.com'"
    );

    const sampleActivities = [
        {
            user_id: johnRow.id,
            title: "IoT-Based Smart Irrigation System",
            description: "An internally funded project for automating irrigation using IoT sensors.",
            activity_type: "Internally Funded Projects",
            student_level: "3rd Year",
            domain: "IoT",
            status: "ongoing",
            date: "2025-06-01",
        },
        {
            user_id: johnRow.id,
            title: "National Conference on AI",
            description: "Presented a paper on machine learning applications in healthcare.",
            activity_type: "Conferences",
            student_level: "3rd Year",
            domain: "Artificial Intelligence",
            venue: "Delhi",
            status: "completed",
            date: "2025-02-15",
        },
        {
            user_id: johnRow.id,
            title: "Smart India Hackathon 2025",
            description: "Participated and reached finals in SIH 2025.",
            activity_type: "Hackathons",
            student_level: "3rd Year",
            domain: "Software Development",
            venue: "Online",
            position: "Runner",
            status: "completed",
            date: "2025-08-10",
        },
        {
            user_id: aliceRow.id,
            title: "Research on Quantum Computing",
            description: "Published a paper in IEEE on quantum error correction.",
            activity_type: "Journal Publication",
            student_level: "2nd Year",
            domain: "Quantum Computing",
            journal_name: "IEEE Transactions",
            status: "completed",
            date: "2025-09-20",
        },
        {
            user_id: aliceRow.id,
            title: "Best Student Award 2025",
            description: "Received the departmental Best Student Award.",
            activity_type: "Achievement",
            student_level: "2nd Year",
            issued_by: "CS Department",
            status: "completed",
            date: "2025-11-05",
        },
    ];

    for (const act of sampleActivities) {
        await connection.query(
            `INSERT INTO activities (user_id, title, description, activity_type, student_level, domain, venue, position, journal_name, issued_by, status, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [act.user_id, act.title, act.description, act.activity_type, act.student_level || null, act.domain || null, act.venue || null, act.position || null, act.journal_name || null, act.issued_by || null, act.status, act.date]
        );
    }
    console.log("✅ Sample activities seeded");

    await connection.end();
    console.log("\n🎉 Database initialized successfully!");
    console.log("\nDefault accounts:");
    console.log("  Admin  → admin@test.com   / admin123");
    console.log("  Staff  → staff@test.com   / staff123");
    console.log("  Student→ student@test.com / student123");
}

init().catch((err) => {
    console.error("❌ Init failed:", err.message);
    process.exit(1);
});
