import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
import { readFileSync, writeFileSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Event titles as stored in users.events (see src/data/events-data.js)
const EXPORTS = [
  { title: 'LINE FOLLOWER', file: 'line-follower-participants.csv' },
  { title: 'ROBOFORGE', file: 'roboforge-participants.csv' },
];

const COLUMNS = [
  'fullName', 'idNumber', 'email', 'contactNumber', 'academicYear', 'event',
  'paymentMethod', 'amount', 'transactionId', 'authorizedByVolunteer', 'authorizedByClub', 'createdAt',
];

const escape = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

for (const { title, file } of EXPORTS) {
  const snap = await db.collection('users').where('events', 'array-contains', title).get();
  const rows = snap.docs
    .map(d => d.data())
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    .map(u => COLUMNS.map(c => escape(u[c])).join(','));
  writeFileSync(file, [COLUMNS.join(','), ...rows].join('\n') + '\n');
  console.log(`${title}: ${rows.length} participants -> ${file}`);
}
