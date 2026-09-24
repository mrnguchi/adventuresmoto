import env from '@next/env';
import mariadb from 'mariadb';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
env.loadEnvConfig(process.cwd());
const url = new URL(process.env.DATABASE_URL);
if (!['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('This export must read the local database.');
const db = await mariadb.createConnection({ host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: url.pathname.slice(1) });
try {
  const admins = await db.query("SELECT DISTINCT u.email,u.passwordHash,u.firstName,u.lastName FROM users u JOIN user_roles ur ON ur.userId=u.id JOIN roles r ON r.id=ur.roleId WHERE r.code='ADMIN' AND u.disabledAt IS NULL");
  if (admins.length !== 1) throw new Error(`Found ${admins.length} active admins; select an account before exporting.`);
  const admin = admins[0];
  if (!admin.passwordHash) throw new Error('Admin has no password hash.');
  const permissions = await db.query("SELECT p.code FROM permissions p JOIN role_permissions rp ON rp.permissionId=p.id JOIN roles r ON r.id=rp.roleId WHERE r.code='ADMIN'");
  // Hex literals preserve exact bytes independently of SQL quote/escape modes.
  const sql = (value) => `CONVERT(0x${Buffer.from(value, 'utf8').toString('hex')} USING utf8mb4)`;
  const publicId = randomBytes(15).toString('hex');
  const lines = [
    '-- PRIVATE: contains an admin password hash. Do not commit or share.',
    '-- Select your production application database in phpMyAdmin before importing.',
    '-- Existing accounts with this email are left unchanged; no password is overwritten.',
    'START TRANSACTION;',
    `SET @import_admin_email = ${sql(admin.email)};`,
    `SET @import_admin_public_id = '${publicId}';`,
    `INSERT INTO users (publicId,email,passwordHash,firstName,lastName,createdAt,updatedAt) VALUES (@import_admin_public_id,@import_admin_email,${sql(admin.passwordHash)},${sql(admin.firstName)},${sql(admin.lastName)},UTC_TIMESTAMP(3),UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE id=id;`,
    'SET @import_admin_id = (SELECT id FROM users WHERE email=@import_admin_email AND publicId=@import_admin_public_id);',
    "INSERT INTO roles (code,name) SELECT 'ADMIN','Administrator' WHERE @import_admin_id IS NOT NULL ON DUPLICATE KEY UPDATE code=VALUES(code);",
    "SET @import_role_id = (SELECT id FROM roles WHERE code='ADMIN');",
  ];
  for (const { code } of permissions) {
    lines.push(`INSERT INTO permissions (code) SELECT ${sql(code)} WHERE @import_admin_id IS NOT NULL ON DUPLICATE KEY UPDATE code=VALUES(code);`);
    lines.push(`INSERT INTO role_permissions (roleId,permissionId) SELECT @import_role_id,id FROM permissions WHERE code=${sql(code)} AND @import_admin_id IS NOT NULL ON DUPLICATE KEY UPDATE permissionId=VALUES(permissionId);`);
  }
  lines.push('INSERT INTO user_roles (userId,roleId) SELECT @import_admin_id,@import_role_id WHERE @import_admin_id IS NOT NULL ON DUPLICATE KEY UPDATE roleId=VALUES(roleId);',
    'COMMIT;',
    "SELECT CASE WHEN @import_admin_id IS NULL THEN 'Skipped: email already exists; existing account unchanged.' ELSE 'Admin imported. Sign in with your local email and password.' END AS result;");
  await mkdir('private-exports', { recursive: true });
  await writeFile('private-exports/import-admin.sql', lines.join('\n') + '\n', { mode: 0o600 });
  console.log(`Created private-exports/import-admin.sql for ${admin.email}. Password hash copied without displaying it.`);
} finally { await db.end(); }
