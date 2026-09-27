import { db } from "@/db";
import { users } from "@/db/schema";
import {
  requireAdmin,
  hasPermission,
  hashPassword,
  validateStrongPassword,
  logAdminActivity,
  type UserRole,
} from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const VALID_ROLES: Set<UserRole> = new Set(["super_admin", "admin", "manager", "staff", "customer"]);

export async function GET(req: Request) {
  const admin = await requireAdmin("users.view");
  if (!admin) return Response.json({ error: "Unauthorized: users.view permission required" }, { status: 403 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = 25;
  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        district: users.district,
        emailVerified: users.emailVerified,
        isBlocked: users.isBlocked,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ c: sql<number>`count(*)` }).from(users),
  ]);
  return Response.json({ users: rows, total: Number(countRows[0]?.c ?? 0) });
}

export async function POST(req: Request) {
  const admin = await requireAdmin("users.manage");
  if (!admin) return Response.json({ error: "Unauthorized: users.manage permission required" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, email, phone, password, role } = body;
    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const pwCheck = validateStrongPassword(String(password));
    if (!pwCheck.valid) {
      return Response.json({ error: pwCheck.error }, { status: 400 });
    }

    const targetRole = (role || "staff") as UserRole;
    if (!VALID_ROLES.has(targetRole)) {
      return Response.json({ error: "Invalid user role" }, { status: 400 });
    }
    if ((targetRole === "super_admin" || targetRole === "admin") && !hasPermission(admin.role, "users.roles")) {
      return Response.json({ error: "Only Super Admin can create Admin or Super Admin accounts" }, { status: 403 });
    }

    const inserted = await db
      .insert(users)
      .values({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        passwordHash: hashPassword(String(password)),
        role: targetRole,
        emailVerified: true,
      })
      .returning();

    await logAdminActivity({
      actor: admin,
      action: "user.create",
      entityType: "user",
      entityId: inserted[0].id,
      summary: `Created user "${inserted[0].name}" (${inserted[0].email}) with role "${inserted[0].role}"`,
      details: { email: inserted[0].email, role: inserted[0].role },
      req,
    });

    return Response.json({ ok: true, user: inserted[0] });
  } catch (e) {
    console.error("admin user POST error", e);
    return Response.json({ error: "Failed to create user (email may already exist)" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin("users.manage");
  if (!admin) return Response.json({ error: "Unauthorized: users.manage permission required" }, { status: 403 });

  try {
    const body = await req.json();
    const { id, role, isBlocked, emailVerified, newPassword } = body;
    if (!id) return Response.json({ error: "User ID is required" }, { status: 400 });

    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) return Response.json({ error: "User not found" }, { status: 404 });
    const target = existing[0];

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (role !== undefined && role !== target.role) {
      if (!VALID_ROLES.has(role as UserRole)) {
        return Response.json({ error: "Invalid role" }, { status: 400 });
      }
      // Changing roles to/from super_admin or admin requires users.roles (Super Admin)
      if (
        (role === "super_admin" || role === "admin" || target.role === "super_admin") &&
        !hasPermission(admin.role, "users.roles")
      ) {
        return Response.json({ error: "Only Super Admin can assign or modify Admin/Super Admin roles" }, { status: 403 });
      }
      update.role = role;
    }

    if (isBlocked !== undefined) {
      if (target.id === admin.id) {
        return Response.json({ error: "You cannot block your own account" }, { status: 400 });
      }
      update.isBlocked = !!isBlocked;
    }

    if (emailVerified !== undefined) {
      update.emailVerified = !!emailVerified;
    }

    if (newPassword) {
      const pwCheck = validateStrongPassword(String(newPassword));
      if (!pwCheck.valid) return Response.json({ error: pwCheck.error }, { status: 400 });
      update.passwordHash = hashPassword(String(newPassword));
      update.failedLoginAttempts = 0;
      update.lockedUntil = null;
    }

    const updated = await db.update(users).set(update).where(eq(users.id, id)).returning();

    await logAdminActivity({
      actor: admin,
      action: role !== undefined ? "user.role_update" : "user.update",
      entityType: "user",
      entityId: updated[0].id,
      summary: `Updated user "${updated[0].name}" (${updated[0].email}) — role: ${updated[0].role}, blocked: ${updated[0].isBlocked}`,
      details: { previousRole: target.role, newRole: updated[0].role, isBlocked: updated[0].isBlocked },
      req,
    });

    return Response.json({ ok: true, user: updated[0] });
  } catch (e) {
    console.error("admin user PATCH error", e);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
