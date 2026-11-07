// seed-relationships.js

const admin = require('firebase-admin');

// 1. Initialize the Admin SDK
// Set GOOGLE_APPLICATION_CREDENTIALS_FILE to the path of the dunbarscircles
// service-account key (never commit it).
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE;
if (!keyPath) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS_FILE to your service-account key path');
  process.exit(1);
}
const serviceAccount = require(require('path').resolve(keyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Define the data array
const relationshipLevelsData = [
    {
        id: "inner-circle",
        name: "Inner Circle",
        order: 1,
        description: "Requires constant emotional maintenance, shared experiences, frequent contact.",
        contactFrequency: "Daily Contact",
        digitalParallel: "Subscription services you check compulsively – email, news apps, social feeds from your most important people.",
        maintenanceCost: "High but automatic; these relationships shape your daily mental landscape.",
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
        category: "intimate",
        mentalLoad: 95,
        examples: ["Spouse/Partner", "Best Friend", "Parent", "Child", "Sibling"]
    },
    {
        id: "sympathy-group",
        name: "Sympathy Group",
        order: 2,
        description: "Close friends you'd genuinely mourn if they died.",
        contactFrequency: "Weekly Contact",
        digitalParallel: "Weekly newsletters or podcasts you never miss – anticipated and valued content.",
        maintenanceCost: "Moderate but intentional; requires conscious effort to sustain.",
        color: "bg-orange-500",
        textColor: "text-orange-700",
        bgColor: "bg-orange-50",
        category: "intimate",
        mentalLoad: 80,
        examples: ["Close Work Friend", "College Roommate", "Neighbor", "Gym Buddy", "Book Club Friend"]
    },
    {
        id: "affinity-group",
        name: "Affinity Group",
        order: 3,
        description: "People you'd invite to a large party.",
        contactFrequency: "Monthly Contact",
        digitalParallel: "Monthly magazine subscriptions or services you engage with regularly but not constantly.",
        maintenanceCost: "Low to moderate; operates on social rhythms and life event triggers.",
        color: "bg-yellow-500",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        category: "intimate",
        mentalLoad: 60,
        examples: ["Coworker", "High School Friend", "Cousin", "Tennis Partner", "Former Colleague"]
    },
    {
        id: "active-network",
        name: "Active Network",
        order: 4,
        description: "People you could have a meaningful conversation with.",
        contactFrequency: "Quarterly Contact",
        digitalParallel: "Quarterly reports or seasonal check-ins that provide valuable but non-urgent updates.",
        maintenanceCost: "Minimal but strategic; maintained through social proof and mutual connections.",
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        category: "social",
        mentalLoad: 40,
        examples: ["Work Colleague", "Conference Contact", "Friend of Friend", "Local Business Owner"]
    },
    {
        id: "recognition-group",
        name: "Recognition Group",
        order: 5,
        description: "Faces and names you can match.",
        contactFrequency: "Yearly Contact",
        digitalParallel: "Annual services that you barely use but maintain \"just in case.\"",
        maintenanceCost: "Nearly effortless; sustained through algorithmic reminders and social platforms.",
        color: "bg-blue-500",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
        category: "social",
        mentalLoad: 25,
        examples: ["Barista", "Mail Carrier", "Neighbor", "Driver", "Doctor", "Teacher"]
    }
];

// 3. Execute the Batch Write
async function seedDatabase() {
    const batch = db.batch();
    const collectionRef = db.collection('relationship_levels');

    console.log("Starting batch write for 5 documents...");

    relationshipLevelsData.forEach((level) => {
        // Use the 'id' field as the explicit document ID
        const docRef = collectionRef.doc(level.id);
        batch.set(docRef, level);
    });

    try {
        await batch.commit();
        console.log("✅ Successfully created 'relationship_levels' collection and 5 documents.");
    } catch (error) {
        console.error("❌ Error performing batch write:", error);
    }
}

seedDatabase();