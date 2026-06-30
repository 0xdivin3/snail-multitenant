// middleware/auth.js
import jwt from "jsonwebtoken";

// Verifies JWT and attaches decoded user payload (incl. organization_id) to req.user
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, organization_id }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Restricts a route to specific roles, e.g. authorize('admin', 'super_admin')
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }
    next();
  };
}

// Blocks super_admin from farm-data routes (pens, breeding, feeding, etc).
// super_admin manages the platform, not any one farm's day-to-day records —
// this keeps that boundary enforced at the route level, not just by convention.
export function requireTenantUser(req, res, next) {
  if (!req.user || req.user.role === "super_admin") {
    return res.status(403).json({
      message: "Platform admins don't have a farm workspace. Log in as a farm Admin or Staff user instead.",
    });
  }
  if (!req.user.organization_id) {
    return res.status(403).json({ message: "Your account is not linked to an organization." });
  }
  next();
}

// Only the platform super_admin may proceed.
export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== "super_admin") {
    return res.status(403).json({ message: "This action is restricted to platform administrators." });
  }
  next();
}
