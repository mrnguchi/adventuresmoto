// Opt-in integration check against the local development server and database.
// Creates isolated temporary records and removes only those records in finally.
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import nextEnv from '@next/env';
import mariadb from 'mariadb';
import { hashPassword } from '../src/lib/passwords.mjs';
nextEnv.loadEnvConfig(process.cwd());
const base = 'http://localhost:3000';
const url = new URL(process.env.DATABASE_URL);
assert.ok(['localhost', '127.0.0.1'].includes(url.hostname), 'Only run against a local database.');
const db = await mariadb.createConnection({host:url.hostname, port:Number(url.port || 3306), user:decodeURIComponent(url.username), password:decodeURIComponent(url.password), database:url.pathname.slice(1)});
const suffix = randomBytes(8).toString('hex');
const email = `admin-test-${suffix}@example.invalid`, password = randomBytes(24).toString('hex');
let userId, categoryId, productId, upload, cookie = '';
const post = (route, body, headers = {}) => fetch(`${base}/api/admin/${route}`, {method:'POST', headers:{origin:base, 'content-type':'application/json', cookie, ...headers}, body:JSON.stringify(body)});
const assertMissing = async (slug) => { const response = await fetch(`${base}/products/${slug}`); assert.ok(response.status === 404 || (await response.text()).includes('NEXT_HTTP_ERROR_FALLBACK;404')); };
try {
  const result = await db.query('INSERT INTO users (publicId,email,passwordHash,firstName,lastName,createdAt,updatedAt) VALUES (?,?,?,?,?,NOW(3),NOW(3))', [suffix,email,await hashPassword(password),'Integration','Test']);
  userId = Number(result.insertId);
  await db.query("INSERT INTO user_roles (userId,roleId) SELECT ?,id FROM roles WHERE code='ADMIN'", [userId]);
  const anonymous = await fetch(`${base}/admin`, {redirect:'manual'});
  assert.ok(anonymous.status === 307 || (await anonymous.text()).includes('NEXT_REDIRECT;replace;/admin/login;307;'));
  assert.equal((await post('products/save', {})).status,401);
  assert.equal((await post('login', {email,password}, {origin:'https://example.invalid'})).status,403);
  assert.equal((await post('login', {email,password:'wrong'})).status,401);
  const signedIn = await post('login', {email,password});
  assert.equal(signedIn.status,200,await signedIn.text());
  cookie = signedIn.headers.get('set-cookie').split(';')[0];
  await db.query('UPDATE users SET disabledAt=NOW(3) WHERE id=?',[userId]);
  assert.equal((await post('products/save',{})).status,401,'Disabled users cannot mutate');
  await db.query('UPDATE users SET disabledAt=NULL WHERE id=?',[userId]);
  for (const route of ['admin','admin/products','admin/products/new','admin/categories','admin/brands','admin/inventory','admin/activity']) {
    const page = await fetch(`${base}/${route}`, {headers:{cookie}});
    assert.equal(page.status,200,route);
    assert.ok(!(await page.text()).includes('Something went wrong'),route);
  }
  const categorySlug = `test-category-${suffix}`;
  const createdCategory = await post('categories', {name:`Test category ${suffix}`,slug:categorySlug,parentId:null});
  assert.equal(createdCategory.status,200,await createdCategory.text());
  categoryId = (await db.query('SELECT id FROM categories WHERE slug=?',[categorySlug]))[0].id;
  const form = new FormData();
  form.set('image', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')], {type:'image/png'}), 'test.png');
  const uploaded = await fetch(`${base}/api/admin/upload`, {method:'POST',headers:{origin:base,cookie},body:form});
  assert.equal(uploaded.status,200); upload = (await uploaded.json()).url;
  assert.equal((await fetch(`${base}${upload}`)).status,200);
  const product = {version:0,name:`Test jacket ${suffix}`,slug:`test-jacket-${suffix}`,categoryId,brandId:null,status:'DRAFT',wearable:true,price:'120.00',compareAtPrice:'150.00',description:'Test description.',highlights:'Waterproof\nVentilated',images:[upload],videoUrl:'',seoTitle:'Test SEO title',seoDescription:'Test SEO description',variants:[{sku:`TEST-${suffix}`,size:'M',price:'',quantity:4,active:true}]};
  assert.equal((await post('products/save',{...product,price:'-1'})).status,400);
  const created = await post('products/save',product);
  assert.equal(created.status,200,await created.clone().text()); productId = (await created.json()).id;
  await assertMissing(product.slug);
  product.id = productId;
  product.version = (await db.query('SELECT version FROM products WHERE id=?',[productId]))[0].version;
  product.variants[0].id = (await db.query('SELECT id FROM product_variants WHERE productId=?',[productId]))[0].id;
  const generatedSku = (await db.query('SELECT sku FROM product_variants WHERE id=?',[product.variants[0].id]))[0].sku;
  assert.match(generatedSku, /^AM-[A-F0-9]{32}$/);
  product.variants[0].stockVersion = (await db.query('SELECT version FROM inventory_balances WHERE variantId=?',[product.variants[0].id]))[0].version;
  product.status = 'PUBLISHED';
  const published = await post('products/save',product);
  assert.equal(published.status,200,await published.text());
  assert.equal((await db.query('SELECT sku FROM product_variants WHERE id=?',[product.variants[0].id]))[0].sku, generatedSku, 'SKU stays unchanged when editing');
  const detail = await fetch(`${base}/products/${product.slug}`);
  assert.equal(detail.status,200); assert.ok((await detail.text()).includes('Test SEO title'));
  const collection = await (await fetch(`${base}/collections/${categorySlug}`)).text();
  assert.ok(collection.includes(product.name)); assert.ok(collection.includes('Search size'));
  assert.equal((await post('products/save',product)).status,400,'Reject stale edits');
  product.version++;
  assert.equal((await post('products/save',{...product,variants:[{...product.variants[0],stockVersion:999999}]})).status,400,'Reject stale stock');
  product.wearable=false;
  product.variants[0].quantity=0;
  const depleted = await post('products/save',product);
  assert.equal(depleted.status,200,await depleted.text());
  const [balance] = await db.query('SELECT onHand FROM inventory_balances WHERE variantId=?',[product.variants[0].id]);
  assert.equal(balance.onHand,0);
  const nonwearable = await (await fetch(`${base}/collections/${categorySlug}`)).text();
  assert.ok(!nonwearable.includes('Search size'),'No size filters on non-wearable products');
  const archived = await post('products/archive',{id:productId,version:product.version+1});
  assert.equal(archived.status,200,await archived.text());
  await assertMissing(product.slug);
  assert.equal((await post('logout',{})).status,200);
  assert.equal((await post('products/save',product)).status,401,'Revoked session');
  console.log('PASS: authentication, route protection, CSRF, admin pages, upload, draft, publishing, storefront, wearable filters, stale edits, inventory, archive and logout.');
} finally {
  if (productId) {
    await db.query('DELETE FROM inventory_movements WHERE inventoryId IN (SELECT id FROM inventory_balances WHERE variantId IN (SELECT id FROM product_variants WHERE productId=?))',[productId]);
    await db.query('DELETE FROM inventory_balances WHERE variantId IN (SELECT id FROM product_variants WHERE productId=?)',[productId]);
    await db.query('DELETE FROM variant_options WHERE productId=?',[productId]);
    await db.query('DELETE FROM products WHERE id=?',[productId]);
  }
  if (categoryId) await db.query('DELETE FROM categories WHERE id=?',[categoryId]);
  if (upload) { await db.query('DELETE FROM media_assets WHERE publicUrl=?',[upload]); await unlink(`public${upload}`); }
  if (userId) { await db.query('DELETE FROM audit_events WHERE actorId=?',[userId]); await db.query('DELETE FROM users WHERE id=?',[userId]); }
  await db.query('DELETE FROM admin_login_attempts WHERE `key`=?',[createHash('sha256').update(email).digest('hex')]);
  await db.end();
}
