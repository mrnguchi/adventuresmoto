import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/passwords.mjs";

test("password hashing uses unique salts and rejects incorrect passwords", async () => {
  const password = "Test-only password @ with spaces";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.ok(first.length <= 255);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("incorrect password", first), false);
});

test("malformed hashes and untrusted work factors are rejected", async () => {
  for (const hash of [null, "plain-text", "scrypt$999999999$8$1$bad$bad", "scrypt$131072$8$1$bad$bad"]) {
    assert.equal(await verifyPassword("test", hash), false);
  }
});
