import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { dbAdmin } from '@/lib/firebase-admin';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';

const TEST_MENU_DOC_ID = 'test-menu-1pound';

const DEFAULT_TEST_MENU_DATA = {
  name: '🧪 £1 Test Subscription Plan',
  category: 'Lunch',
  price: 1.0,
  originalPrice: 1.0,
  portionPrice: '£1.00 / test portion',
  desc: 'Special £1 test subscription meal plan for verifying end-to-end checkout, card processing, and recurring subscription notifications via Worldpay.',
  spice: 0,
  active: true,
  tag: 'TEST_MENU',
  offerText: 'TEST PLAN (£1.00)',
  images: [
    '/Beans Usili_Dhall Palak_Channa Masala_Little Millet Rice.png',
    '/DOMEAL_Logo.png',
  ],
  dietaryTags: {
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
  },
  nutritionalInfo: 'Cal: 150 kcal | Protein: 5g | Carbs: 25g | Fat: 2g',
  ingredients: 'Steamed Rice, Yellow Dal, Mixed Vegetables, Cumin, Mild Spices (Sample Food Portion)',
  allergens: 'None declared (Vegetarian test meal)',
  heatingInstructions: 'Ready to heat. Microwave on high for 60 seconds.',
  subItems: [
    { id: 'sub-test-1', name: 'Fresh Vegetable Bowl (Test)', price: 0, isIncluded: true },
    { id: 'sub-test-2', name: 'Steamed Fragrant Rice (Test)', price: 0, isIncluded: true },
    { id: 'sub-test-3', name: 'Eco-Friendly Cutlery', price: 0, isIncluded: true },
  ],
};

export async function GET() {
  try {
    let item: any = null;
    if (dbAdmin) {
      const snap = await dbAdmin.collection('menuItems').doc(TEST_MENU_DOC_ID).get();
      if (snap.exists) item = { id: snap.id, ...snap.data() };
    } else {
      const snap = await getDoc(doc(db, 'menuItems', TEST_MENU_DOC_ID));
      if (snap.exists()) item = { id: snap.id, ...snap.data() };
    }

    return NextResponse.json({
      exists: Boolean(item),
      active: item ? Boolean(item.active) : false,
      item,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedActive: boolean | undefined = body.active;

    let existing: any = null;
    if (dbAdmin) {
      const snap = await dbAdmin.collection('menuItems').doc(TEST_MENU_DOC_ID).get();
      if (snap.exists) existing = snap.data();
    } else {
      const snap = await getDoc(doc(db, 'menuItems', TEST_MENU_DOC_ID));
      if (snap.exists()) existing = snap.data();
    }

    const newActiveState =
      requestedActive !== undefined ? requestedActive : existing ? !existing.active : true;

    if (!existing) {
      // Create test menu item
      const payload = {
        ...DEFAULT_TEST_MENU_DATA,
        active: newActiveState,
        createdAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
        updatedAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
      };

      if (dbAdmin) {
        await dbAdmin.collection('menuItems').doc(TEST_MENU_DOC_ID).set(payload);
        await dbAdmin
          .collection('settings')
          .doc('global')
          .set({ testMenuEnabled: newActiveState }, { merge: true });
      } else {
        await setDoc(doc(db, 'menuItems', TEST_MENU_DOC_ID), payload);
        await setDoc(doc(db, 'settings', 'global'), { testMenuEnabled: newActiveState }, { merge: true });
      }

      return NextResponse.json({
        success: true,
        created: true,
        active: newActiveState,
        message: '£1 Test Menu created and activated.',
      });
    } else {
      // Update existing item's active state
      const updateData = {
        active: newActiveState,
        updatedAt: dbAdmin ? AdminFieldValue.serverTimestamp() : serverTimestamp(),
      };

      if (dbAdmin) {
        await dbAdmin.collection('menuItems').doc(TEST_MENU_DOC_ID).update(updateData);
        await dbAdmin
          .collection('settings')
          .doc('global')
          .set({ testMenuEnabled: newActiveState }, { merge: true });
      } else {
        await updateDoc(doc(db, 'menuItems', TEST_MENU_DOC_ID), updateData);
        await setDoc(doc(db, 'settings', 'global'), { testMenuEnabled: newActiveState }, { merge: true });
      }

      return NextResponse.json({
        success: true,
        active: newActiveState,
        message: `£1 Test Menu is now ${newActiveState ? 'ACTIVE' : 'INACTIVE'}.`,
      });
    }
  } catch (err: any) {
    console.error('Error toggling test menu:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
