import { isAllowedOrigin } from "@/lib/request-origin";
import { customerDatabase } from "@/lib/customer-auth";
import { ownedCart, cartView, cartInclude, availableStock, lockCart, CartError } from "@/lib/cart";
export const runtime = "nodejs";
const reply = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  try { return reply(cartView(await ownedCart())); } catch { return reply({ error: "Unable to load your cart. Please try again." }, 503); }
}
export async function POST(request: Request) {
  if (!isAllowedOrigin(request) || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Request not allowed." }, 403);
  try {
    const raw = await request.text(); if (raw.length > 4000) return reply({ error: "Request too large." }, 413);
    const body = JSON.parse(raw);
    if (!body || !["add", "set", "remove"].includes(body.action) || typeof body.sku !== "string" || body.sku.length > 191) throw new CartError("Invalid cart item.");
    if (body.action !== "remove" && (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 99)) throw new CartError("Quantity must be between 1 and 99.");
    const cart = await ownedCart(body.action === "add");
    if (!cart) throw new CartError("Your cart is empty.");
    const db = customerDatabase();
    await db.$transaction(async (tx) => {
      if (body.action !== "add" && body.version !== cart.version) throw new CartError("Your cart changed. Refresh before updating it.");
      await lockCart(tx, cart.id, cart.version);
      const v = await tx.productVariant.findUnique({ where: { sku: body.sku }, include: { product: true, inventory: { include: { location: true } } } });
      if (!v) throw new CartError("Product not found.");
      const previous = cart.items.find((i) => i.variantId === v.id);
      if (body.action === "remove") { await tx.cartItem.deleteMany({ where: { cartId: cart.id, variantId: v.id } }); return; }
      const quantity = body.action === "add" ? (previous?.quantity ?? 0) + body.quantity : body.quantity;
      if (quantity > 99 || quantity > availableStock(v)) throw new CartError("The requested quantity is not available. Please reduce it.");
      if (!previous && cart.items.length >= 30) throw new CartError("Your cart can contain up to 30 different items.");
      await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: v.id } }, create: { cartId: cart.id, variantId: v.id, quantity }, update: { quantity } });
    });
    return reply(cartView(await db.cart.findUnique({ where: { id: cart.id }, include: cartInclude })));
  } catch (error) { return reply({ error: error instanceof CartError ? error.message : "Unable to update your cart. Please refresh and try again." }, error instanceof CartError ? 409 : 500); }
}
