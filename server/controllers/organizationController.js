// controllers/organizationController.js
import { query } from "../config/db.js";

// GET /api/organizations  (super_admin only)
export async function getAllOrganizations(req, res) {
  try {
    const result = await query("SELECT * FROM organizations ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch organizations." });
  }
}

// GET /api/organizations/:id  (super_admin only)
export async function getOrganizationById(req, res) {
  try {
    const result = await query("SELECT * FROM organizations WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Organization not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch organization." });
  }
}

// PATCH /api/organizations/:id/status  (super_admin only) — suspend or reactivate a farm's access
export async function updateOrganizationStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "status must be 'active' or 'suspended'." });
    }
    const result = await query(
      "UPDATE organizations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Organization not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update organization status." });
  }
}

// GET /api/organizations/:id/users  (super_admin only) — view a farm's users without touching their farm data
export async function getOrganizationUsers(req, res) {
  try {
    const result = await query(
      "SELECT id, full_name, email, role, is_active, created_at FROM users WHERE organization_id = $1 ORDER BY created_at",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch organization users." });
  }
}
