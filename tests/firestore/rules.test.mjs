/**
 * Firestore security rules + cloud-sync tests (#59). Needs the emulator:
 *   npm run test:rules
 * Uses Node's built-in test runner (Node 22.18+ loads the TypeScript core
 * module directly), outside the Vitest suite.
 */
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  syncUser,
  pushUser,
  cloudDocId,
  CONTACTS_COLLECTION,
  LEGACY_CONTACTS_COLLECTION,
} from "../../lib/cloud-sync-core.ts";

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-dunbarscircles",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});
after(async () => env?.cleanup());
beforeEach(async () => env.clearFirestore());

const alice = () => env.authenticatedContext("alice").firestore();
const bob = () => env.authenticatedContext("bob").firestore();
const anon = () => env.unauthenticatedContext().firestore();

const contact = (id, extra = {}) => ({
  id,
  name: `Person ${id}`,
  levelId: "inner-circle",
  ...extra,
});

async function seed(col, id, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), col, id), data);
  });
}

async function cloudDocs(col, uid) {
  let out = [];
  await env.withSecurityRulesDisabled(async (ctx) => {
    const snap = await getDocs(
      query(collection(ctx.firestore(), col), where("userId", "==", uid)),
    );
    out = snap.docs.map((d) => ({ ...d.data(), docId: d.id }));
  });
  return out;
}

// ---------------------------------------------------------------- rules

const C = CONTACTS_COLLECTION;

test("user_contacts: owner can create, read, update and delete own doc", async () => {
  const ref = doc(alice(), C, "alice_c1");
  await assertSucceeds(setDoc(ref, { userId: "alice", ...contact("c1") }));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(updateDoc(ref, { name: "Ada L." }));
  await assertSucceeds(deleteDoc(ref));
});

test("user_contacts: document id must be <uid>_<contactId>", async () => {
  await assertFails(
    setDoc(doc(alice(), C, "random-id"), { userId: "alice", ...contact("c1") }),
  );
  await assertFails(
    setDoc(doc(alice(), C, "bob_c1"), { userId: "alice", ...contact("c1") }),
  );
});

test("user_contacts: required fields and sizes are enforced", async () => {
  await assertFails(
    setDoc(doc(alice(), C, "alice_c1"), { userId: "alice", id: "c1" }),
  );
  await assertFails(
    setDoc(doc(alice(), C, "alice_c1"), {
      userId: "alice",
      ...contact("c1", { name: "x".repeat(201) }),
    }),
  );
});

test("user_contacts: cannot create a document for someone else", async () => {
  await assertFails(
    setDoc(doc(alice(), C, "alice_c2"), { userId: "bob", ...contact("c2") }),
  );
});

test("user_contacts: another user cannot read, change or delete", async () => {
  await seed(C, "alice_c3", { userId: "alice", ...contact("c3") });
  await assertFails(getDoc(doc(bob(), C, "alice_c3")));
  await assertFails(updateDoc(doc(bob(), C, "alice_c3"), { name: "hacked" }));
  await assertFails(deleteDoc(doc(bob(), C, "alice_c3")));
});

test("user_contacts: owner cannot reassign a document to another user", async () => {
  await seed(C, "alice_c4", { userId: "alice", ...contact("c4") });
  await assertFails(updateDoc(doc(alice(), C, "alice_c4"), { userId: "bob" }));
});

test("user_contacts: signed-out visitors have no access", async () => {
  await seed(C, "alice_c5", { userId: "alice", ...contact("c5") });
  await assertFails(getDoc(doc(anon(), C, "alice_c5")));
  await assertFails(
    setDoc(doc(anon(), C, "alice_c6"), { userId: "alice", ...contact("c6") }),
  );
});

test("user_contacts: filtered query works, unfiltered list fails", async () => {
  await seed(C, "alice_c7", { userId: "alice", ...contact("c7") });
  await seed(C, "bob_c8", { userId: "bob", ...contact("c8") });
  const mine = await assertSucceeds(
    getDocs(query(collection(alice(), C), where("userId", "==", "alice"))),
  );
  assert.equal(mine.size, 1);
  await assertFails(getDocs(collection(alice(), C)));
});

test("legacy contacts: owner may read and delete, nobody may write", async () => {
  const L = LEGACY_CONTACTS_COLLECTION;
  await seed(L, "old1", { userId: "alice", ...contact("c1") });
  await assertSucceeds(getDoc(doc(alice(), L, "old1")));
  await assertFails(getDoc(doc(bob(), L, "old1")));
  await assertFails(
    setDoc(doc(alice(), L, "old2"), { userId: "alice", ...contact("c2") }),
  );
  await assertFails(updateDoc(doc(alice(), L, "old1"), { name: "x" }));
  await assertSucceeds(deleteDoc(doc(alice(), L, "old1")));
});

