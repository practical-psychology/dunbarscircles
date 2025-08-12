import { ContactStorage } from "./contact-storage";
import { testFirebaseConnection as runDiagnostics } from "./firebase-diagnostics";
import type { Person } from "@/types/relationships";

export async function testFirebaseConnection(): Promise<boolean> {
  // Run comprehensive diagnostics
  const isWorking = await runDiagnostics();

  if (!isWorking) {
    return false;
  }

  // Additional test with contact storage
  try {
    await ContactStorage.loadContactsFromFirebase();
    return true;
  } catch (error) {
    console.error("Contact storage test failed:", error);
    return false;
  }
}

export async function addTestContact(): Promise<void> {
  const testContact: Person = {
    id: `test_${Date.now()}`,
    name: "Test Contact",
    levelId: "inner-circle",
    lastContact: new Date(),
    contactFrequency: 1,
    strength: 0.9,
    decayRate: 0.001,
    platform: "Test Platform",
  };

  await ContactStorage.addAllContacts([testContact], "manual");
}

export async function clearTestContacts(): Promise<void> {
  try {
    const contacts = await ContactStorage.loadAllContacts();
    const testContacts = contacts.filter((c) =>
      c.name.startsWith("Test Contact"),
    );

    if (testContacts.length > 0) {
      console.log(`Found ${testContacts.length} test contacts to clean up`);
      // For now, we'll just log this - in a real implementation,
      // we'd need a method to delete specific contacts
    }
  } catch (error) {
    console.error("Failed to clear test contacts:", error);
  }
}
