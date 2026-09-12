import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords.mjs";

export const SESSION_COOKIE = "adventuresmoto_admin";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export function database() {
  const db = getDatabase();
  if (!db) throw new Error("Database is not configured.");
  return db;
}

export async function getAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await database().adminSession.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
  });
  if (!session || session.expiresAt <= new Date() || session.user.disabledAt) return null;
  const permissions = [...new Set(session.user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.code)))];
  if (!permissions.includes("catalogue.read")) return null;
  return { id: session.user.id, name: `${session.user.firstName} ${session.user.lastName}`, email: session.user.email, permissions };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function login(email: string, password: string) {
  const db = database();
  const key = hash(email);
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  await db.adminLoginAttempt.deleteMany({ where: { key, windowStart: { lt: cutoff } } });
  const attempt = await db.adminLoginAttempt.upsert({ where: { key }, create: { key, attempts: 1 }, update: { attempts: { increment: 1 } } });
  if (attempt.attempts > 6) return { error: "Too many attempts. Try again in 15 minutes.", status: 429 };
  const user = await db.user.findUnique({ where: { email }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
  const dummy = `scrypt$131072$8$1$${"0".repeat(32)}$${"0".repeat(128)}`;
  const valid = await verifyPassword(password, user?.passwordHash ?? dummy);
  if (!valid || !user || user.disabledAt || !user.roles.some(({ role }) => role.permissions.some(({ permission }) => permission.code === "catalogue.read"))) {
    return { error: "Email or password is incorrect.", status: 401 };
  }
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await db.$transaction(async (tx) => {
    const old = (await cookies()).get(SESSION_COOKIE)?.value;
    if (old) await tx.adminSession.deleteMany({ where: { tokenHash: hash(old) } });
    await tx.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await tx.adminSession.create({ data: { tokenHash: hash(token), userId: user.id, expiresAt } });
    await tx.adminLoginAttempt.deleteMany({ where: { key } });
  });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", expires: expiresAt });
  return { ok: true, status: 200 };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await database().adminSession.deleteMany({ where: { tokenHash: hash(token) } });
  jar.delete(SESSION_COOKIE);
}