test("any other collection is closed", async () => {
  await assertFails(setDoc(doc(alice(), "other", "x"), { userId: "alice" }));
  await assertFails(getDoc(doc(alice(), "relationship_levels", "x")));
});

// ---------------------------------------------------------- cloud-sync

test("sync: migrates legacy docs, de-duplicates, merges with local", async () => {
  // Legacy collection: the old save path wrote a new doc on every save, so
  // the same contact appears several times, with Firestore Timestamps.
  const older = Timestamp.fromDate(new Date("2026-01-01T00:00:00Z"));
  const newer = Timestamp.fromDate(new Date("2026-03-01T00:00:00Z"));
  await seed(LEGACY_CONTACTS_COLLECTION, "auto1", {
    userId: "alice",
    ...contact("c1", {
      name: "Old name",
      updatedAt: older,
      lastContact: older,
    }),
  });
  await seed(LEGACY_CONTACTS_COLLECTION, "auto2", {
    userId: "alice",
    ...contact("c1", {
      name: "Newer name",
      updatedAt: newer,
      lastContact: newer,
    }),
  });
  await seed(LEGACY_CONTACTS_COLLECTION, "auto3", {
    userId: "alice",
    ...contact("c2"),
  });
  // An old auto-id document in user_contacts from the previous sync engine.
  await seed(C, "autoX", { userId: "alice", ...contact("c3") });
  // Bob's data must be untouched.
  await seed(LEGACY_CONTACTS_COLLECTION, "bobOld", {
    userId: "bob",
    ...contact("b1"),
  });

  const local = [contact("c4", { updatedAt: "2026-05-01T00:00:00.000Z" })];
  const r = await syncUser(alice(), "alice", local);

  assert.deepEqual(r.merged.map((c) => c.id).sort(), ["c1", "c2", "c3", "c4"]);
  const c1 = r.merged.find((c) => c.id === "c1");
  assert.equal(c1.name, "Newer name");
  assert.equal(c1.lastContact, "2026-03-01T00:00:00.000Z"); // Timestamp -> ISO
  assert.equal(r.migrated, 3);

  const cloud = await cloudDocs(C, "alice");
  assert.deepEqual(
    cloud.map((d) => d.docId).sort(),
    ["c1", "c2", "c3", "c4"].map((id) => cloudDocId("alice", id)),
  );
  assert.equal(
    (await cloudDocs(LEGACY_CONTACTS_COLLECTION, "alice")).length,
    0,
  );
  assert.equal((await cloudDocs(LEGACY_CONTACTS_COLLECTION, "bob")).length, 1);
});

test("sync: repeated pushes are idempotent and deletions propagate", async () => {
  const local = [contact("a"), contact("b"), contact("c")];
  await syncUser(alice(), "alice", local);
  await pushUser(alice(), "alice", local);
  await pushUser(alice(), "alice", local);
  assert.equal((await cloudDocs(C, "alice")).length, 3);

  const r = await pushUser(alice(), "alice", [contact("a"), contact("c")]);
  assert.equal(r.deleted, 1);
  assert.deepEqual((await cloudDocs(C, "alice")).map((d) => d.docId).sort(), [
    cloudDocId("alice", "a"),
    cloudDocId("alice", "c"),
  ]);

  await pushUser(alice(), "alice", []);
  assert.equal((await cloudDocs(C, "alice")).length, 0);
});

test("sync: local-only fields stay local; built-in demo people never upload", async () => {
  await syncUser(alice(), "alice", [
    contact("k", { firestoreId: "x", syncStatus: "pending", x: 1, y: 2 }),
    contact("sample_1"),
  ]);
  const cloud = await cloudDocs(C, "alice");
  assert.equal(cloud.length, 1);
  for (const f of ["firestoreId", "syncStatus", "x", "y"]) {
    assert.equal(f in cloud[0], false, `${f} leaked to cloud`);
  }
  assert.equal(cloud[0].userId, "alice");
});

test("sync: a second device gets the first device's contacts", async () => {
  await syncUser(alice(), "alice", [contact("p1"), contact("p2")]);
  const second = await syncUser(alice(), "alice", []);
  assert.deepEqual(second.merged.map((c) => c.id).sort(), ["p1", "p2"]);
});
