// controllers/reportController.js
import { query } from "../config/db.js";

// GET /api/reports/dashboard — farm-level summary (admin/staff)
export async function getDashboardSummary(req, res) {
  try {
    const orgId = req.user.organization_id;
    const [pens, breeding, feedingToday, inventoryLow, salesThisMonth] = await Promise.all([
      query("SELECT COUNT(*) AS total_pens, COALESCE(SUM(current_count),0) AS total_snails FROM snail_pens WHERE organization_id = $1", [orgId]),
      query("SELECT COUNT(*) AS active_batches FROM breeding_records WHERE organization_id = $1 AND status IN ('mating','incubating')", [orgId]),
      query("SELECT COALESCE(SUM(quantity_kg),0) AS feed_today FROM feeding_records WHERE organization_id = $1 AND feeding_date = CURRENT_DATE", [orgId]),
      query("SELECT COUNT(*) AS low_stock_count FROM inventory WHERE organization_id = $1 AND quantity <= reorder_level", [orgId]),
      query(`SELECT COALESCE(SUM(total_amount),0) AS revenue_this_month, COUNT(*) AS sales_this_month
             FROM sales_records WHERE organization_id = $1 AND date_trunc('month', sale_date) = date_trunc('month', CURRENT_DATE)`, [orgId]),
    ]);

    res.json({
      total_pens: Number(pens.rows[0].total_pens),
      total_snails: Number(pens.rows[0].total_snails),
      active_breeding_batches: Number(breeding.rows[0].active_batches),
      feed_given_today_kg: Number(feedingToday.rows[0].feed_today),
      low_stock_items: Number(inventoryLow.rows[0].low_stock_count),
      revenue_this_month: Number(salesThisMonth.rows[0].revenue_this_month),
      sales_this_month: Number(salesThisMonth.rows[0].sales_this_month),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate dashboard summary." });
  }
}

// GET /api/reports/feeding?start=&end=  (farm admin)
export async function getFeedingReport(req, res) {
  try {
    const { start, end } = req.query;
    const result = await query(
      `SELECT p.pen_code, f.feed_type, SUM(f.quantity_kg) AS total_kg, COUNT(*) AS num_feedings
       FROM feeding_records f
       LEFT JOIN snail_pens p ON f.pen_id = p.id
       WHERE f.organization_id = $1
         AND ($2::date IS NULL OR f.feeding_date >= $2)
         AND ($3::date IS NULL OR f.feeding_date <= $3)
       GROUP BY p.pen_code, f.feed_type
       ORDER BY p.pen_code`,
      [req.user.organization_id, start || null, end || null]
    );
    await logReport(req.user.id, req.user.organization_id, "feeding", start, end);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate feeding report." });
  }
}

// GET /api/reports/breeding?start=&end=
export async function getBreedingReport(req, res) {
  try {
    const { start, end } = req.query;
    const result = await query(
      `SELECT status, COUNT(*) AS batch_count,
              SUM(parent_stock_count) AS total_parent_stock,
              SUM(eggs_laid) AS total_eggs,
              SUM(hatchlings_count) AS total_hatchlings
       FROM breeding_records
       WHERE organization_id = $1
         AND ($2::date IS NULL OR mating_date >= $2)
         AND ($3::date IS NULL OR mating_date <= $3)
       GROUP BY status`,
      [req.user.organization_id, start || null, end || null]
    );
    await logReport(req.user.id, req.user.organization_id, "breeding", start, end);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate breeding report." });
  }
}

// GET /api/reports/inventory
export async function getInventoryReport(req, res) {
  try {
    const result = await query(
      `SELECT category, COUNT(*) AS item_count, SUM(quantity) AS total_quantity
       FROM inventory WHERE organization_id = $1 GROUP BY category`,
      [req.user.organization_id]
    );
    await logReport(req.user.id, req.user.organization_id, "inventory", null, null);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate inventory report." });
  }
}

// GET /api/reports/sales?start=&end=
export async function getSalesReport(req, res) {
  try {
    const { start, end } = req.query;
    const result = await query(
      `SELECT sale_date, COUNT(*) AS num_sales, SUM(quantity_sold) AS total_quantity, SUM(total_amount) AS total_revenue
       FROM sales_records
       WHERE organization_id = $1
         AND ($2::date IS NULL OR sale_date >= $2)
         AND ($3::date IS NULL OR sale_date <= $3)
       GROUP BY sale_date
       ORDER BY sale_date DESC`,
      [req.user.organization_id, start || null, end || null]
    );
    await logReport(req.user.id, req.user.organization_id, "sales", start, end);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate sales report." });
  }
}

// ============================================================
// PLATFORM-LEVEL (super_admin only) — aggregate across ALL organizations
// ============================================================

// GET /api/reports/platform/summary
export async function getPlatformSummary(req, res) {
  try {
    const [orgs, users, pens, salesAllTime] = await Promise.all([
      query("SELECT COUNT(*) AS total_orgs, COUNT(*) FILTER (WHERE status = 'active') AS active_orgs FROM organizations"),
      query("SELECT COUNT(*) AS total_users, COUNT(*) FILTER (WHERE role = 'admin') AS total_admins, COUNT(*) FILTER (WHERE role = 'staff') AS total_staff FROM users"),
      query("SELECT COUNT(*) AS total_pens, COALESCE(SUM(current_count),0) AS total_snails FROM snail_pens"),
      query("SELECT COALESCE(SUM(total_amount),0) AS total_platform_revenue, COUNT(*) AS total_sales FROM sales_records"),
    ]);

    res.json({
      total_organizations: Number(orgs.rows[0].total_orgs),
      active_organizations: Number(orgs.rows[0].active_orgs),
      total_users: Number(users.rows[0].total_users),
      total_admins: Number(users.rows[0].total_admins),
      total_staff: Number(users.rows[0].total_staff),
      total_pens: Number(pens.rows[0].total_pens),
      total_snails_platform_wide: Number(pens.rows[0].total_snails),
      total_platform_revenue: Number(salesAllTime.rows[0].total_platform_revenue),
      total_sales: Number(salesAllTime.rows[0].total_sales),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate platform summary." });
  }
}

// GET /api/reports/platform/organizations — per-org breakdown for super_admin
export async function getOrganizationsBreakdown(req, res) {
  try {
    const result = await query(
      `SELECT o.id, o.name, o.slug, o.status, o.created_at,
              COUNT(DISTINCT u.id) AS user_count,
              COUNT(DISTINCT p.id) AS pen_count,
              COALESCE(SUM(DISTINCT p.current_count), 0) AS total_snails,
              COALESCE((SELECT SUM(total_amount) FROM sales_records WHERE organization_id = o.id), 0) AS total_revenue
       FROM organizations o
       LEFT JOIN users u ON u.organization_id = o.id
       LEFT JOIN snail_pens p ON p.organization_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch organization breakdown." });
  }
}

async function logReport(userId, organizationId, type, start, end) {
  try {
    await query(
      `INSERT INTO reports_log (organization_id, report_type, date_range_start, date_range_end, generated_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [organizationId, type, start || null, end || null, userId]
    );
  } catch (err) {
    console.error("Failed to log report generation:", err.message);
  }
}
