import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { customerDatabase } from "./customer-auth";
import type { Prisma } from "@/generated/prisma/client";

export class CartError extends Error {}
const secretHash = (value: string) => createHash("sha256").update(value).digest("hex");
export const cartInclude = { items: { orderBy: { variantId: "asc" as const }, include: { variant: { include: { product: true, inventory: { include: { location: true } } } } } } };
export type FullCart = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
export async function ownedCart(create = false) {
  const db = customerDatabase();
  const jar = await cookies();
  const token = jar.get("adventuresmoto_cart")?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const found = await db.cart.findUnique({ where: { guestTokenHash: secretHash(token) }, include: cartInclude });
    if (found && found.expiresAt > new Date()) return found;
  }
  if (!create) return null;
  const secret = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 86400000);
  const cart = await db.cart.create({ data: { guestTokenHash: secretHash(secret), expiresAt }, include: cartInclude });
  jar.set("adventuresmoto_cart", secret, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
  return cart;
}
export function availableStock(v: FullCart["items"][number]["variant"]) {
  if (!v.isActive || v.archivedAt || v.product.archivedAt || v.product.status !== "PUBLISHED") return 0;
  return v.inventory.filter((i) => i.location.isActive && i.location.fulfillsOnline).reduce((sum, i) => sum + Math.max(0, i.onHand - i.reserved - i.safetyStock), 0);
}
export function cartView(cart: FullCart | null) {
  const items = (cart?.items ?? []).map(({ variant: v, quantity }) => {
    const unitPrice = Math.round(Number(v.price ?? v.product.price) * 100);
    return { id: v.id, sku: v.sku, name: v.product.name, slug: v.product.slug, option: v.size ?? v.name ?? "", image: v.product.imageUrl, quantity, unitPrice, lineTotal: unitPrice * quantity, available: availableStock(v) };
  });
  const quote = cart ? secretHash(JSON.stringify([cart.publicId, cart.version, items.map((i) => [i.id, i.quantity, i.unitPrice])])) : "";
  return { items, quote, version: cart?.version ?? 0, subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0), count: items.reduce((sum, i) => sum + i.quantity, 0) };
}
export type CartView = ReturnType<typeof cartView>;
export async function lockCart(tx: Prisma.TransactionClient, id: number, version: number) {
  const result = await tx.cart.updateMany({ where: { id, version }, data: { version: { increment: 1 } } });
  if (result.count !== 1) throw new CartError("Your cart changed in another window. Refresh and try again.");
}
