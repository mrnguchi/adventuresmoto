import nextEnv from "@next/env";
import mariadb from "mariadb";
const inheritedDatabaseUrl = Boolean(process.env.DATABASE_URL);
const environment = nextEnv.loadEnvConfig(process.cwd());
console.log({ inheritedDatabaseUrl, loadedFiles: environment.loadedEnvFiles.map((file) => file.path) });
let connection;
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log({ host: url.hostname, port: url.port, user: url.username, database: url.pathname.slice(1) });
  connection = await mariadb.createConnection({
    host: url.hostname, port: Number(url.port || 3306),
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    database: url.pathname.slice(1), connectTimeout: 5000,
  });
  console.log(await connection.query("SELECT VERSION() AS version, CURRENT_USER() AS account"));
  console.log(await connection.query("SHOW TABLES"));
} catch (error) {
  // Do not print connection strings or error messages that might contain secrets.
  console.error({ code: error.code, errno: error.errno, sqlState: error.sqlState });
  process.exitCode = 1;
} finally {
  if (connection) await connection.end();
}
