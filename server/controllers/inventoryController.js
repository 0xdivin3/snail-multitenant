// controllers/inventoryController.js
import { pool, query } from "../config/db.js";

// GET /api/inventory
export async function getAllInventory(req, res) {
  try {
    const result = await query(
      "SELECT * FROM inventory WHERE organization_id = $1 ORDER BY category, item_name",
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch inventory." });
  }
}

// GET /api/inventory/low-stock
export async function getLowStockItems(req, res) {
  try {
    const result = await query(
      "SELECT * FROM inventory WHERE organization_id = $1 AND quantity <= reorder_level ORDER BY quantity ASC",
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch low stock items." });
  }
}

// POST /api/inventory  (admin only)
export async function createInventoryItem(req, res) {
  try {
    const { item_name, category, quantity, unit, reorder_level, pen_id } = req.body;

    if (!item_name || !category) {
      return res.status(400).json({ message: "item_name and category are required." });
    }
    if (!["feed", "equipment", "live_snail"].includes(category)) {
      return res.status(400).json({ message: "category must be feed, equipment, or live_snail." });
    }

    const result = await query(
      `INSERT INTO inventory (organization_id, item_name, category, quantity, unit, reorder_level, pen_id, last_restocked)
       VALUES ($1,$2,$3,$4,$5,$6,$7, CASE WHEN $4 > 0 THEN NOW() ELSE NULL END)
       RETURNING *`,
      [req.user.organization_id, item_name, category, quantity || 0, unit || "units", reorder_level || 0, pen_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create inventory item." });
  }
}

// POST /api/inventory/:id/transactions  (admin + staff)
export async function recordTransaction(req, res) {
  const client = await pool.connect();
  try {
    const { type, quantity, reason } = req.body;
    const { id } = req.params;
    const organization_id = req.user.organization_id;

    if (!type || !quantity || !["in", "out"].includes(type)) {
      return res.status(400).json({ message: "type ('in' or 'out') and quantity are required." });
    }

    await client.query("BEGIN");

    const invResult = await client.query(
      "SELECT * FROM inventory WHERE id = $1 AND organization_id = $2 FOR UPDATE",
      [id, organization_id]
    );
    if (invResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Inventory item not found." });
    }

    const item = invResult.rows[0];
    const delta = type === "in" ? Number(quantity) : -Number(quantity);
    const newQuantity = Number(item.quantity) + delta;

    if (newQuantity < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient stock for this transaction." });
    }

    await client.query(
      `UPDATE inventory SET quantity = $1, updated_at = NOW(),
       last_restocked = CASE WHEN $2 = 'in' THEN NOW() ELSE last_restocked END
       WHERE id = $3 AND organization_id = $4`,
      [newQuantity, type, id, organization_id]
    );

    const txnResult = await client.query(
      `INSERT INTO inventory_transactions (organization_id, inventory_id, type, quantity, reason, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [organization_id, id, type, quantity, reason, req.user.id]
    );

    await client.query("COMMIT");
    res.status(201).json({ transaction: txnResult.rows[0], new_quantity: newQuantity });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Failed to record transaction." });
  } finally {
    client.release();
  }
}

// GET /api/inventory/:id/transactions
export async function getItemTransactions(req, res) {
  try {
    const result = await query(
      `SELECT t.*, u.full_name AS recorded_by_name
       FROM inventory_transactions t
       LEFT JOIN users u ON t.recorded_by = u.id
       WHERE t.inventory_id = $1 AND t.organization_id = $2
       ORDER BY t.created_at DESC`,
      [req.params.id, req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions." });
  }
}

// DELETE /api/inventory/:id  (admin only)
export async function deleteInventoryItem(req, res) {
  try {
    const result = await query(
      "DELETE FROM inventory WHERE id = $1 AND organization_id = $2 RETURNING id",
      [req.params.id, req.user.organization_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Inventory item not found." });
    res.json({ message: "Inventory item deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete inventory item." });
  }
}
