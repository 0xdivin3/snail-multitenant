// controllers/penController.js
import { query } from "../config/db.js";

// GET /api/pens — scoped to caller's organization
export async function getAllPens(req, res) {
  try {
    const result = await query(
      "SELECT * FROM snail_pens WHERE organization_id = $1 ORDER BY created_at DESC",
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pens." });
  }
}

// GET /api/pens/:id
export async function getPenById(req, res) {
  try {
    const result = await query(
      "SELECT * FROM snail_pens WHERE id = $1 AND organization_id = $2",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Pen not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pen." });
  }
}

// POST /api/pens  (admin only)
export async function createPen(req, res) {
  try {
    const { pen_code, location, snail_species, capacity, current_count, status } = req.body;
    if (!pen_code) return res.status(400).json({ message: "pen_code is required." });

    const result = await query(
      `INSERT INTO snail_pens (organization_id, pen_code, location, snail_species, capacity, current_count, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'active'))
       RETURNING *`,
      [req.user.organization_id, pen_code, location, snail_species || "Archachatina marginata", capacity, current_count || 0, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "A pen with this code already exists in your organization." });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create pen." });
  }
}

// PUT /api/pens/:id  (admin only)
export async function updatePen(req, res) {
  try {
    const { pen_code, location, snail_species, capacity, current_count, status } = req.body;
    const result = await query(
      `UPDATE snail_pens
       SET pen_code = COALESCE($1, pen_code),
           location = COALESCE($2, location),
           snail_species = COALESCE($3, snail_species),
           capacity = COALESCE($4, capacity),
           current_count = COALESCE($5, current_count),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7 AND organization_id = $8
       RETURNING *`,
      [pen_code, location, snail_species, capacity, current_count, status, req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Pen not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update pen." });
  }
}

// DELETE /api/pens/:id  (admin only)
export async function deletePen(req, res) {
  try {
    const result = await query(
      "DELETE FROM snail_pens WHERE id = $1 AND organization_id = $2 RETURNING id",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Pen not found." });
    res.json({ message: "Pen deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete pen." });
  }
}
