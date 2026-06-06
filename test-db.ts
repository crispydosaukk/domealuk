import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

fs.readFileSync('.env', 'utf-8').split('\n').forEach(l => { 
  const parts = l.split('='); 
  if(parts.length >= 2) process.env[parts[0]] = parts.slice(1).join('=').trim(); 
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const snap = await getDocs(collection(db, 'menuItems'));
  console.log("Found", snap.docs.length, "items.");
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(d.id, "=> Images:", data.images);
    console.log("SubItems:", JSON.stringify(data.subItems));
  });
}

test().catch(console.error);
