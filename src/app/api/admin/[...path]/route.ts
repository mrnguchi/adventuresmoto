import { revalidatePath } from "next/cache";
import { database, getAdmin, login, logout } from "@/lib/admin/auth";
import { InputError, parseProduct } from "@/lib/admin/product-input";
import { saveProduct } from "@/lib/admin/products";

export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const reply = (data: object, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
  // Cookies authenticate requests; require a same-origin JSON submission as CSRF protection.
  if (request.headers.get("origin") !== new URL(request.url).origin || !request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Request not allowed." }, 403);
  const path = (await params).path.join("/");
  try {
    const raw = await request.text();
    if (raw.length > 200000) return reply({ error: "Request too large." }, 413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object") return reply({ error: "Invalid request." }, 400);
    if (path === "login") {
      if (typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 191 || body.password.length > 128) return reply({ error: "Email or password is incorrect." }, 400);
      const result = await login(body.email.trim().toLowerCase(), body.password);
      return reply(result, result.status);
    }
    if (path === "logout") { await logout(); return reply({ ok: true }); }
    const admin = await getAdmin();
    if (!admin) return reply({ error: "Your session has expired. Sign in again." }, 401);
    const can = (permission: string) => admin.permissions.includes(permission);
    if (!can("catalogue.write")) return reply({ error: "You do not have permission to edit the catalogue." }, 403);
    if (path === "products/save") {
      const input = parseProduct(body);
      if (!can("inventory.adjust") || !can("catalogue.publish")) return reply({ error: "Product editing requires inventory and publishing permissions." }, 403);
      const id = await saveProduct(input, admin.id);
      revalidatePath("/admin", "layout"); revalidatePath("/store"); revalidatePath("/collections", "layout"); revalidatePath("/products", "layout");
      return reply({ ok: true, id });
    }
    if (path === "products/archive") {
      if (!can("catalogue.publish")) return reply({ error: "Publishing permission is required." }, 403);
      if (!Number.isSafeInteger(body.id) || !Number.isSafeInteger(body.version)) throw new InputError("Invalid product.");
      await database().$transaction(async (tx) => {
        const result = await tx.product.updateMany({ where: { id: body.id, version: body.version, archivedAt: null }, data: { archivedAt: new Date(), status: "DRAFT", version: { increment: 1 } } });
        if (!result.count) throw new InputError("Product changed. Refresh and try again.");
        await tx.auditEvent.create({ data: { actorId: admin.id, action: "product.archive", entityType: "Product", entityId: String(body.id) } });
      });
      revalidatePath("/admin", "layout"); revalidatePath("/store"); revalidatePath("/products", "layout");
      return reply({ ok: true });
    }
    if (path === "categories" || path === "brands") {
      if (!can("catalogue.publish")) return reply({ error: "Publishing permission is required." }, 403);
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      if (!name || name.length > 191 || slug.length > 191 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new InputError("Enter a name and a valid lowercase URL slug.");
      await database().$transaction(async (tx) => {
        const data = { name, slug, status: "PUBLISHED" as const, publishedAt: new Date() };
        let record;
        if (path === "categories") {
          const parentId = body.parentId === "" || body.parentId === null ? null : Number(body.parentId);
          if (parentId !== null && (!Number.isSafeInteger(parentId) || !await tx.category.findFirst({ where: { id: parentId, archivedAt: null } }))) throw new InputError("Parent category not found.");
          record = await tx.category.create({ data: { ...data, parentId } });
          for (const [displayOrder, code] of ["brand", "availability", "price"].entries()) await tx.categoryFilter.create({ data: { categoryId: record.id, code, label: code, kind: code.toUpperCase() as "BRAND" | "AVAILABILITY" | "PRICE", displayOrder } });
        } else record = await tx.brand.create({ data });
        await tx.auditEvent.create({ data: { actorId: admin.id, action: `${path}.create`, entityType: path, entityId: String(record.id) } });
      });
      revalidatePath("/admin", "layout");
      return reply({ ok: true });
    }
    return reply({ error: "Action not found." }, 404);
  } catch (error) {
    if (error instanceof InputError) return reply({ error: error.message }, 400);
    if (error instanceof SyntaxError) return reply({ error: "Invalid request." }, 400);
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") return reply({ error: "That slug, SKU or name is already in use. Choose a unique value." }, 409);
    console.error("Admin action failed", { path, code: typeof error === "object" && error && "code" in error ? error.code : "unknown" });
    return reply({ error: "We couldn't save your changes. Please try again." }, 500);
  }
}
