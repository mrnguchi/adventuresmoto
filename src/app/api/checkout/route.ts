import { randomBytes } from "node:crypto";
import { customerDatabase, currentCustomer, digest } from "@/lib/customer-auth";
import { ownedCart, cartView, cartInclude, lockCart, CartError } from "@/lib/cart";
import { deliverOrderEmails } from "@/lib/order-email";
export const runtime = "nodejs";
const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Request not allowed." }, 403);
  try {
    const raw = await request.text(); if (raw.length > 12000) return reply({ error: "Request too large." }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object") throw new CartError("Invalid order request.");
    const field = (key: string, max: number, required = true) => { const value = typeof body[key] === "string" ? body[key].trim() : ""; if ((required && !value) || value.length > max || /[\u0000-\u0008]/.test(value)) throw new CartError(`Please check ${key}.`); return value; };
    const contact = { firstName: field("firstName",100), lastName: field("lastName",100), phone: field("phone",50), address: field("address",255), city: field("city",100), region: field("region",100), postcode: field("postcode",20), country: field("country",100) };
    const email = field("email",191).toLowerCase(), notes = field("notes",2000,false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.accepted !== true || !Number.isInteger(body.version) || typeof body.quote !== "string") throw new CartError("Check your email and confirm that this is an unpaid order request.");
    const cart = await ownedCart(); if (!cart) throw new CartError("Your cart has expired. Please add your items again.");
    const checkoutKey = `${cart.publicId}:${body.version}`;
    const db = customerDatabase();
    const customer = await currentCustomer();
    let order = await db.order.findUnique({ where: { checkoutKey } });
    if (!order) {
      const key = digest(`checkout:${email}`);
      await db.customerAuthAttempt.deleteMany({ where: { key, windowStart: { lt: new Date(Date.now() - 15 * 60000) } } });
      const attempt = await db.customerAuthAttempt.upsert({ where: { key }, create: { key, attempts: 1 }, update: { attempts: { increment: 1 } } });
      if (attempt.attempts > 6) throw new CartError("Too many order attempts. Please wait 15 minutes before trying again.");
      order = await db.$transaction(async (tx) => {
        await lockCart(tx, cart.id, body.version);
        const fresh = await tx.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
        if (!fresh) throw new CartError("Cart not found.");
        const view = cartView({ ...fresh, version: body.version });
        if (!view.items.length) throw new CartError("Your cart is empty.");
        if (fresh.items.some((i) => i.variant.product.currency !== "AUD") || view.subtotal > 999999999999) throw new CartError("This order requires assistance. Please contact the store.");
        if (view.quote !== body.quote) throw new CartError("Prices or cart contents changed. Refresh and review your order again.");
        if (view.items.some((i) => i.quantity > i.available)) throw new CartError("Some items no longer have enough stock. Please update your cart.");
        const total = (view.subtotal / 100).toFixed(2);
        const created = await tx.order.create({ data: { number: `AM-${randomBytes(8).toString("hex").toUpperCase()}`, checkoutKey, userId: customer?.id, email, shippingAddress: contact, billingAddress: contact, shippingMethod: "To be confirmed", policySnapshot: { type: "MANUAL_REQUEST", notes, paymentTaken: false, shippingPending: true, stockReserved: false }, subtotal: total, grandTotal: total,
          items: { create: view.items.map((i) => ({ variantId: i.id, productName: i.name, sku: i.sku, optionsSnapshot: { label: i.option }, quantity: i.quantity, unitPrice: (i.unitPrice / 100).toFixed(2), lineTotal: (i.lineTotal / 100).toFixed(2) })) },
          notifications: { create: [{ audience: "STORE" }, { audience: "CUSTOMER" }] } } });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return created;
      }, { timeout: 15000 });
    }
    // The durable order/outbox has committed before any external email attempt.
    await deliverOrderEmails(order.id).catch(() => {});
    return reply({ number: order.number, subtotal: Number(order.subtotal), email: order.email });
  } catch (error) { return reply({ error: error instanceof CartError ? error.message : "Unable to submit right now. Retry this request; it will not create a duplicate order." }, error instanceof CartError ? 409 : 500); }
}
