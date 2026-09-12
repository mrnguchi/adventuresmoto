import nodemailer from "nodemailer";
import { customerDatabase } from "./customer-auth";

export function smtpReady() {
  return process.env.SMTP_ENABLED === "true" && ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "ORDER_EMAIL_TO"].every((key) => !!process.env[key]);
}
export async function deliverOrderEmails(orderId: number) {
  if (!smtpReady()) return;
  const db = customerDatabase();
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, notifications: true } });
  if (!order) return;
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_PORT === "465", requireTLS: true, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000, disableFileAccess: true, disableUrlAccess: true });
  const address = order.shippingAddress as Record<string, string>;
  const policy = order.policySnapshot as Record<string, unknown> | null;
  const lines = order.items.map((i) => `${i.productName}\nSKU: ${i.sku} | ${(i.optionsSnapshot as { label?: string } | null)?.label || "Standard"}\n${i.quantity} x AUD ${i.unitPrice.toFixed(2)} = AUD ${i.lineTotal.toFixed(2)}`).join("\n\n");
  const details = `Order request ${order.number}\n\nNo payment has been taken. Availability, delivery charges and payment arrangements must be confirmed by the store.\n\n${lines}\n\nItems subtotal: AUD ${order.subtotal.toFixed(2)}\nDelivery: to be confirmed\n\nCustomer: ${address.firstName} ${address.lastName}\nEmail: ${order.email}\nPhone: ${address.phone}\nDelivery address: ${address.address}, ${address.city}, ${address.region}, ${address.postcode}, ${address.country}\n\nNotes: ${String(policy?.notes || "None")}`;
  await Promise.all(order.notifications.map(async (notification) => {
    if (notification.status === "SENT") return;
    const lockedAt = new Date();
    const claim = await db.orderNotification.updateMany({ where: { id: notification.id, OR: [{ status: { in: ["PENDING", "FAILED"] } }, { status: "SENDING", lockedAt: { lt: new Date(Date.now() - 5 * 60000) } }] }, data: { status: "SENDING", lockedAt, attempts: { increment: 1 }, lastError: null } });
    if (!claim.count) return;
    try {
      const result = await transport.sendMail({ from: process.env.SMTP_FROM, to: notification.audience === "STORE" ? process.env.ORDER_EMAIL_TO : order.email, replyTo: notification.audience === "STORE" ? order.email : process.env.ORDER_EMAIL_TO, subject: `${notification.audience === "STORE" ? "New order request" : "Your order request"} ${order.number}`, text: details, messageId: `<order-${order.publicId}-${notification.audience.toLowerCase()}@adventuresmoto.local>` });
      if (!result.accepted.length || result.rejected.length) throw new Error("Delivery rejected");
      await db.orderNotification.updateMany({ where: { id: notification.id, status: "SENDING", lockedAt }, data: { status: "SENT", sentAt: new Date(), lockedAt: null, lastError: null } });
    } catch {
      await db.orderNotification.updateMany({ where: { id: notification.id, status: "SENDING", lockedAt }, data: { status: "FAILED", lockedAt: null, lastError: "SMTP delivery failed. Check mail configuration and retry." } });
    }
  }));
}
