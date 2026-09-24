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
  const customerItems = order.items.map((item) => {
    const option = (item.optionsSnapshot as { label?: string } | null)?.label;
    return `${item.productName}${option ? ` (${option})` : ""}\nQuantity: ${item.quantity}\nAUD ${item.unitPrice.toFixed(2)} each — AUD ${item.lineTotal.toFixed(2)}`;
  }).join("\n\n");
  const acknowledgement = `Hi ${address.firstName || "there"},\n\nThank you for choosing Adventures Moto. We’ve received your order request.\n\nYour reference: ${order.number}\n\nWhat happens next?\nOur team will review your requested items and contact you to confirm availability, delivery costs and payment arrangements.\n\nThis email acknowledges your request; your order is not yet confirmed and no payment has been taken. Stock has not been reserved.\n\nYOUR REQUESTED ITEMS\n\n${customerItems}\n\nItems subtotal: AUD ${order.subtotal.toFixed(2)}\nDelivery: to be confirmed\nFinal total: to be confirmed with you before payment\n\nDELIVERY DETAILS\n${address.firstName} ${address.lastName}\n${address.address}\n${address.city}, ${address.region} ${address.postcode}\n${address.country}${policy?.notes ? `\n\nYour note: ${String(policy.notes)}` : ""}\n\nNeed to change something or have a question? Reply to this email and include your order reference.\n\nThank you,\nThe Adventures Moto team`;
  await Promise.all(order.notifications.map(async (notification) => {
    if (notification.status === "SENT") return;
    const lockedAt = new Date();
    const claim = await db.orderNotification.updateMany({ where: { id: notification.id, OR: [{ status: { in: ["PENDING", "FAILED"] } }, { status: "SENDING", lockedAt: { lt: new Date(Date.now() - 5 * 60000) } }] }, data: { status: "SENDING", lockedAt, attempts: { increment: 1 }, lastError: null } });
    if (!claim.count) return;
    try {
      const result = await transport.sendMail({ from: process.env.SMTP_FROM, to: notification.audience === "STORE" ? process.env.ORDER_EMAIL_TO : order.email, replyTo: notification.audience === "STORE" ? order.email : process.env.ORDER_EMAIL_TO, subject: `${notification.audience === "STORE" ? "New order request" : "We’ve received your order request —"} ${order.number}`, text: notification.audience === "STORE" ? details : acknowledgement, messageId: `<order-${order.publicId}-${notification.audience.toLowerCase()}@adventuresmoto.local>` });
      if (!result.accepted.length || result.rejected.length) throw new Error("Delivery rejected");
      await db.orderNotification.updateMany({ where: { id: notification.id, status: "SENDING", lockedAt }, data: { status: "SENT", sentAt: new Date(), lockedAt: null, lastError: null } });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      const reasons: Record<string, string> = {
        EAUTH: "SMTP authentication failed. Check the mailbox username and password.",
        ESOCKET: "SMTP connection failed. Check network access and TLS certificate trust.",
        ETIMEDOUT: "SMTP connection timed out. Check the mail host, port and outbound network access.",
        EDNS: "SMTP hostname could not be resolved. Check the mail host and DNS.",
        EENVELOPE: "SMTP rejected the sender or recipient. Check the configured email addresses.",
      };
      await db.orderNotification.updateMany({ where: { id: notification.id, status: "SENDING", lockedAt }, data: { status: "FAILED", lockedAt: null, lastError: reasons[code] ?? "SMTP delivery failed. Check mail configuration and retry." } });
    }
  }));
}
