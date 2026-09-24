import nodemailer from "nodemailer";
import { customerDatabase, digest } from "@/lib/customer-auth";
import { smtpReady } from "@/lib/order-email";
export const runtime = "nodejs";
const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Request not allowed." }, 403);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 16000) return reply({ error: "Your message is too long." }, 413);
    body = JSON.parse(raw);
  } catch { return reply({ error: "Invalid request." }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Invalid request." }, 400);
  if (body.website) return reply({ error: "Unable to submit this request." }, 400);
  const limits = { name: 100, email: 191, phone: 50, topic: 50, reference: 100, message: 5000 };
  const fields: Record<string, string> = {};
  for (const [key, max] of Object.entries(limits)) {
    if (typeof body[key] !== "string" || body[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body[key])) return reply({ error: `Please check ${key}.` }, 400);
    fields[key] = body[key].trim();
  }
  if (!fields.name || fields.message.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || !["Product advice", "Bike compatibility", "Order enquiry", "Delivery and returns", "Other"].includes(fields.topic)) return reply({ error: "Please enter your name, a valid email, topic and message (at least 10 characters)." }, 400);
  if (!smtpReady()) return reply({ error: "The contact form is temporarily unavailable. Please email sales@adventuresmoto.com or call 02 8348 5100." }, 503);
  try {
    const db = customerDatabase();
    // Shared database counters keep throttling effective across app instances.
    for (const identity of [fields.email.toLowerCase(), "all-requests"]) {
      const key = digest(`contact:${identity}`);
      await db.customerAuthAttempt.deleteMany({ where: { key, windowStart: { lt: new Date(Date.now() - 15 * 60000) } } });
      const attempt = await db.customerAuthAttempt.upsert({ where: { key }, create: { key, attempts: 1 }, update: { attempts: { increment: 1 } } });
      if (attempt.attempts > (identity === "all-requests" ? 50 : 5)) return reply({ error: "Too many requests. Please wait 15 minutes before trying again." }, 429);
    }
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_PORT === "465", requireTLS: true, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000, disableFileAccess: true, disableUrlAccess: true });
    try {
      const result = await transport.sendMail({ from: process.env.SMTP_FROM, to: process.env.ORDER_EMAIL_TO, replyTo: fields.email, subject: `Website enquiry: ${fields.topic}`, text: `Name: ${fields.name}\nEmail: ${fields.email}\nPhone: ${fields.phone || "Not provided"}\nTopic: ${fields.topic}\nOrder reference: ${fields.reference || "Not provided"}\n\n${fields.message}` });
      if (!result.accepted.length || result.rejected.length) throw new Error("Email rejected");
    } finally { transport.close(); }
    return reply({ sent: true });
  } catch { return reply({ error: "We couldn’t confirm delivery. Please try again or email sales@adventuresmoto.com directly." }, 503); }
}
