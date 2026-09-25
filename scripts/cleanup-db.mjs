/**
 * DoMeal UK — Production Database Cleanup Script
 * Run: node scripts/cleanup-db.mjs
 *
 * KEEPS:   menuItems, settings, admin user, latest 1 order
 * DELETES: all other orders, wallet_transactions, corporateInquiries, test users
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_EMAIL = 'domealuk79812@gmail.com';

const serviceAccount = {
  type: 'service_account',
  project_id: 'domealuk-3e5c5',
  client_email: 'firebase-adminsdk-fbsvc@domealuk-3e5c5.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC058CN0V6i8x8K\nrjw5t8MAjgs6cc2Ul2NoVnMOd/C1Z8Th/mzxoxEnjBtHUQ2XuOG9rkk+cjkmIdy5\nu2FD+f8jcUz6fvERSEafbMiL0g7oI57exQeYVHOjTCRh+ANHJiG7BTa992nmgc/L\nv/KkIueH+KgAoDjEIja50c0WilCuRxlA05197zRNsWS4qzRYNGop2hIMEunV9BxJ\n9DBP/YxaPafsVh+YkQjq+C4Z6cEbZFfQsPGXF/qBMP6SAOziWJkAovzVpnJQKAls\nFex4nhWBK8a5P9kaTtM6QMlK0W5+cP9Gtiuz7/S+DH+0w/CMZ3czxISFRcfybxwO\nre5doOPXAgMBAAECggEAF+ZMLpA8BUwYTEQY3x6ItnXi7t2NEDXwjfQUhD39QNdi\nOoxvM9HcGNJDjP2czZrBHAWUAJonia2h6Fm52mNYkoP2lwYWmWFn5HUDM6b/OCpI\njrFktPpnQpTIc7bye+pXkh/OC8p4JQSpAV0s/wPrfFpcm6SPNf430P8c2Kmnn2EQ\nDN4Fbm1JZPDFLIx0E09ynZCSsNZ5iXi+XOoTjIhWJFb7bS0X7uTwj14BW3sriBTs\nKwQEiNVDgBjsrlRNtrW0E9XwJFKlqqwSIKMBW+oc9a+HShyGudBshjz/1pmhG2NX\nqbs8GC6J7CNvrKNHYF3u+XLLAD6+NXLkafeLpqcNQQKBgQDXXCng6D4aggdFZvhL\nt02g+4wpsLcMh6fOdz0dkgf5UAvj7t1vi0M48huO8C+acg0L1yf4gdiXBynNm58O\nj8EMkCiKEXmNNYPc1h/VIMGoobzKY+CyZ7AmMsWRThbPMxEPh3Yo2wyWtXG0pMZc\naB3X9wGJaniIjlYIeEc3ck7iFwKBgQDXCx0H9CdEeXKFs6q4Q105ttnkZH2EFSuc\nuWCrFw8stOD1rvRXLCvUtCUk4dpPaGmHD+1J+WBbNjUdt2On8BShUpwbScb56P2S\nhzuW8abufhzSyDoc5Vpozq+7sUngGdI5HJKpiUdcg/geW1MrzwQGYIfGBmmmp5Ur\nlzDeYsvkQQKBgQDNCdZlZzgZjMrXbN3hWLf0GQqtdq4Qo+dET4pEaRBmcauga38v\n/+sUgI10XYE1DnkVWNeZZiaMRCmstAmPl5Y5G9c8/L45j0XoL4VHKVS39KUGHGmF\n8epns9ceLLbSts/7dQEujL9DjaSgVHD28bnYMDeqWVBA0yNeFQXY6F/qKQKBgEOY\nArAVVqJ3akAMkYUJ56vUhfj8fVefL+47dt9QiDyNPoj7TWJ5R+28ElDdjTmYoFML\n9pJiCJ+jEl8c3f5TwKhUxyzsq9ayHcKJL3nqy4X7riOzPFEI5ro6/ZIJ0CbY9vNs\nv8z6kavK75rbKfGDSMiYXxUnvt3bn0/sXjgI5f4BAoGAZA811C7Gxpds2yiAxrvg\nD2wtfLeoPEiI3Kb/zoOVj/SZhWpJ1SG1ci/4u2cZUsgnrR8YH1/28hHcM8kkdFw1\nowsZhB2xKfSQAx0qm1eQmCMnRV/klvYXpuJEYaSf48zaYUJJOmlxl598UkbUjR2h\nBDYnRsREeZtFXeLD6hKNhc8=\n-----END PRIVATE KEY-----\n',
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();

async function deleteCollection(name) {
  const snap = await db.collection(name).get();
  if (snap.empty) { console.log('  info ' + name + ': already empty'); return 0; }
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db.batch();
    snap.docs.slice(i, i + 400).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  console.log('  deleted ' + snap.docs.length + ' docs from ' + name);
  return snap.docs.length;
}

async function main() {
  console.log('\nDoMeal UK - Production Database Cleanup');
  console.log('=========================================');

  // Step 1: find latest order
  console.log('\nSTEP 1: Finding latest order to keep...');
  const latest = await db.collection('orders').orderBy('createdAt', 'desc').limit(1).get();
  let keepId = null;
  if (!latest.empty) {
    const d = latest.docs[0]; keepId = d.id;
    const data = d.data();
    console.log('  Keeping order: ' + keepId);
    console.log('  Customer: ' + (data.address?.fullName ?? 'Unknown'));
    console.log('  Total: GBP' + (data.total || 0).toFixed(2));
  } else { console.log('  No orders found'); }

  // Step 2: delete other orders
  console.log('\nSTEP 2: Deleting old orders...');
  if (keepId) {
    const all = await db.collection('orders').get();
    const toDelete = all.docs.filter(d => d.id !== keepId);
    if (toDelete.length === 0) { console.log('  Only 1 order exists, nothing deleted'); }
    else {
      for (let i = 0; i < toDelete.length; i += 400) {
        const batch = db.batch();
        toDelete.slice(i, i + 400).forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      console.log('  Deleted ' + toDelete.length + ' orders (kept 1)');
    }
  }

  // Step 3: wallet_transactions
  console.log('\nSTEP 3: Clearing wallet_transactions...');
  await deleteCollection('wallet_transactions');

  // Step 4: corporateInquiries
  console.log('\nSTEP 4: Clearing corporateInquiries...');
  await deleteCollection('corporateInquiries');

  // Step 5: users
  console.log('\nSTEP 5: Deleting test users (keeping admin)...');
  const usersSnap = await db.collection('users').get();
  let deleted = 0, kept = 0;
  const authUids = [];
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (data.email === ADMIN_EMAIL) { console.log('  Keeping admin: ' + data.email); kept++; continue; }
    await doc.ref.delete();
    if (data.uid) authUids.push(data.uid);
    deleted++;
  }
  if (authUids.length > 0) {
    for (let i = 0; i < authUids.length; i += 100) {
      const res = await auth.deleteUsers(authUids.slice(i, i + 100));
      console.log('  Auth: deleted ' + res.successCount + ' accounts');
    }
  }
  console.log('  Users: deleted ' + deleted + ' docs, kept ' + kept + ' admin');

  console.log('\n=========================================');
  console.log('DONE - Database is clean!');
  console.log('  menuItems    -> untouched');
  console.log('  settings     -> untouched');
  console.log('  Admin user   -> preserved');
  console.log('  Latest order -> preserved');
  console.log('=========================================\n');
}

main().catch(e => { console.error('ERROR:', e); process.exit(1); });
