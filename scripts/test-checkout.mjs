import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import env from '@next/env';
import mariadb from 'mariadb';
import { hashPassword } from '../src/lib/passwords.mjs';
env.loadEnvConfig(process.cwd());
assert.notEqual(process.env.SMTP_ENABLED,'true','Disable SMTP for this local test to avoid sending real emails.');
const u=new URL(process.env.DATABASE_URL); assert.ok(['127.0.0.1','localhost'].includes(u.hostname));
const db=await mariadb.createConnection({host:u.hostname,port:Number(u.port || 3306),user:decodeURIComponent(u.username),password:decodeURIComponent(u.password),database:u.pathname.slice(1),timezone:"Z"});
const base=process.env.TEST_BASE_URL || 'http://localhost:3000',suffix=randomBytes(8).toString('hex'),sku=`CART-TEST-${suffix}`,email=`checkout-${suffix}@example.invalid`;
let productId,variantId,locationId,cookie='',cartId,adminId;
const post=(path,body,extra={})=>fetch(base+path,{method:'POST',headers:{origin:base,'content-type':'application/json',cookie,...extra},body:JSON.stringify(body)});
const view=async()=>await (await fetch(base+'/api/cart',{headers:{cookie}})).json();
try {
  productId=Number((await db.query("INSERT INTO products (name,slug,price,status,updatedAt) VALUES (?,?,'12.34','PUBLISHED',NOW(3))",['Checkout test',`checkout-test-${suffix}`])).insertId);
  variantId=Number((await db.query('INSERT INTO product_variants (productId,sku,size,inStock) VALUES (?,?,?,1)',[productId,sku,'M'])).insertId);
  locationId=Number((await db.query('INSERT INTO stock_locations (code,name,isActive,fulfillsOnline) VALUES (?,?,1,1)',[`TEST-${suffix}`,'Checkout test warehouse'])).insertId);
  await db.query('INSERT INTO inventory_balances (variantId,locationId,onHand,reserved,safetyStock,version,updatedAt) VALUES (?,?,5,1,1,0,NOW(3))',[variantId,locationId]);
  assert.equal((await post('/api/cart',{action:'add',sku,quantity:1},{origin:'https://example.invalid'})).status,403);
  const added=await post('/api/cart',{action:'add',sku,quantity:2}); assert.equal(added.status,200,await added.clone().text()); cookie=added.headers.get('set-cookie').split(';')[0];
  const hash=createHash('sha256').update(cookie.split('=')[1]).digest('hex'); cartId=(await db.query('SELECT id FROM carts WHERE guestTokenHash=?',[hash]))[0].id;
  let cart=await view(); assert.equal(cart.count,2); assert.equal(cart.subtotal,2468); assert.equal(cart.items[0].available,3);
  assert.equal((await (await fetch(base+'/api/cart')).json()).count,0,'Another visitor cannot see this cart');
  assert.equal((await post('/api/cart',{action:'add',sku,quantity:2})).status,409,'Reject excess stock');
  assert.equal((await post('/api/cart',{action:'set',sku,quantity:1,version:cart.version})).status,200);
  cart=await view(); assert.equal(cart.count,1);
  assert.equal((await post('/api/cart',{action:'remove',sku,version:cart.version})).status,200); assert.equal((await view()).count,0);
  assert.equal((await post('/api/cart',{action:'add',sku,quantity:2})).status,200); cart=await view();
  const input={firstName:'Checkout',lastName:'Test',email,phone:'123456789',address:'1 Test Street',city:'Sydney',region:'NSW',postcode:'2000',country:'Australia',notes:'Test only',accepted:true,version:cart.version,quote:cart.quote,grandTotal:0};
  assert.equal((await post('/api/checkout',{...input,accepted:false})).status,409);
  await db.query('UPDATE products SET price=15 WHERE id=?',[productId]);
  assert.equal((await post('/api/checkout',input)).status,409,'Reject stale price');
  cart=await view(); input.quote=cart.quote;
  await db.query('UPDATE inventory_balances SET onHand=2 WHERE variantId=?',[variantId]);
  assert.equal((await post('/api/checkout',input)).status,409,'Recheck stock');
  await db.query('UPDATE inventory_balances SET onHand=5 WHERE variantId=?',[variantId]);
  const submitted=await post('/api/checkout',input); assert.equal(submitted.status,200,await submitted.clone().text()); const receipt=await submitted.json();
  const repeated=await post('/api/checkout',input); assert.equal(repeated.status,200); assert.equal((await repeated.json()).number,receipt.number);
  assert.equal((await view()).count,0);
  const orders=await db.query('SELECT * FROM orders WHERE email=?',[email]); assert.equal(orders.length,1); assert.equal(Number(orders[0].subtotal),30); assert.equal(orders[0].status,'PENDING');
  const items=await db.query('SELECT * FROM order_items WHERE orderId=?',[orders[0].id]); assert.equal(items[0].quantity,2); assert.equal(Number(items[0].unitPrice),15);
  const emails=await db.query('SELECT * FROM order_notifications WHERE orderId=?',[orders[0].id]); assert.equal(emails.length,2); assert.ok(emails.every((n)=>n.status===(process.env.TEST_EXPECT_EMAIL_STATUS || 'PENDING')));
  assert.equal((await post('/api/admin/orders',{id:orders[0].id,action:'email'})).status,403);
  const adminEmail=`checkout-admin-${suffix}@example.invalid`, adminPassword=randomBytes(20).toString('hex');
  adminId=Number((await db.query('INSERT INTO users (publicId,email,passwordHash,firstName,lastName,updatedAt) VALUES (?,?,?,?,?,NOW(3))',[suffix,adminEmail,await hashPassword(adminPassword),'Checkout','Admin test'])).insertId);
  await db.query("INSERT INTO user_roles (userId,roleId) SELECT ?,id FROM roles WHERE code='ADMIN'",[adminId]);
  const adminLogin=await post('/api/admin/login',{email:adminEmail,password:adminPassword}); assert.equal(adminLogin.status,200); const adminCookie=adminLogin.headers.get('set-cookie').split(';')[0];
  for(const path of ['/admin/orders',`/admin/orders/${orders[0].id}`]) { const response=await fetch(base+path,{headers:{cookie:adminCookie}}); assert.equal(response.status,200); assert.ok((await response.text()).includes(receipt.number)); }
  const stamp=(await db.query("SELECT CAST(updatedAt AS CHAR) AS stored FROM orders WHERE id=?",[orders[0].id]))[0].stored.replace(" ","T")+"Z";
  const changed=await post('/api/admin/orders',{id:orders[0].id,action:'status',status:'CONFIRMED',updatedAt:stamp},{cookie:adminCookie}); assert.equal(changed.status,200,await changed.clone().text());
  assert.equal((await post('/api/admin/orders',{id:orders[0].id,action:'status',status:'CANCELLED',updatedAt:stamp},{cookie:adminCookie})).status,409,'Reject stale order edits');
  const retried=await post('/api/admin/orders',{id:orders[0].id,action:'email'},{cookie:adminCookie}); assert.equal(retried.status,process.env.TEST_EXPECT_EMAIL_STATUS==='FAILED'?200:409);
  assert.equal((await db.query('SELECT onHand FROM inventory_balances WHERE variantId=?',[variantId]))[0].onHand,5,'Requests do not reserve or deduct stock');
  for(const path of ['/cart','/checkout']) {const page=await fetch(base+path); assert.equal(page.status,200); assert.ok(!(await page.text()).includes('NEXT_HTTP_ERROR_FALLBACK'));}
  console.log('PASS: persistent isolated cart, quantities/removal, stock limits, price revalidation, checkout snapshots, duplicate retry, pending emails, admin protection and cart clearing.');
} finally {
  await db.query('DELETE FROM order_notifications WHERE orderId IN (SELECT id FROM orders WHERE email=?)',[email]);
  await db.query('DELETE FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE email=?)',[email]);
  await db.query('DELETE FROM orders WHERE email=?',[email]);
  if(adminId) { await db.query('DELETE FROM audit_events WHERE actorId=?',[adminId]); await db.query('DELETE FROM users WHERE id=?',[adminId]); }
  await db.query('DELETE FROM admin_login_attempts WHERE `key`=?',[createHash('sha256').update(`checkout-admin-${suffix}@example.invalid`).digest('hex')]);
  await db.query('DELETE FROM customer_auth_attempts WHERE `key`=?',[createHash('sha256').update(`checkout:${email}`).digest('hex')]);
  if(cartId) await db.query('DELETE FROM carts WHERE id=?',[cartId]);
  if(variantId) {await db.query('DELETE FROM cart_items WHERE variantId=?',[variantId]); await db.query('DELETE FROM inventory_balances WHERE variantId=?',[variantId]);}
  if(productId) await db.query('DELETE FROM products WHERE id=?',[productId]);
  if(locationId) await db.query('DELETE FROM stock_locations WHERE id=?',[locationId]);
  await db.end();
}
