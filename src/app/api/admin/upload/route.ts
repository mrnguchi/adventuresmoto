import { isAllowedOrigin } from "@/lib/request-origin";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAdmin } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return Response.json({ error: "Request not allowed." }, { status: 403 });
  const admin = await getAdmin();
  if (!admin?.permissions.includes("catalogue.write")) return Response.json({ error: "Sign in with catalogue editing permission." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > 6 * 1024 * 1024) return Response.json({ error: "Maximum upload size is 5 MB." }, { status: 413 });
  try {
    const file = (await request.formData()).get("image");
    if (!(file instanceof File) || file.size < 12 || file.size > 5 * 1024 * 1024) return Response.json({ error: "Choose an image up to 5 MB." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const extension = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "jpg" : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : null;
    if (!extension) return Response.json({ error: "Only PNG, JPEG and WebP images are accepted." }, { status: 400 });
    const directory = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    return Response.json({ url: `/images/uploads/${filename}` });
  } catch { return Response.json({ error: "Upload failed. Please try again." }, { status: 500 }); }
}
