import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    if (!dbAdmin) {
      return NextResponse.json({ error: 'Firestore admin is not initialized' }, { status: 500 });
    }

    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Session not paid or invalid' }, { status: 400 });
    }

    const metadata = session.metadata;
    if (!metadata || metadata.type !== 'gift_card') {
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    const senderName = metadata.senderName;
    const senderEmail = metadata.senderEmail;
    const recipientFirstName = metadata.recipientFirstName;
    const recipientLastName = metadata.recipientLastName;
    const recipientEmail = metadata.recipientEmail;
    const message = metadata.message;
    const sendOn = metadata.sendOn;
    const giftAmount = Number(metadata.giftAmount);

    // 2. Check if a gift card with this session ID already exists (prevent duplicates)
    const sessionQuery = await dbAdmin
      .collection('gift_cards')
      .where('stripeSessionId', '==', sessionId)
      .get();

    let giftCardRef = null;

    if (sessionQuery.empty) {
      // Create the gift card document
      const docRef = await dbAdmin.collection('gift_cards').add({
        stripeSessionId: sessionId,
        senderName,
        senderEmail,
        recipientFirstName,
        recipientLastName,
        recipientEmail: recipientEmail.toLowerCase(),
        message: message || '',
        sendOn,
        giftAmount,
        claimed: false,
        createdAt: FieldValue.serverTimestamp()
      });
      giftCardRef = docRef;
      console.log(`Fallback: Created gift card ${docRef.id} for session ${sessionId}`);
    } else {
      giftCardRef = sessionQuery.docs[0].ref;
      console.log(`Gift card for session ${sessionId} already exists.`);
    }

    // 3. If recipient exists and sendOn is today or in the past, credit them immediately!
    const todayStr = new Date().toISOString().split('T')[0];
    if (sendOn <= todayStr) {
      const usersSnap = await dbAdmin.collection('users').where('email', '==', recipientEmail.toLowerCase()).get();
      if (!usersSnap.empty) {
        const userDoc = usersSnap.docs[0];
        const recipientUid = userDoc.id;
        
        const userRef = dbAdmin.collection('users').doc(recipientUid);
        
        await dbAdmin.runTransaction(async (transaction: any) => {
          const uSnap = await transaction.get(userRef);
          const gSnap = await transaction.get(giftCardRef);
          
          if (uSnap.exists && gSnap.exists && !gSnap.data().claimed) {
            const currentBalance = uSnap.data().walletBalance || 0;
            transaction.update(userRef, { walletBalance: currentBalance + giftAmount });
            transaction.update(giftCardRef, { claimed: true });
            transaction.set(dbAdmin.collection('wallet_transactions').doc(`gift_${recipientUid}_${gSnap.id}`), {
              userId: recipientUid,
              amount: giftAmount,
              type: 'credit',
              status: 'completed',
              description: `Gift Card from ${senderName}`,
              createdAt: FieldValue.serverTimestamp()
            });
          }
        });
        console.log(`Instantly credited verified gift card to user ${recipientUid}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error verifying gift session:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
