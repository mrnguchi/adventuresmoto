import env from '@next/env';
import nodemailer from 'nodemailer';
import mariadb from 'mariadb';
env.loadEnvConfig(process.cwd());
console.log(JSON.stringify({enabled:process.env.SMTP_ENABLED,host:process.env.SMTP_HOST,port:process.env.SMTP_PORT,from:process.env.SMTP_FROM,recipient:process.env.ORDER_EMAIL_TO,usernameConfigured:!!process.env.SMTP_USER,passwordConfigured:!!process.env.SMTP_PASSWORD}));
const u=new URL(process.env.DATABASE_URL);
console.log('Database host:',u.hostname);
let db;
try {
 db=await mariadb.createConnection({host:u.hostname,port:Number(u.port||3306),user:decodeURIComponent(u.username),password:decodeURIComponent(u.password),database:u.pathname.slice(1),connectTimeout:5000});
 console.log(await db.query('SELECT o.id,o.number,o.placedAt,n.audience,n.status,n.attempts,n.lastError FROM orders o LEFT JOIN order_notifications n ON n.orderId=o.id ORDER BY o.id DESC LIMIT 6'));
} catch(e) {console.log('Database diagnostic:',e.code);} finally {await db?.end();}
const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:process.env.SMTP_PORT==='465',requireTLS:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:10000});
try {await transport.verify();console.log('SMTP authentication: passed (no email sent)');} catch(e) {console.log('SMTP verification:',JSON.stringify({code:e.code,responseCode:e.responseCode,command:e.command}));} finally {transport.close();}
