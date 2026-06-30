// db/seed.js
// Run with: npm run seed
// Creates the platform's first super_admin account (organization_id = NULL).
// Individual farm businesses create their own Admin accounts via the public /signup page —
// this script is ONLY for the platform owner's account.
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

const SUPER_ADMIN_NAME = "Platform Super Admin";
const SUPER_ADMIN_EMAIL = "superadmin@snailplatform.com";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@12345"; // CHANGE THIS after first login

async function seed() {
  try {
    const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [SUPER_ADMIN_EMAIL]);
    if (existing.rows.length > 0) {
      console.log("Super admin already exists. Skipping.");
      return;
    }

    await pool.query(
      `INSERT INTO users (organization_id, full_name, email, password_hash, role)
       VALUES (NULL, $1, $2, $3, 'super_admin')`,
      [SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, hash]
    );

    console.log("✅ Super admin account created:");
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log("⚠️  Please log in and change this password immediately.");
    console.log("");
    console.log("Individual farm businesses sign up themselves at /signup — you don't need to create their accounts.");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
