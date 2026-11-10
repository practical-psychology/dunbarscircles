/**
 * Firestore security rules tests (#59). Needs the Firestore emulator:
 *   npm run test:rules
 * Uses Node's built-in test runner, outside the Vitest suite.
 */
import { test, before, after, beforeEach } from "node:test";
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
} from "firebase/firestore";

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

async function seed(col, id, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), col, id), data);
  });
}

for (const col of ["user_contacts", "contacts"]) {
  test(`${col}: owner can create, read, update and delete`, async () => {
    const ref = doc(alice(), col, "c1");
    await assertSucceeds(setDoc(ref, { userId: "alice", name: "Ada" }));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { name: "Ada L." }));
    await assertSucceeds(deleteDoc(ref));
  });

  test(`${col}: cannot create a document for someone else`, async () => {
    await assertFails(
      setDoc(doc(alice(), col, "c2"), { userId: "bob", name: "X" }),
    );
  });

  test(`${col}: another user cannot read, change or delete`, async () => {
    await seed(col, "c3", { userId: "alice", name: "Ada" });
    await assertFails(getDoc(doc(bob(), col, "c3")));
    await assertFails(updateDoc(doc(bob(), col, "c3"), { name: "hacked" }));
    await assertFails(deleteDoc(doc(bob(), col, "c3")));
  });

  test(`${col}: owner cannot reassign a document to another user`, async () => {
    await seed(col, "c4", { userId: "alice", name: "Ada" });
    await assertFails(updateDoc(doc(alice(), col, "c4"), { userId: "bob" }));
  });

  test(`${col}: signed-out visitors have no access`, async () => {
    await seed(col, "c5", { userId: "alice", name: "Ada" });
    await assertFails(getDoc(doc(anon(), col, "c5")));
    await assertFails(
      setDoc(doc(anon(), col, "c6"), { userId: "alice", name: "X" }),
    );
  });

  test(`${col}: owner query filtered by userId works, unfiltered list fails`, async () => {
    await seed(col, "c7", { userId: "alice", name: "Ada" });
    await seed(col, "c8", { userId: "bob", name: "Bea" });
    const mine = await assertSucceeds(
      getDocs(query(collection(alice(), col), where("userId", "==", "alice"))),
    );
    if (mine.size !== 1) throw new Error(`expected 1, got ${mine.size}`);
    await assertFails(getDocs(collection(alice(), col)));
  });
}

test("any other collection is closed", async () => {
  await assertFails(setDoc(doc(alice(), "other", "x"), { userId: "alice" }));
  await assertFails(getDoc(doc(alice(), "other", "x")));
});
