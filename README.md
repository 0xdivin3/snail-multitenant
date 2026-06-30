# SNAIL — Computerized Snail Farm Management and Data Processing System

A full-stack farm management system for tracking pens, breeding, feeding, inventory, and sales on a snail farm.

## Tech Stack
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** Neon (Postgres)
- **Auth:** JWT, role-based (Admin / Staff)
- **Hosting:** Vercel (frontend and backend as two separate projects)

## Project Structure
```
snail-system/
├── client/          # React + Vite frontend
└── server/          # Express API + Neon Postgres
```

## Local Setup

### 1. Database
1. Create a free project at https://neon.tech
2. Copy your connection string (starts with `postgresql://...`)
3. Run the schema against your Neon database:
   ```bash
   psql "<your-connection-string>" -f server/db/schema.sql
   ```
   (Or paste the contents of `server/db/schema.sql` into Neon's SQL Editor in the dashboard.)

### 2. Backend
```bash
cd server
cp .env.example .env
# Edit .env: paste your DATABASE_URL and set a JWT_SECRET
npm install
npm run seed     # creates the first Admin account (admin@snailfarm.com / Admin@12345)
npm run dev      # starts on http://localhost:5000
```
**Important:** Log in with the seeded admin account and change the password immediately, or create a new admin via the Users page and deactivate the seed account.

### 3. Frontend
```bash
cd client
npm install
npm run dev      # starts on http://localhost:5173, proxies /api to localhost:5000
```

Visit `http://localhost:5173` and log in.

## Deploying to Vercel

You'll deploy **two separate Vercel projects** (one for `client/`, one for `server/`):

### Backend
1. Push `server/` to its own GitHub repo (or use Vercel's monorepo root-directory setting pointing at `server/`)
2. Import into Vercel
3. Add environment variables in Vercel project settings: `DATABASE_URL`, `JWT_SECRET`
4. Deploy — note the resulting URL, e.g. `https://snail-server.vercel.app`

### Frontend
1. Push `client/` to its own GitHub repo (or root-directory `client/`)
2. Import into Vercel
3. Add environment variable: `VITE_API_URL=https://snail-server.vercel.app` (your backend URL from above, **no trailing slash, no `/api`**)
4. Deploy

This `VITE_API_URL` wiring is the step that's tripped up earlier projects — double check it's set before testing the live site, since a missing or malformed value is the most common cause of "login works locally but not in production."

## User Roles
- **Admin:** full access — manage pens, breeding, feeding, inventory, sales, generate reports, create user accounts
- **Staff:** operational access — log feeding, breeding, and sales records; adjust inventory stock; cannot view reports, delete records, or manage users

## Database Schema
See `server/db/schema.sql` for the full schema (8 tables: users, snail_pens, breeding_records, feeding_records, inventory, inventory_transactions, sales_records, reports_log) with indexes for query performance.

## Mapping to Project Objectives
| Objective | Implementation |
|---|---|
| (a) Design a computerized snail farm management system | Full system architecture below |
| (b) Implement a relational database | 8-table Postgres schema with foreign keys, constraints, indexes |
| (c) Automate feeding, breeding, inventory, sales | Dedicated CRUD modules for each |
| (d) Improve speed/accuracy of data processing | Indexed queries, server-side validation, transactional stock updates |
| (e) Secure storage and retrieval | JWT auth, bcrypt password hashing, role-based access control |
| (f) Generate reports automatically | `/api/reports/*` endpoints + Reports page with date filtering |
| (g) Evaluate system performance | To be completed in Chapter 4/5 of your thesis — testing and evaluation |
