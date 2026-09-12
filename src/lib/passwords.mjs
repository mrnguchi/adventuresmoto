import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const options = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64, options);
  return `scrypt$131072$8$1$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof encoded !== "string") return false;
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt" || parts[1] !== "131072" || parts[2] !== "8" || parts[3] !== "1"
    || !/^[a-f0-9]{32}$/.test(parts[4]) || !/^[a-f0-9]{128}$/.test(parts[5])) return false;
  const key = await derive(password, parts[4], 64, options);
  return timingSafeEqual(key, Buffer.from(parts[5], "hex"));
}
