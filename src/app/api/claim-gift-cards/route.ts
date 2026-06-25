import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    if (!dbAdmin) {
      return NextResponse.json({ error: 'Firestore admin is not initialized' }, { status: 500 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const giftsRef = dbAdmin.collection('gift_cards');
    const snap = await giftsRef
      .where('recipientEmail', '==', email.toLowerCase())
      .where('claimed', '==', false)
      .get();

    if (snap.empty) {
      return NextResponse.json({ success: true, claimedCount: 0 });
    }

    let claimedCount = 0;
    let totalClaimedAmount = 0;

    for (const giftDoc of snap.docs) {
      const data = giftDoc.data();
      const sendOn = data.sendOn;
      const giftId = giftDoc.id;

      // Check for 365-day expiration (1 year validity)
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);
      const createdTime = createdAt ? createdAt.getTime() : new Date(sendOn).getTime();
      const nowTime = new Date().getTime();
      const daysPassed = (nowTime - createdTime) / (1000 * 60 * 60 * 24);

      if (daysPassed > 365) {
        // Gift card has expired. Amount becomes 0 and is marked expired (the money remains in your bank account as business profit).
        const originalAmount = Number(data.giftAmount) || 0;
        await dbAdmin.collection('gift_cards').doc(giftId).update({
          originalAmount: originalAmount,
          giftAmount: 0,
          claimed: true,
          expired: true,
          expiredAt: FieldValue.serverTimestamp()
        });
        console.log(`Gift card ${giftId} of £${originalAmount} has expired after 365 days. Active amount set to 0.`);
        continue;
      }

      if (sendOn <= todayStr) {
        const amount = Number(data.giftAmount) || 0;
        const senderName = data.senderName || 'A friend';

        const userRef = dbAdmin.collection('users').doc(userId);
        const giftRef = dbAdmin.collection('gift_cards').doc(giftId);
        const txRef = dbAdmin.collection('wallet_transactions').doc(`gift_${userId}_${giftId}`);

        await dbAdmin.runTransaction(async (transaction: any) => {
          const userSnap = await transaction.get(userRef);
          const giftSnap = await transaction.get(giftRef);

          if (!userSnap.exists) return;
          if (!giftSnap.exists || giftSnap.data()?.claimed) return;

          const currentBalance = userSnap.data().walletBalance || 0;
          transaction.update(userRef, { walletBalance: currentBalance + amount });
          transaction.update(giftRef, { claimed: true });
          transaction.set(txRef, {
            userId,
            amount,
            type: 'credit',
            status: 'completed',
            description: `Gift Card from ${senderName}`,
            createdAt: FieldValue.serverTimestamp()
          });
        });

        claimedCount++;
        totalClaimedAmount += amount;
      }
    }

    return NextResponse.json({ success: true, claimedCount, totalClaimedAmount });
  } catch (err: any) {
    console.error('Error claiming gift cards:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
