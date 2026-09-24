import { isAllowedOrigin } from "@/lib/request-origin";
import { customerDatabase, currentCustomer, customerSignIn, customerSignOut, digest } from "@/lib/customer-auth";
import { hashPassword, verifyPassword } from "@/lib/passwords.mjs";

export const runtime = "nodejs";
const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(_request: Request, { params }: { params: Promise<{ action: string }> }) {
  if ((await params).action !== "session") return reply({ error: "Not found." }, 404);
  try { return reply({ user: await currentCustomer() }); }
  catch { return reply({ error: "Account service is temporarily unavailable." }, 503); }
}
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  if (!isAllowedOrigin(request) || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Request not allowed." }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 8000) return reply({ error: "Request too large." }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object") return reply({ error: "Invalid request." }, 400);
    const { action } = await params;
    const db = customerDatabase();
    if (action === "logout") { await customerSignOut(); return reply({ user: null }); }
    if (action === "profile") {
      const customer = await currentCustomer();
      if (!customer) return reply({ error: "Please log in again." }, 401);
      const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
      const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";
      if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100 || phone.length > 50) return reply({ error: "Enter both names (up to 100 characters) and a phone number up to 50 characters." }, 400);
      await db.user.update({ where: { id: customer.id }, data: { firstName, lastName, phone: phone || null } });
      return reply({ user: await currentCustomer() });
    }
    if (action !== "login" && action !== "signup") return reply({ error: "Not found." }, 404);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 191 || !password || password.length > 128) return reply({ error: "Enter a valid email and password (up to 128 characters)." }, 400);
    const key = digest(email);
    await db.customerAuthAttempt.deleteMany({ where: { key, windowStart: { lt: new Date(Date.now() - 15 * 60 * 1000) } } });
    const attempt = await db.customerAuthAttempt.upsert({ where: { key }, create: { key, attempts: 1 }, update: { attempts: { increment: 1 } } });
    if (attempt.attempts > 6) return reply({ error: "Too many attempts. Try again in 15 minutes." }, 429);
    let userId: number;
    if (action === "signup") {
      const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
      const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
      if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100 || password.length < 12 || password !== body.passwordConfirmation || body.termsAccepted !== true) return reply({ error: "Enter both names, accept the terms, and use matching passwords of 12–128 characters." }, 400);
      if (await db.user.findUnique({ where: { email }, select: { id: true } })) return reply({ error: "An account already uses this email. Please log in." }, 409);
      // Public registration never accepts roles or permissions from the request.
      const user = await db.user.create({ data: { firstName, lastName, email, passwordHash: await hashPassword(password) } });
      userId = user.id;
    } else {
      const user = await db.user.findUnique({ where: { email } });
      const dummy = `scrypt$131072$8$1$${"0".repeat(32)}$${"0".repeat(128)}`;
      const valid = await verifyPassword(password, user?.passwordHash ?? dummy);
      if (!valid || !user || user.disabledAt) return reply({ error: "Email or password is incorrect." }, 401);
      userId = user.id;
    }
    await customerSignIn(userId);
    await db.customerAuthAttempt.deleteMany({ where: { key } });
    return reply({ user: await currentCustomer() });
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: "Invalid request." }, 400);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return reply({ error: "An account already uses this email. Please log in." }, 409);
    return reply({ error: "Account service is temporarily unavailable. Please try again." }, 503);
  }
}
