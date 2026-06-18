import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
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

const idsToDelete = [
  '0wYqije3RR4Fk1lTCEjA', // Veg Samosa (2 pcs) - no image
  '2ISC6B3mPQ7af065Y17z', // Mango Ginger Chutney (100ml) - no image
  '2LDZemJOujF6LXx8deQd', // Lentil Soup - no image
  'LkVdgeWdKQSY30lYQ0Xk', // Andhra Peanut Chutney (100ml) - no image
  'RlnZvLlpYfJxJGwE3xbT', // Rasam Shot - no image
  'TYvkvtilS5JgJbpEW4Cd', // Curry Leaf Coconut Chutney (100ml) - no image
  'ZAdnHsZ0bxvJNQr5IpHU', // Chettinad Tomato Chutney (100ml) - no image
  'awnA7wvo3T6iQ7JL0eTU', // Madras Mint Chutney (100ml) - no image
  'oIsoRIYOFnk0QYmhadEn', // Roasted Chana - no image
  'yAF9Lr09FFcnWf8pdYWX', // Pineapple Kesari - no image
  's47k0LGWzzvgtVTO5efa', // Roasted Peanuts Salt - no image
  'xqBg2eMxmzUB0a8ylM3l'  // Extra Rice Bowl (Rice of the day) - no image
];

async function deleteItems() {
  console.log(`Attempting to delete ${idsToDelete.length} duplicate items...`);
  for (const id of idsToDelete) {
    try {
      const docRef = doc(db, 'menuItems', id);
      await deleteDoc(docRef);
      console.log(`Successfully deleted item with ID: ${id}`);
    } catch (error) {
      console.error(`Failed to delete item with ID ${id}:`, error);
    }
  }
}

deleteItems().catch(console.error);
