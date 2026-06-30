// controllers/breedingController.js
import { query } from "../config/db.js";

// GET /api/breeding
export async function getAllBreedingRecords(req, res) {
  try {
    const result = await query(
      `SELECT b.*, p.pen_code, u.full_name AS recorded_by_name
       FROM breeding_records b
       LEFT JOIN snail_pens p ON b.pen_id = p.id
       LEFT JOIN users u ON b.recorded_by = u.id
       WHERE b.organization_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch breeding records." });
  }
}

// GET /api/breeding/:id
export async function getBreedingRecordById(req, res) {
  try {
    const result = await query(
      "SELECT * FROM breeding_records WHERE id = $1 AND organization_id = $2",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Breeding record not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch breeding record." });
  }
}

// POST /api/breeding  (admin + staff)
export async function createBreedingRecord(req, res) {
  try {
    const {
      pen_id, batch_code, parent_stock_count, mating_date,
      expected_hatch_date, eggs_laid, hatchlings_count, status, notes,
    } = req.body;

    if (!batch_code || !parent_stock_count) {
      return res.status(400).json({ message: "batch_code and parent_stock_count are required." });
    }

    const result = await query(
      `INSERT INTO breeding_records
        (organization_id, pen_id, batch_code, parent_stock_count, mating_date, expected_hatch_date,
         eggs_laid, hatchlings_count, status, notes, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'mating'),$10,$11)
       RETURNING *`,
      [req.user.organization_id, pen_id, batch_code, parent_stock_count, mating_date, expected_hatch_date,
       eggs_laid || 0, hatchlings_count || 0, status, notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "A breeding record with this batch_code already exists in your organization." });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to create breeding record." });
  }
}

// PUT /api/breeding/:id  (admin + staff)
export async function updateBreedingRecord(req, res) {
  try {
    const {
      pen_id, batch_code, parent_stock_count, mating_date,
      expected_hatch_date, eggs_laid, hatchlings_count, status, notes,
    } = req.body;

    const result = await query(
      `UPDATE breeding_records SET
        pen_id = COALESCE($1, pen_id),
        batch_code = COALESCE($2, batch_code),
        parent_stock_count = COALESCE($3, parent_stock_count),
        mating_date = COALESCE($4, mating_date),
        expected_hatch_date = COALESCE($5, expected_hatch_date),
        eggs_laid = COALESCE($6, eggs_laid),
        hatchlings_count = COALESCE($7, hatchlings_count),
        status = COALESCE($8, status),
        notes = COALESCE($9, notes),
        updated_at = NOW()
       WHERE id = $10 AND organization_id = $11
       RETURNING *`,
      [pen_id, batch_code, parent_stock_count, mating_date, expected_hatch_date,
       eggs_laid, hatchlings_count, status, notes, req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Breeding record not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update breeding record." });
  }
}

// DELETE /api/breeding/:id  (admin only)
export async function deleteBreedingRecord(req, res) {
  try {
    const result = await query(
      "DELETE FROM breeding_records WHERE id = $1 AND organization_id = $2 RETURNING id",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Breeding record not found." });
    res.json({ message: "Breeding record deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete breeding record." });
  }
}
