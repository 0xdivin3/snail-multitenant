// controllers/salesController.js
import { query } from "../config/db.js";

// GET /api/sales
export async function getAllSales(req, res) {
  try {
    const result = await query(
      `SELECT s.*, p.pen_code, u.full_name AS recorded_by_name
       FROM sales_records s
       LEFT JOIN snail_pens p ON s.pen_id = p.id
       LEFT JOIN users u ON s.recorded_by = u.id
       WHERE s.organization_id = $1
       ORDER BY s.sale_date DESC, s.created_at DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales records." });
  }
}

// GET /api/sales/summary?start=&end=
export async function getSalesSummary(req, res) {
  try {
    const { start, end } = req.query;
    const result = await query(
      `SELECT
         COUNT(*) AS total_transactions,
         COALESCE(SUM(quantity_sold), 0) AS total_quantity_sold,
         COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM sales_records
       WHERE organization_id = $1
         AND ($2::date IS NULL OR sale_date >= $2)
         AND ($3::date IS NULL OR sale_date <= $3)`,
      [req.user.organization_id, start || null, end || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales summary." });
  }
}

// POST /api/sales  (admin + staff)
export async function createSale(req, res) {
  try {
    const { buyer_name, buyer_contact, item_sold, quantity_sold, unit_price, sale_date, pen_id, notes } = req.body;

    if (!buyer_name || !quantity_sold || !unit_price) {
      return res.status(400).json({ message: "buyer_name, quantity_sold, and unit_price are required." });
    }

    const result = await query(
      `INSERT INTO sales_records
        (organization_id, buyer_name, buyer_contact, item_sold, quantity_sold, unit_price, sale_date, pen_id, recorded_by, notes)
       VALUES ($1,$2,$3,COALESCE($4,'live snail'),$5,$6,COALESCE($7, CURRENT_DATE),$8,$9,$10)
       RETURNING *`,
      [req.user.organization_id, buyer_name, buyer_contact, item_sold, quantity_sold, unit_price, sale_date, pen_id, req.user.id, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record sale." });
  }
}

// PUT /api/sales/:id  (admin only)
export async function updateSale(req, res) {
  try {
    const { buyer_name, buyer_contact, item_sold, quantity_sold, unit_price, sale_date, pen_id, notes } = req.body;
    const result = await query(
      `UPDATE sales_records SET
        buyer_name = COALESCE($1, buyer_name),
        buyer_contact = COALESCE($2, buyer_contact),
        item_sold = COALESCE($3, item_sold),
        quantity_sold = COALESCE($4, quantity_sold),
        unit_price = COALESCE($5, unit_price),
        sale_date = COALESCE($6, sale_date),
        pen_id = COALESCE($7, pen_id),
        notes = COALESCE($8, notes)
       WHERE id = $9 AND organization_id = $10
       RETURNING *`,
      [buyer_name, buyer_contact, item_sold, quantity_sold, unit_price, sale_date, pen_id, notes, req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Sale record not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update sale." });
  }
}

// DELETE /api/sales/:id  (admin only)
export async function deleteSale(req, res) {
  try {
    const result = await query(
      "DELETE FROM sales_records WHERE id = $1 AND organization_id = $2 RETURNING id",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Sale record not found." });
    res.json({ message: "Sale record deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete sale." });
  }
}
