import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
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
const storage = getStorage(app);
storage.maxUploadRetryTime = 5000;

async function testUpload() {
  try {
    const storageRef = ref(storage, `test_${Date.now()}.txt`);
    await uploadString(storageRef, 'Hello World!');
    const url = await getDownloadURL(storageRef);
    console.log("Upload successful! URL:", url);
  } catch (err) {
    console.error("Upload failed!", err);
  }
}

testUpload();
