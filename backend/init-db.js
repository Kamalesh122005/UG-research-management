/**
 * init-db.js
 * Run this ONCE to:
 * 1. Create the schema tables
 * 2. Seed system accounts (admin + staff only)
 *
 * NOTE: Do NOT seed fake student users or sample activities.
 *       All real data comes from actual user registrations/submissions.
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

    // Apply schema
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await connection.query(schema);
    console.log("✅ Schema applied");

    // 👤 SEED ADMIN
    const [adminRows] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@ssn.edu.in']);
    if (adminRows.length === 0) {
        const adminPass = await bcrypt.hash('Admin@ssn123', SALT_ROUNDS);
        await connection.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ['System Admin', 'admin@ssn.edu.in', adminPass, 'admin']
        );
        console.log('  👤 Seeded admin: admin@ssn.edu.in');
    }

    // 👤 SEED STAFF
    const [staffRows] = await connection.query('SELECT id FROM users WHERE email = ?', ['staff@ssn.edu.in']);
    if (staffRows.length === 0) {
        const staffPass = await bcrypt.hash('Staff@ssn123', SALT_ROUNDS);
        await connection.query(
            "INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)",
            ['Faculty Staff', 'staff@ssn.edu.in', staffPass, 'staff', 'Computer Science']
        );
        console.log('  👤 Seeded staff: staff@ssn.edu.in');
    }

    await connection.end();
    console.log("\n🎉 Database initialized successfully!");
    console.log("\nDefault accounts:");
    console.log("  Admin  → admin@ssn.edu.in  / Admin@ssn123");
    console.log("  Staff  → staff@ssn.edu.in  / Staff@ssn123");
    console.log("  (Register student accounts via the app's Register page)");
}

init().catch((err) => {
    console.error("❌ Init failed:", err.message);
    process.exit(1);
});
