import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
import { readFileSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function seedVolunteers() {
  // 1. List ALL Firebase Auth users
  const listResult = await auth.listUsers(1000);
  console.log(`Found ${listResult.users.length} total Auth users.\n`);

  // 2. Check which ones already exist in `users` collection (participants)
  let created = 0, skipped = 0;

  for (const user of listResult.users) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      console.log(`  SKIP (participant): ${user.email}`);
      skipped++;
      continue;
    }

    // 3. Create volunteer doc
    const name = user.displayName || user.email.split('@')[0];
    await db.collection('volunteers').doc(user.uid).set({
      name,
      email: user.email,
      club: '',
      role: 'volunteer'
    });
    console.log(`  ✓ CREATED volunteer: ${user.email} → name: "${name}"`);
    created++;
  }

  console.log(`\nDone! Created ${created} volunteer docs, skipped ${skipped} participants.`);
  process.exit(0);
}

seedVolunteers().catch(err => { console.error(err); process.exit(1); });
