// controllers/feedingController.js
import { query } from "../config/db.js";

// GET /api/feeding
export async function getAllFeedingRecords(req, res) {
  try {
    const result = await query(
      `SELECT f.*, p.pen_code, u.full_name AS recorded_by_name
       FROM feeding_records f
       LEFT JOIN snail_pens p ON f.pen_id = p.id
       LEFT JOIN users u ON f.recorded_by = u.id
       WHERE f.organization_id = $1
       ORDER BY f.feeding_date DESC, f.created_at DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch feeding records." });
  }
}

// POST /api/feeding  (admin + staff)
export async function createFeedingRecord(req, res) {
  try {
    const { pen_id, feed_type, quantity_kg, feeding_date, notes } = req.body;

    if (!pen_id || !feed_type || !quantity_kg) {
      return res.status(400).json({ message: "pen_id, feed_type, and quantity_kg are required." });
    }

    // Confirm the pen belongs to this organization before logging against it
    const penCheck = await query(
      "SELECT id FROM snail_pens WHERE id = $1 AND organization_id = $2",
      [pen_id, req.user.organization_id]
    );
    if (penCheck.rows.length === 0) {
      return res.status(404).json({ message: "Pen not found in your organization." });
    }

    const result = await query(
      `INSERT INTO feeding_records (organization_id, pen_id, feed_type, quantity_kg, feeding_date, notes, recorded_by)
       VALUES ($1,$2,$3,$4,COALESCE($5, CURRENT_DATE),$6,$7)
       RETURNING *`,
      [req.user.organization_id, pen_id, feed_type, quantity_kg, feeding_date, notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create feeding record." });
  }
}

// PUT /api/feeding/:id  (admin + staff)
export async function updateFeedingRecord(req, res) {
  try {
    const { pen_id, feed_type, quantity_kg, feeding_date, notes } = req.body;
    const result = await query(
      `UPDATE feeding_records SET
        pen_id = COALESCE($1, pen_id),
        feed_type = COALESCE($2, feed_type),
        quantity_kg = COALESCE($3, quantity_kg),
        feeding_date = COALESCE($4, feeding_date),
        notes = COALESCE($5, notes)
       WHERE id = $6 AND organization_id = $7
       RETURNING *`,
      [pen_id, feed_type, quantity_kg, feeding_date, notes, req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Feeding record not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update feeding record." });
  }
}

// DELETE /api/feeding/:id  (admin only)
export async function deleteFeedingRecord(req, res) {
  try {
    const result = await query(
      "DELETE FROM feeding_records WHERE id = $1 AND organization_id = $2 RETURNING id",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Feeding record not found." });
    res.json({ message: "Feeding record deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete feeding record." });
  }
}
