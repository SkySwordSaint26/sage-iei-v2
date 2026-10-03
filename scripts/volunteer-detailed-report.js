// Rebuilds SAGE_1.0_Volunteer_Detailed_Complete_Report.pdf from Firestore.
// Run: node scripts/volunteer-detailed-report.js   (needs ./serviceAccountKey.json and google-chrome)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
import { readFileSync, writeFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { resolve } from 'path';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const HTML = 'SAGE_1.0_Volunteer_Detailed_Complete_Report.html';
const PDF = 'SAGE_1.0_Volunteer_Detailed_Complete_Report.pdf';
// Section 3 order as in the original report; any other event is appended after these.
const EVENT_ORDER = ['MISSION: HIRE', 'GRID & PITCH', 'ARC FORGE', 'LINE FOLLOWER', 'ROBOFORGE', 'NEXT GEN PROTOCOL', 'STARK BLUEPRINT'];

// select() skips screenshotData, which is large
const snap = await db.collection('users')
  .select('fullName', 'idNumber', 'email', 'contactNumber', 'branch', 'academicYear', 'events', 'event',
    'paymentMethod', 'amount', 'authorizedByVolunteer', 'createdAt')
  .get();

const users = snap.docs.map(d => {
  const u = d.data();
  const events = u.events?.length ? u.events : (u.event || '').split(',').map(s => s.trim()).filter(Boolean);
  return { ...u, events, amount: Number(u.amount) || 0, volunteer: u.authorizedByVolunteer || 'UNKNOWN' };
});
// Codepoint order (uppercase before lowercase), matching the original
const byName = (a, b) => ((a.fullName || '') < (b.fullName || '') ? -1 : (a.fullName || '') > (b.fullName || '') ? 1 : 0);
users.sort(byName);

const groupBy = (list, keyFn) => {
  const m = new Map();
  for (const x of list) for (const k of [keyFn(x)].flat()) (m.get(k) || m.set(k, []).get(k)).push(x);
  return m;
};
const uniqueIds = (list) => new Set(list.map(u => (u.idNumber || '').toUpperCase())).size;
const sum = (list) => list.reduce((s, u) => s + u.amount, 0);

const byEvent = groupBy(users, u => u.events);
const byVolunteer = groupBy(users, u => u.volunteer);
const eventEntries = users.reduce((s, u) => s + u.events.length, 0);

const eventSummary = [...byEvent].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
const eventSections = [...byEvent].sort((a, b) => {
  const ia = EVENT_ORDER.indexOf(a[0]), ib = EVENT_ORDER.indexOf(b[0]);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a[0].localeCompare(b[0]);
});
const volunteers = [...byVolunteer].sort((a, b) => b[1].length - a[1].length || sum(b[1]) - sum(a[1]) || a[0].localeCompare(b[0]));

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const table = (headers, rows, cls = '') =>
  `<table class="${cls}"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>` +
  rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') + '</tbody></table>';

const html = `<!doctype html><html><head><meta charset="utf-8"><title>SAGE 1.0 — Registration Report</title><style>
@page { size: A4 landscape; margin: 12mm 10mm 14mm;
  @bottom-left { content: "SAGE 1.0 — Registration Report"; font: 8px Helvetica, Arial, sans-serif; color: #555; }
  @bottom-right { content: "Page " counter(page); font: 8px Helvetica, Arial, sans-serif; color: #555; } }
body { font: 7.5px Helvetica, Arial, sans-serif; color: #111; margin: 0; }
h1 { font-size: 14px; text-align: center; margin: 0 0 4px; }
.sub { text-align: center; font-size: 9px; margin-bottom: 14px; }
h2 { font-size: 11px; margin: 0 0 8px; }
h3 { font-size: 10px; margin: 14px 0 6px; }
section { break-before: page; }
section:first-of-type { break-before: auto; }
table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
table.narrow { width: auto; margin: 0 auto 8px; }
th { background: #1f3a5f; color: #fff; text-align: left; font-weight: bold; }
th, td { border: 0.5px solid #999; padding: 2px 4px; vertical-align: top; }
tr:nth-child(even) td { background: #f2f5f9; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
</style></head><body>
<h1>SAGE 1.0 — VOLUNTEER &amp; STUDENT REGISTRATION REPORT</h1>
<div class="sub">${users.length} registration records | ${uniqueIds(users)} unique students | ${eventEntries} event entries | ${byVolunteer.size} volunteers | Total amount: ₹${sum(users).toLocaleString('en-IN')}</div>

<section><h2>1. ALL STUDENTS — COMPLETE DATA</h2>${table(
  ['Participant Name', 'College ID', 'Email', 'Contact Number', 'Branch', 'Academic Year', 'Number of Events', 'Events', 'Payment Method', 'Amount (INR)', 'Authorized By Volunteer'],
  users.map(u => [u.fullName, u.idNumber, u.email, u.contactNumber, u.branch, u.academicYear, u.events.length, u.events.join(', '), u.paymentMethod, u.amount, u.volunteer]))}</section>

<section><h2>2. EVENT-WISE REGISTRATION SUMMARY</h2>${table(
  ['Event', 'Registrations', 'Unique Students'],
  eventSummary.map(([e, list]) => [e, list.length, uniqueIds(list)]), 'narrow')}</section>

<section><h2>3. STUDENTS REGISTERED IN EACH EVENT</h2>${eventSections.map(([e, list]) => `<h3>${esc(e)}</h3>${table(
  ['Participant Name', 'College ID', 'Email', 'Branch', 'Academic Year', 'Authorized By Volunteer', 'Payment Method', 'Amount (INR)'],
  list.map(u => [u.fullName, u.idNumber, u.email, u.branch, u.academicYear, u.volunteer, u.paymentMethod, u.amount]))}`).join('')}</section>

<section><h2>4. VOLUNTEER-WISE REGISTRATION SUMMARY</h2>${table(
  ['Volunteer', 'Students', 'Registrations', 'Amount (INR)'],
  volunteers.map(([v, list]) => [v, uniqueIds(list), list.length, sum(list)]), 'narrow')}</section>

<section><h2>5. VOLUNTEER-WISE — WHO REGISTERED WHOM</h2>${volunteers.map(([v, list]) => `<h3>${esc(v)}</h3>${table(
  ['Participant Name', 'College ID', 'Events', 'Payment Method', 'Amount (INR)', 'Registration Timestamp'],
  list.map(u => [u.fullName, u.idNumber, u.events.join(', '), u.paymentMethod, u.amount, u.createdAt]))}`).join('')}</section>
</body></html>`;

writeFileSync(HTML, html);
execFileSync('google-chrome', ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${resolve(PDF)}`, `file://${resolve(HTML)}`], { stdio: 'ignore' });
console.log(`${users.length} records, ${eventEntries} event entries, ${byVolunteer.size} volunteers, ₹${sum(users)} -> ${PDF}`);
