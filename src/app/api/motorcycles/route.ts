import { getDatabase } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const db = getDatabase();
    if (!db) return Response.json({ error: "Bike selection is temporarily unavailable." }, { status: 503 });
    const bikes = await db.motorcycleYear.findMany({ include: { model: { include: { make: true } } }, orderBy: { year: "desc" } });
    return Response.json({ bikes: bikes.map((b) => ({ id: b.id, make: b.model.make.name, model: b.model.name, year: b.year })) });
  } catch {
    return Response.json({ error: "Bike selection is temporarily unavailable." }, { status: 503 });
  }
}
