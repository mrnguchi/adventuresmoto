import nextEnv from "@next/env";
import mariadb from "mariadb";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { hashPassword } from "../src/lib/passwords.mjs";

nextEnv.loadEnvConfig(process.cwd());

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error("Run this command directly in an interactive terminal so your password can be hidden.");
  process.exit(1);
}

let hidden = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!hidden) process.stdout.write(chunk, encoding);
    callback();
  },
});
const terminal = createInterface({ input: process.stdin, output, terminal: true });
async function secret(prompt) {
  process.stdout.write(prompt);
  hidden = true;
  try { return await terminal.question(""); }
  finally { hidden = false; process.stdout.write("\n"); }
}

let connection;
try {
  console.log("Create a new Adventures Moto admin. Existing accounts will not be changed.");
  const email = (await terminal.question("Admin email: ")).trim().toLowerCase();
  const firstName = (await terminal.question("First name: ")).trim();
  const lastName = (await terminal.question("Last name: ")).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 191
    || !firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
    throw new Error("INPUT_INVALID");
  }
  const password = await secret("Admin password (hidden, at least 12 characters): ");
  const confirmation = await secret("Confirm password (hidden): ");
  if (password.length < 12 || password.length > 128 || password !== confirmation) {
    throw new Error("PASSWORD_INVALID");
  }
  const url = new URL(process.env.DATABASE_URL);
  connection = await mariadb.createConnection({
    host: url.hostname, port: Number(url.port || 3306),
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    database: url.pathname.slice(1), connectTimeout: 5000,
  });
  const hash = await hashPassword(password);
  await connection.beginTransaction();
  const existing = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) throw new Error("ACCOUNT_EXISTS");
  const result = await connection.query(
    "INSERT INTO users (publicId, email, passwordHash, firstName, lastName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))",
    [randomBytes(15).toString("hex"), email, hash, firstName, lastName],
  );
  const userId = Number(result.insertId);
  await connection.query("INSERT INTO roles (code, name) VALUES ('ADMIN', 'Administrator') ON DUPLICATE KEY UPDATE code = VALUES(code)");
  const [role] = await connection.query("SELECT id FROM roles WHERE code = 'ADMIN'");
  const permissions = ["catalogue.read", "catalogue.write", "catalogue.publish", "inventory.adjust", "orders.manage", "reviews.moderate", "users.manage"];
  for (const code of permissions) {
    await connection.query("INSERT INTO permissions (code) VALUES (?) ON DUPLICATE KEY UPDATE code = VALUES(code)", [code]);
    await connection.query("INSERT INTO role_permissions (roleId, permissionId) SELECT ?, id FROM permissions WHERE code = ? ON DUPLICATE KEY UPDATE permissionId = VALUES(permissionId)", [role.id, code]);
  }
  await connection.query("INSERT INTO user_roles (userId, roleId) VALUES (?, ?)", [userId, role.id]);
  await connection.query("INSERT INTO audit_events (actorId, action, entityType, entityId, changes, createdAt) VALUES (?, 'admin.bootstrap', 'User', ?, ?, UTC_TIMESTAMP(3))",
    [userId, String(userId), JSON.stringify({ source: "local-terminal", role: "ADMIN" })]);
  await connection.commit();
  console.log(`Admin created successfully: ${email}`);
  console.log("Sign in at /admin/login with this account.");
} catch (error) {
  if (connection) await connection.rollback().catch(() => {});
  const known = {
    INPUT_INVALID: "Enter a valid email and both names (up to 100 characters each).",
    PASSWORD_INVALID: "Passwords must match and contain 12–128 characters. Nothing was created.",
    ACCOUNT_EXISTS: "That email already exists. No account was changed or granted admin access.",
  };
  console.error(known[error.message] ?? `Admin creation failed (${error.code ?? "configuration error"}). No credentials are displayed.`);
  process.exitCode = 1;
} finally {
  terminal.close();
  if (connection) await connection.end();
}
