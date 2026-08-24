import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const extensionMimeTypes = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

export function detectImageMimeType(buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  const header = buffer.subarray(0, 256).toString("utf8").trimStart();

  if (header.startsWith("GIF87a") || header.startsWith("GIF89a")) {
    return "image/gif";
  }

  if (header.startsWith("<svg") || header.includes("<svg")) {
    return "image/svg+xml";
  }

  throw new Error("Unsupported or unrecognized image format");
}

export function expectedMimeTypeForFile(fileName) {
  return extensionMimeTypes.get(path.extname(fileName).toLowerCase()) ?? null;
}

export async function readLocalMedia(projectRoot, publicUrl, altText) {
  const storageKey = publicUrl.replace(/^\/+/, "");
  const filePath = path.join(projectRoot, "public", storageKey);
  const buffer = await readFile(filePath);

  return {
    record: {
      storageProvider: "local-public",
      storageKey,
      publicUrl,
      originalFileName: path.basename(filePath),
      mimeType: detectImageMimeType(buffer),
      altText,
      caption: null,
      width: null,
      height: null,
      byteSize: buffer.byteLength,
      checksum: createHash("sha256").update(buffer).digest("hex"),
      archivedAt: null,
    },
    filePath,
  };
}

export async function writeJson(filePath, value) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
