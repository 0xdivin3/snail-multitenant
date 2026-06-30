-- ============================================================
-- SNAIL: Multi-Tenant Snail Farm Management Platform
-- Database Schema (Neon Postgres)
-- ============================================================
-- Three-tier access model:
--   1. super_admin  — platform owner, sees all organizations
--   2. admin        — owns/manages one organization (farm business)
--   3. staff        — operational user within one organization
-- ============================================================

DROP TABLE IF EXISTS reports_log CASCADE;
DROP TABLE IF EXISTS sales_records CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS feeding_records CASCADE;
DROP TABLE IF EXISTS breeding_records CASCADE;
DROP TABLE IF EXISTS snail_pens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ------------------------------------------------------------
-- ORGANIZATIONS (tenants — one row per farm business)
-- ------------------------------------------------------------
CREATE TABLE organizations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(150) UNIQUE NOT NULL,
    contact_email   VARCHAR(150),
    contact_phone   VARCHAR(50),
    address         VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- USERS
-- super_admin: organization_id is NULL (platform-level, not tied to a farm)
-- admin / staff: organization_id is required (scoped to one farm)
-- ------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff')),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    CONSTRAINT org_required_unless_super_admin CHECK (
        (role = 'super_admin' AND organization_id IS NULL) OR
        (role IN ('admin', 'staff') AND organization_id IS NOT NULL)
    )
);

-- ------------------------------------------------------------
-- SNAIL PENS / BEDS — scoped to organization
-- ------------------------------------------------------------
CREATE TABLE snail_pens (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pen_code        VARCHAR(50) NOT NULL,
    location        VARCHAR(150),
    snail_species   VARCHAR(100) DEFAULT 'Archachatina marginata',
    capacity        INTEGER,
    current_count   INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE (organization_id, pen_code)
);

-- ------------------------------------------------------------
-- BREEDING RECORDS
-- ------------------------------------------------------------
CREATE TABLE breeding_records (
    id                  SERIAL PRIMARY KEY,
    organization_id     INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pen_id              INTEGER REFERENCES snail_pens(id) ON DELETE SET NULL,
    batch_code          VARCHAR(50) NOT NULL,
    parent_stock_count  INTEGER NOT NULL,
    mating_date         DATE,
    expected_hatch_date DATE,
    eggs_laid           INTEGER DEFAULT 0,
    hatchlings_count    INTEGER DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'mating' CHECK (status IN ('mating', 'incubating', 'hatched', 'failed')),
    notes               TEXT,
    recorded_by         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE (organization_id, batch_code)
);

-- ------------------------------------------------------------
-- FEEDING RECORDS
-- ------------------------------------------------------------
CREATE TABLE feeding_records (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pen_id          INTEGER REFERENCES snail_pens(id) ON DELETE CASCADE,
    feed_type       VARCHAR(100) NOT NULL,
    quantity_kg     NUMERIC(10,2) NOT NULL,
    feeding_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    recorded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INVENTORY (feed, equipment, AND live snail stock)
-- ------------------------------------------------------------
CREATE TABLE inventory (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_name       VARCHAR(150) NOT NULL,
    category        VARCHAR(20) NOT NULL CHECK (category IN ('feed', 'equipment', 'live_snail')),
    quantity        NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit            VARCHAR(20) NOT NULL DEFAULT 'units',
    reorder_level   NUMERIC(12,2) DEFAULT 0,
    pen_id          INTEGER REFERENCES snail_pens(id) ON DELETE SET NULL,
    last_restocked  TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INVENTORY TRANSACTIONS (audit trail of stock movement)
-- ------------------------------------------------------------
CREATE TABLE inventory_transactions (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inventory_id    INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
    quantity        NUMERIC(12,2) NOT NULL,
    reason          VARCHAR(255),
    recorded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- SALES RECORDS
-- ------------------------------------------------------------
CREATE TABLE sales_records (
    id              SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    buyer_name      VARCHAR(150) NOT NULL,
    buyer_contact   VARCHAR(100),
    item_sold       VARCHAR(100) NOT NULL DEFAULT 'live snail',
    quantity_sold   NUMERIC(12,2) NOT NULL,
    unit_price      NUMERIC(12,2) NOT NULL,
    total_amount    NUMERIC(14,2) GENERATED ALWAYS AS (quantity_sold * unit_price) STORED,
    sale_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    pen_id          INTEGER REFERENCES snail_pens(id) ON DELETE SET NULL,
    recorded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- REPORTS LOG
-- ------------------------------------------------------------
CREATE TABLE reports_log (
    id                  SERIAL PRIMARY KEY,
    organization_id     INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    report_type         VARCHAR(50) NOT NULL,
    date_range_start    DATE,
    date_range_end      DATE,
    generated_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INDEXES — every tenant-scoped table indexed on organization_id
-- ------------------------------------------------------------
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_pens_org ON snail_pens(organization_id);
CREATE INDEX idx_breeding_org ON breeding_records(organization_id);
CREATE INDEX idx_breeding_pen ON breeding_records(pen_id);
CREATE INDEX idx_feeding_org_date ON feeding_records(organization_id, feeding_date);
CREATE INDEX idx_inventory_org_category ON inventory(organization_id, category);
CREATE INDEX idx_inventory_txn_org ON inventory_transactions(organization_id);
CREATE INDEX idx_inventory_txn_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX idx_sales_org_date ON sales_records(organization_id, sale_date);

-- ------------------------------------------------------------
-- SEED: platform super-admin is created via db/seed.js, not here.
-- ------------------------------------------------------------
