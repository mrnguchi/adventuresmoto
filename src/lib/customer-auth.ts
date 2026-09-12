import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getDatabase } from "@/lib/db";

export const customerCookie = "adventuresmoto_customer";
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function customerDatabase() {
  const db = getDatabase();
  if (!db) throw new Error("Database unavailable");
  return db;
}
export async function currentCustomer() {
  const token = (await cookies()).get(customerCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await customerDatabase().customerSession.findUnique({ where: { tokenHash: digest(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || session.user.disabledAt) return null;
  const { id, firstName, lastName, email, phone } = session.user;
  return { id, firstName, lastName, email, phone };
}
export async function customerSignOut() {
  const jar = await cookies();
  const token = jar.get(customerCookie)?.value;
  if (token) await customerDatabase().customerSession.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(customerCookie);
}
export async function customerSignIn(userId: number) {
  await customerSignOut();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await customerDatabase().customerSession.create({ data: { userId, tokenHash: digest(token), expiresAt } });
  (await cookies()).set(customerCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}
