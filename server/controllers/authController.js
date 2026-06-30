// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, query } from "../config/db.js";

const SALT_ROUNDS = 10;

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
      organization_id: user.organization_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

// POST /api/auth/signup — PUBLIC. A new farm business registers itself.
// Creates the organization AND its first user (role: admin) in one transaction.
export async function signup(req, res) {
  const client = await pool.connect();
  try {
    const { organization_name, full_name, email, password, contact_phone, address } = req.body;

    if (!organization_name || !full_name || !email || !password) {
      return res.status(400).json({ message: "organization_name, full_name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    await client.query("BEGIN");

    const existingUser = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    // Generate a unique slug from the org name (append a number if taken)
    let baseSlug = slugify(organization_name);
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const slugCheck = await client.query("SELECT id FROM organizations WHERE slug = $1", [slug]);
      if (slugCheck.rows.length === 0) break;
      slug = `${baseSlug}-${++suffix}`;
    }

    const orgResult = await client.query(
      `INSERT INTO organizations (name, slug, contact_email, contact_phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [organization_name, slug, email, contact_phone || null, address || null]
    );
    const organization = orgResult.rows[0];

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const userResult = await client.query(
      `INSERT INTO users (organization_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, organization_id, full_name, email, role, created_at`,
      [organization.id, full_name, email, password_hash]
    );
    const user = userResult.rows[0];

    await client.query("COMMIT");

    const token = signToken(user);
    res.status(201).json({
      message: "Organization and admin account created successfully.",
      token,
      user,
      organization,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error during signup." });
  } finally {
    client.release();
  }
}

// POST /api/auth/register — creates Staff (or additional Admin) accounts WITHIN the caller's organization.
// Requires an authenticated Admin. organization_id is taken from the logged-in admin's token, never the request body —
// this is what stops one farm's admin from creating users inside another farm's organization.
export async function register(req, res) {
  try {
    const { full_name, email, password, role } = req.body;
    const organization_id = req.user.organization_id;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'admin' or 'staff'." });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (organization_id, full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, organization_id, full_name, email, role, created_at`,
      [organization_id, full_name, email, password_hash, role]
    );

    res.status(201).json({ message: "User created successfully.", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration." });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await query("SELECT * FROM users WHERE email = $1 AND is_active = TRUE", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // If this user belongs to an org, confirm that org is still active (not suspended)
    if (user.organization_id) {
      const orgResult = await query("SELECT status FROM organizations WHERE id = $1", [user.organization_id]);
      if (orgResult.rows[0]?.status === "suspended") {
        return res.status(403).json({ message: "Your organization's account has been suspended. Contact platform support." });
      }
    }

    const token = signToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  try {
    const result = await query(
      `SELECT u.id, u.full_name, u.email, u.role, u.organization_id, u.created_at,
              o.name AS organization_name
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile." });
  }
}
