import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let dbAdmin: any = null;
let authAdmin: any = null;

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'domealuk-3e5c5';

try {
  if (privateKey && clientEmail) {
    const activeApps = getApps();
    let app: any;
    if (!activeApps.length) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      app = activeApps[0];
    }
    dbAdmin = getFirestore(app);
    authAdmin = getAuth(app);
  } else {
    console.warn(
      'Firebase Admin credentials not found (FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY). ' +
        'Falling back to Client SDK for server-side Firestore operations.'
    );
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
}

export { dbAdmin, authAdmin };
