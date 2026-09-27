import { cookies } from "next/headers";
import { db } from "@/db";
import { users, sessions, adminActivityLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes, pbkdf2Sync } from "crypto";

const COOKIE_NAME = "mrtom_session";
const SESSION_DAYS = 30;

export type UserRole = "super_admin" | "admin" | "manager" | "staff" | "customer";

export type Permission =
  | "dashboard.view"
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "categories.view"
  | "categories.create"
  | "categories.edit"
  | "categories.delete"
  | "orders.view"
  | "orders.status"
  | "orders.courier"
  | "orders.refund"
  | "coupons.view"
  | "coupons.manage"
  | "coupons.delete"
  | "reviews.moderate"
  | "reviews.delete"
  | "users.view"
  | "users.manage"
  | "users.roles"
  | "logs.view"
  | "uploads.create"
  | "system.manage";

const ROLE_PERMISSIONS: Record<UserRole, Permission[] | "*"> = {
  super_admin: "*",
  admin: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "categories.view",
    "categories.create",
    "categories.edit",
    "categories.delete",
    "orders.view",
    "orders.status",
    "orders.courier",
    "orders.refund",
    "coupons.view",
    "coupons.manage",
    "coupons.delete",
    "reviews.moderate",
    "reviews.delete",
    "users.view",
    "users.manage",
    "logs.view",
    "uploads.create",
  ],
  manager: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.edit",
    "categories.view",
    "categories.create",
    "categories.edit",
    "orders.view",
    "orders.status",
    "orders.courier",
    "coupons.view",
    "coupons.manage",
    "reviews.moderate",
    "uploads.create",
  ],
  staff: [
    "dashboard.view",
    "products.view",
    "categories.view",
    "orders.view",
    "orders.status",
    "orders.courier",
  ],
  customer: [],
};

export function isStaffRole(role?: string | null): boolean {
  return role === "super_admin" || role === "admin" || role === "manager" || role === "staff";
}

export function hasPermission(role: string | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as UserRole];
  if (!perms) return false;
  if (perms === "*") return true;
  return perms.includes(perm);
}

const WEAK_PASSWORDS = new Set([
  "admin123",
  "admin1234",
  "password",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "qwerty123",
]);

export function validateStrongPassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, error: "This password is too common and insecure. Choose a stronger password." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must include at least one uppercase letter (A-Z)" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must include at least one lowercase letter (a-z)" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must include at least one number (0-9)" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: "Password must include at least one special character (!@#$%^&*)" };
  }
  return { valid: true };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const verify = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return verify === hash;
  } catch {
    return false;
  }
}

export function generateSecureToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

export function generateNumericOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ userId, token, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    sameSite: "lax",
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
  }
  jar.delete(COOKIE_NAME);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      address: users.address,
      district: users.district,
      avatarColor: users.avatarColor,
      emailVerified: users.emailVerified,
      isBlocked: users.isBlocked,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);
  if (rows.length === 0) return null;
  if (rows[0].isBlocked) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
    return null;
  }
  const sess = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (sess.length === 0 || new Date(sess[0].expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token)).catch(() => {});
    return null;
  }
  return rows[0];
}

export async function requireAdmin(permission?: Permission) {
  const user = await getSessionUser();
  if (!user || !isStaffRole(user.role)) return null;
  if (permission && !hasPermission(user.role, permission)) return null;
  return user;
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export async function logAdminActivity(params: {
  actor: SessionUser;
  action: string;
  entityType: "product" | "category" | "order" | "user" | "coupon" | "review" | "system";
  entityId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
  req?: Request;
}) {
  try {
    const ip =
      params.req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      params.req?.headers.get("x-real-ip") ||
      "127.0.0.1";
    await db.insert(adminActivityLogs).values({
      actorId: params.actor.id,
      actorName: params.actor.name,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      summary: params.summary,
      details: params.details || {},
      ipAddress: ip,
    });
  } catch (e) {
    console.error("Failed to log admin activity", e);
  }
}
