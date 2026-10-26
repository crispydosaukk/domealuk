import nodemailer from 'nodemailer';
import { dbAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FieldValue as AdminFieldValue } from 'firebase-admin/firestore';

/**
 * Configure Nodemailer Transporter
 */
export const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER || 'domealuk@gmail.com';
  const pass = process.env.SMTP_PASS || 'elqwohzzejtphnyr';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Fetch dynamic admin email recipients from settings/global in Firestore
 */
export const getAdminRecipients = async (): Promise<string[]> => {
  try {
    if (dbAdmin) {
      const globalDoc = await dbAdmin.collection('settings').doc('global').get();
      if (globalDoc.exists && Array.isArray(globalDoc.data()?.adminEmails)) {
        const activeEmails = globalDoc
          .data()
          ?.adminEmails.filter((e: any) => e && e.enabled && e.email)
          .map((e: any) => e.email.trim());
        if (activeEmails && activeEmails.length > 0) return activeEmails;
      }

      const emailDoc = await dbAdmin.collection('settings').doc('emailRecipients').get();
      if (emailDoc.exists && Array.isArray(emailDoc.data()?.adminEmails)) {
        const activeEmails = emailDoc
          .data()
          ?.adminEmails.filter((e: any) => e && e.enabled && e.email)
          .map((e: any) => e.email.trim());
        if (activeEmails && activeEmails.length > 0) return activeEmails;
      }
    } else {
      const globalDoc = await getDoc(doc(db, 'settings', 'global'));
      if (globalDoc.exists() && Array.isArray(globalDoc.data()?.adminEmails)) {
        const activeEmails = globalDoc
          .data()
          ?.adminEmails.filter((e: any) => e && e.enabled && e.email)
          .map((e: any) => e.email.trim());
        if (activeEmails && activeEmails.length > 0) return activeEmails;
      }
    }
  } catch (error) {
    console.error('Error fetching admin recipients from Firestore settings:', error);
  }

  // Fallback defaults
  return [
    'orders@domeal.co.uk',
    'admin@vegchennaisrilalitha.co.uk',
    'Digitalbotsolutions@gmail.com',
    'rahulbadugu22@gmail.com',
  ];
};

/**
 * Helper: Fetch order data by ID
 */
async function fetchOrderData(orderId: string, initialOrderData?: any): Promise<any> {
  if (initialOrderData) return initialOrderData;
  if (dbAdmin) {
    const snap = await dbAdmin.collection('orders').doc(orderId).get();
    if (snap.exists) return snap.data();
  } else {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (snap.exists()) return snap.data();
  }
  return null;
}

/**
 * Helper: Resolve customer email from order or user document
 */
async function resolveCustomerEmail(order: any): Promise<string | null> {
  let customerEmail =
    order.customerEmail ||
    order.email ||
    order.userEmail ||
    (order.address && order.address.email);

  if (!customerEmail && order.userId && order.userId !== 'guest-user') {
    try {
      if (dbAdmin) {
        const userDoc = await dbAdmin.collection('users').doc(order.userId).get();
        if (userDoc.exists && userDoc.data()?.email) {
          customerEmail = userDoc.data().email;
        }
      } else {
        const userDoc = await getDoc(doc(db, 'users', order.userId));
        if (userDoc.exists() && userDoc.data()?.email) {
          customerEmail = userDoc.data().email;
        }
      }
    } catch (err) {
      console.error(`[emailService] Error resolving user profile email for ${order.userId}:`, err);
    }
  }

  const isSyntheticEmail =
    customerEmail && customerEmail.includes('@domeal.co.uk') && !customerEmail.startsWith('admin');
  return !isSyntheticEmail && customerEmail && customerEmail.includes('@')
    ? customerEmail.trim()
    : null;
}

/**
 * Helper: Resolve dynamic delivery slot label & time
 */
async function resolveDeliverySlot(slotId?: string): Promise<string> {
  if (!slotId) return 'Standard Delivery';
  try {
    let deliverySlots: any[] = [];
    if (dbAdmin) {
      const snap = await dbAdmin.collection('settings').doc('global').get();
      if (snap.exists) deliverySlots = snap.data()?.deliverySlots || [];
    } else {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) deliverySlots = snap.data()?.deliverySlots || [];
    }
    if (Array.isArray(deliverySlots)) {
      const matched = deliverySlots.find((s: any) => s.id === slotId);
      if (matched) {
        return matched.time ? `${matched.label} (${matched.time})` : matched.label;
      }
    }
  } catch (e) {
    console.error('[emailService] Error fetching slot settings:', e);
  }
  return slotId;
}

/**
 * Helper: Format items list HTML
 */
function formatItemsHtml(items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `
    <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1E3B2B; font-weight: 700;">Ordered Items & Menu:</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        ${items
          .map((item: any) => {
            const subItemsList =
              Array.isArray(item.subItems) && item.subItems.length > 0
                ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px; padding-left: 8px; border-left: 2px solid #C39B54;">
                    ${item.subItems.map((s: any) => s.name || s.title || s).join(', ')}
                  </div>`
                : '';
            return `
              <tr>
                <td style="padding: 6px 0; color: #334155; border-bottom: 1px solid #f1f5f9;">
                  <strong>${item.quantity || item.qty || 1}x</strong> ${item.name || item.title || 'Meal Package'}
                  ${subItemsList}
                </td>
                <td style="padding: 6px 0; text-align: right; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                  £${Number(item.price || 0).toFixed(2)}
                </td>
              </tr>
            `;
          })
          .join('')}
      </table>
    </div>
  `;
}

/**
 * Helper: Format address HTML table row
 */
function formatAddressHtml(address: any): string {
  if (!address) return '';
  return `
    <tr>
      <td style="padding: 8px 0; color: #64748b; vertical-align: top; width: 140px;">Delivery Address:</td>
      <td style="padding: 8px 0; font-weight: 500; color: #111827;">
        ${address.fullName ? `<strong>${address.fullName}</strong><br/>` : ''}
        ${address.addressLine1 || ''}${address.addressLine2 ? `, ${address.addressLine2}` : ''}<br/>
        ${address.city || ''} ${address.postcode || ''}<br/>
        ${address.phone ? `Phone: ${address.phone}` : ''}
      </td>
    </tr>
  `;
}

/**
 * Helper: Base Email Layout Wrapper
 */
function wrapEmailHtml(options: {
  previewTitle: string;
  heading: string;
  subheading: string;
  bodyContent: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${options.previewTitle}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 30px 15px; color: #1f2937;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; max-width: 600px; width: 100%;">
        <tr>
          <td style="padding: 30px 24px; text-align: center; border-bottom: 2px solid #C39B54; background-color: #1E3B2B;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">${options.heading}</h1>
            <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">${options.subheading}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 24px;">
            ${options.bodyContent}
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8faf9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #1E3B2B;">DoMeal - Authentic Fresh Home Meals</p>
            <p style="margin: 0 0 4px 0;">Need assistance? Email us at <a href="mailto:admin@vegchennaisrilalitha.co.uk" style="color: #1E3B2B; font-weight: 600;">admin@vegchennaisrilalitha.co.uk</a></p>
            &copy; ${new Date().getFullYear()} DoMeal. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * 1. Send Order Confirmation Emails (to customer and admins)
 * Triggered on initial order checkout (online or wallet).
 */
export async function sendOrderConfirmationEmails(orderId: string, initialOrderData?: any) {
  try {
    const order = await fetchOrderData(orderId, initialOrderData);

    if (!order) {
      console.warn(`[emailService] Order ${orderId} not found. Cannot send email.`);
      return { success: false, error: 'Order not found' };
    }

    if (order.confirmationEmailSent) {
      console.log(`[emailService] Order ${orderId} confirmation email was already sent.`);
      return { success: true, message: 'Already sent' };
    }

    const validCustomerEmail = await resolveCustomerEmail(order);
    const transporter = getTransporter();
    const adminRecipients = await getAdminRecipients();
    const totalAmount = Number(order.totalAmount || order.total || order.amount || 0).toFixed(2);
    const smtpFromUser = process.env.SMTP_USER || 'domealuk@gmail.com';
    const formattedDeliverySlot = await resolveDeliverySlot(order.deliverySlot || order.deliverySlotId);

    const itemsHtml = formatItemsHtml(order.items);
    const addressHtml = formatAddressHtml(order.address);

    let deliveryDatesHtml = '';
    if (Array.isArray(order.deliveryDates) && order.deliveryDates.length > 0) {
      deliveryDatesHtml = `
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Delivery Dates:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #1E3B2B;">
            ${order.deliveryDates.join(', ')}
          </td>
        </tr>
      `;
    }

    // Customer Email
    const userContent = `
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${order.address?.fullName || 'Foodie'},</p>
      <p style="font-size: 15px; line-height: 1.6;">Thank you for your order! We have received your order and our chefs are getting ready to prepare your fresh, authentic home-cooked meals.</p>
      
      <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
          Order Summary
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Order ID:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #111827;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Status:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${order.status || 'Order Received'}</td>
          </tr>
          ${deliveryDatesHtml}
          ${addressHtml}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Slot:</td>
            <td style="padding: 6px 0; font-weight: 500; color: #111827;">${formattedDeliverySlot}</td>
          </tr>
          ${order.subscriptionFrequency ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Plan Frequency:</td>
            <td style="padding: 6px 0; font-weight: 500; color: #111827;">${order.subscriptionFrequency}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 10px 0; color: #64748b; border-top: 2px solid #e2e8f0;">Total Paid:</td>
            <td style="padding: 10px 0; font-weight: 800; color: #1E3B2B; border-top: 2px solid #e2e8f0; font-size: 18px;">£${totalAmount}</td>
          </tr>
        </table>
        ${itemsHtml}
      </div>

      ${order.notes ? `
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>Special Instructions:</strong> ${order.notes}</p>
      </div>
      ` : ''}

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
          <strong>📅 Recurring Schedule Notice:</strong> For recurring meal subscriptions, subsequent payments are automatically debited <strong>every Saturday midnight</strong> for the upcoming week. You can adjust or pause your plan anytime before Saturday cutoff.
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #475569;">If you have any questions about your delivery, feel free to reply directly to this email.</p>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">Warmly,<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
    `;

    const htmlBodyUser = wrapEmailHtml({
      previewTitle: `Your DoMeal Order Confirmation - #${orderId}`,
      heading: 'Order Confirmed! 🎉',
      subheading: 'Thank you for ordering with DoMeal',
      bodyContent: userContent,
    });

    // Admin Email
    const adminContent = `
      <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
          👤 Customer Details
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr><td style="padding: 4px 0; color: #64748b; width: 140px; font-weight: 600;">Customer Name:</td><td style="padding: 4px 0; font-weight: 700; color: #111827;">${order.address?.fullName || 'Not specified'}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Email:</td><td style="padding: 4px 0;"><a href="mailto:${validCustomerEmail}" style="color: #1E3B2B; font-weight: 600;">${validCustomerEmail || 'Not specified'}</a></td></tr>
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Phone:</td><td style="padding: 4px 0;">${order.address?.phone || 'Not specified'}</td></tr>
        </table>
      </div>

      <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
          🚚 Delivery & Order Info
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          ${addressHtml}
          ${deliveryDatesHtml}
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Delivery Slot:</td><td style="padding: 4px 0; font-weight: 600;">${formattedDeliverySlot}</td></tr>
          ${order.subscriptionFrequency ? `<tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Subscription:</td><td style="padding: 4px 0; font-weight: 700; color: #1E3B2B;">🔁 Active (${order.subscriptionFrequency})</td></tr>` : ''}
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Total:</td><td style="padding: 4px 0; font-weight: 800; color: #1E3B2B; font-size: 16px;">£${totalAmount}</td></tr>
        </table>
        ${itemsHtml}
      </div>

      ${order.notes ? `<div style="background-color: #fffbeb; padding: 12px; border-radius: 8px; font-size: 13px; color: #92400e;"><strong>Special Notes:</strong> ${order.notes}</div>` : ''}
    `;

    const htmlBodyAdmin = wrapEmailHtml({
      previewTitle: `New Order Alert: #${orderId}`,
      heading: `📦 New Order Alert: #${orderId}`,
      subheading: `DoMeal Admin Notification • Total: £${totalAmount}`,
      bodyContent: adminContent,
    });

    let emailSentToUser = false;
    let emailSentToAdmin = false;

    if (validCustomerEmail) {
      try {
        await transporter.sendMail({
          from: `"DoMeal" <${smtpFromUser}>`,
          to: validCustomerEmail,
          subject: `Your DoMeal Order Confirmation - #${orderId}`,
          html: htmlBodyUser,
        });
        emailSentToUser = true;
        console.log(`[emailService] ✅ Order confirmation email sent to customer: ${validCustomerEmail}`);
      } catch (custErr) {
        console.error(`[emailService] ❌ Failed to send confirmation email to customer (${validCustomerEmail}):`, custErr);
      }
    }

    if (adminRecipients.length > 0) {
      try {
        await transporter.sendMail({
          from: `"DoMeal Orders" <${smtpFromUser}>`,
          to: adminRecipients,
          subject: `🍱 New Order Received: #${orderId} (£${totalAmount})`,
          html: htmlBodyAdmin,
        });
        emailSentToAdmin = true;
        console.log(`[emailService] ✅ Order notification sent to admins: [${adminRecipients.join(', ')}]`);
      } catch (adminErr) {
        console.error('[emailService] ❌ Failed to send order notification to admins:', adminErr);
      }
    }

    if (emailSentToUser || emailSentToAdmin) {
      const updatePayload: any = {
        confirmationEmailSent: true,
        confirmationEmailSentAt: new Date().toISOString(),
      };
      if (validCustomerEmail && !order.customerEmail) {
        updatePayload.customerEmail = validCustomerEmail;
      }

      try {
        if (dbAdmin) {
          await dbAdmin.collection('orders').doc(orderId).update(updatePayload);
        } else {
          await updateDoc(doc(db, 'orders', orderId), updatePayload);
        }
      } catch (updErr) {
        console.error(`[emailService] Error updating confirmationEmailSent on order ${orderId}:`, updErr);
      }
    }

    return { success: true, emailSentToUser, emailSentToAdmin };
  } catch (error: any) {
    console.error(`[emailService] Error processing order confirmation emails for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Send Payment Debited Email (Saturday Midnight Recurring Renewal)
 * Triggered on Stripe `invoice.payment_succeeded` with `session.billing_reason === 'subscription_cycle'`
 */
export async function sendPaymentDebitedEmail(
  orderId: string,
  renewalInfo?: { amount?: number; deliveryDates?: string[]; invoiceId?: string; frequency?: string },
  initialOrderData?: any
) {
  try {
    const order = await fetchOrderData(orderId, initialOrderData);

    if (!order) {
      console.warn(`[emailService] Order ${orderId} not found for payment debited email.`);
      return { success: false, error: 'Order not found' };
    }

    if (order.paymentDebitedEmailSent) {
      console.log(`[emailService] Order ${orderId} payment debited email was already sent.`);
      return { success: true, message: 'Already sent' };
    }

    const validCustomerEmail = await resolveCustomerEmail(order);
    const transporter = getTransporter();
    const adminRecipients = await getAdminRecipients();
    const totalAmount = Number(renewalInfo?.amount || order.total || order.amount || 0).toFixed(2);
    const smtpFromUser = process.env.SMTP_USER || 'domealuk@gmail.com';
    const formattedDeliverySlot = await resolveDeliverySlot(order.deliverySlot || order.deliverySlotId);

    const deliveryDates = renewalInfo?.deliveryDates || order.deliveryDates || [];
    const itemsHtml = formatItemsHtml(order.items);
    const addressHtml = formatAddressHtml(order.address);

    let deliveryDatesHtml = '';
    if (Array.isArray(deliveryDates) && deliveryDates.length > 0) {
      deliveryDatesHtml = `
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Upcoming Delivery Dates:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #1E3B2B; font-size: 15px;">
            ${deliveryDates.join(', ')}
          </td>
        </tr>
      `;
    }

    // Customer Email
    const userContent = `
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${order.address?.fullName || 'Valued Subscriber'},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Your recurring subscription payment of <strong style="color: #1E3B2B; font-size: 17px;">£${totalAmount}</strong> has been successfully debited for your upcoming week's meals.
      </p>

      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px 0; color: #065f46; font-size: 14px; font-weight: 700;">✅ Weekly Renewal Confirmed</h4>
        <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
          As per our billing policy, subscription renewals debit <strong>every Saturday midnight</strong> to ensure our kitchen sources fresh ingredients for your upcoming deliveries.
        </p>
      </div>

      <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
          Upcoming Week's Schedule & Details
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">New Order ID:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #111827;">${orderId}</td>
          </tr>
          ${deliveryDatesHtml}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Slot:</td>
            <td style="padding: 6px 0; font-weight: 500; color: #111827;">${formattedDeliverySlot}</td>
          </tr>
          ${addressHtml}
          <tr>
            <td style="padding: 10px 0; color: #64748b; border-top: 2px solid #e2e8f0;">Amount Debited:</td>
            <td style="padding: 10px 0; font-weight: 800; color: #1E3B2B; border-top: 2px solid #e2e8f0; font-size: 18px;">£${totalAmount}</td>
          </tr>
        </table>
        ${itemsHtml}
      </div>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
          <strong>⚙️ Need to pause or modify?</strong> You can manage or cancel your subscription anytime in your account dashboard. Any cancellation submitted during the week takes effect starting the following cycle, ensuring you receive all meals already debited!
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #475569;">Questions? Reply to this email or contact us at <a href="mailto:admin@vegchennaisrilalitha.co.uk" style="color: #1E3B2B; font-weight: 600;">admin@vegchennaisrilalitha.co.uk</a>.</p>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">Warm regards,<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
    `;

    const htmlBodyUser = wrapEmailHtml({
      previewTitle: `Payment Debited & Meals Scheduled - Order #${orderId}`,
      heading: 'Subscription Renewed & Paid! 💳',
      subheading: `£${totalAmount} debited • Meals scheduled for upcoming week`,
      bodyContent: userContent,
    });

    // Admin Notification
    const adminContent = `
      <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
          💳 Recurring Billing Renewal
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr><td style="padding: 4px 0; color: #64748b; width: 140px; font-weight: 600;">New Order ID:</td><td style="padding: 4px 0; font-weight: 700;">${orderId}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Customer:</td><td style="padding: 4px 0; font-weight: 700;">${order.address?.fullName || 'Customer'}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Customer Email:</td><td style="padding: 4px 0;">${validCustomerEmail || 'N/A'}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Amount Debited:</td><td style="padding: 4px 0; font-weight: 800; color: #1E3B2B; font-size: 16px;">£${totalAmount}</td></tr>
          ${deliveryDatesHtml}
          <tr><td style="padding: 4px 0; color: #64748b; font-weight: 600;">Delivery Slot:</td><td style="padding: 4px 0; font-weight: 600;">${formattedDeliverySlot}</td></tr>
          ${addressHtml}
        </table>
        ${itemsHtml}
      </div>
    `;

    const htmlBodyAdmin = wrapEmailHtml({
      previewTitle: `Recurring Subscription Debited: #${orderId}`,
      heading: `💳 Recurring Billing Alert: #${orderId}`,
      subheading: `Payment Debited £${totalAmount} • Saturday Cutoff Renewal`,
      bodyContent: adminContent,
    });

    let emailSentToUser = false;
    let emailSentToAdmin = false;

    if (validCustomerEmail) {
      try {
        await transporter.sendMail({
          from: `"DoMeal Subscriptions" <${smtpFromUser}>`,
          to: validCustomerEmail,
          subject: `💳 Payment Debited & Meals Scheduled - Order #${orderId} (£${totalAmount})`,
          html: htmlBodyUser,
        });
        emailSentToUser = true;
        console.log(`[emailService] ✅ Payment debited email sent to customer: ${validCustomerEmail}`);
      } catch (custErr) {
        console.error(`[emailService] ❌ Failed to send payment debited email to customer (${validCustomerEmail}):`, custErr);
      }
    }

    if (adminRecipients.length > 0) {
      try {
        await transporter.sendMail({
          from: `"DoMeal Billing" <${smtpFromUser}>`,
          to: adminRecipients,
          subject: `💳 Subscription Debited: #${orderId} (£${totalAmount}) - ${order.address?.fullName || ''}`,
          html: htmlBodyAdmin,
        });
        emailSentToAdmin = true;
        console.log(`[emailService] ✅ Payment debited alert sent to admins: [${adminRecipients.join(', ')}]`);
      } catch (adminErr) {
        console.error('[emailService] ❌ Failed to send payment debited alert to admins:', adminErr);
      }
    }

    if (emailSentToUser || emailSentToAdmin) {
      const updatePayload: any = {
        paymentDebitedEmailSent: true,
        paymentDebitedEmailSentAt: new Date().toISOString(),
      };
      try {
        if (dbAdmin) {
          await dbAdmin.collection('orders').doc(orderId).update(updatePayload);
        } else {
          await updateDoc(doc(db, 'orders', orderId), updatePayload);
        }
      } catch (updErr) {
        console.error(`[emailService] Error updating paymentDebitedEmailSent on order ${orderId}:`, updErr);
      }
    }

    return { success: true, emailSentToUser, emailSentToAdmin };
  } catch (error: any) {
    console.error(`[emailService] Error processing payment debited email for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Send Delivery Day Morning Email
 * Sent to customer in the morning on the scheduled delivery date.
 */
export async function sendDeliveryMorningEmail(
  orderId: string,
  deliveryDate: string,
  initialOrderData?: any
) {
  try {
    const order = await fetchOrderData(orderId, initialOrderData);

    if (!order) {
      console.warn(`[emailService] Order ${orderId} not found for morning delivery email.`);
      return { success: false, error: 'Order not found' };
    }

    // Check if morning email was already sent for this specific delivery date
    const sentDates = Array.isArray(order.morningEmailSentForDates)
      ? order.morningEmailSentForDates
      : [];
    if (sentDates.includes(deliveryDate)) {
      console.log(`[emailService] Morning email for order ${orderId} on date ${deliveryDate} already sent.`);
      return { success: true, message: 'Already sent for this date' };
    }

    const validCustomerEmail = await resolveCustomerEmail(order);
    if (!validCustomerEmail) {
      console.warn(`[emailService] No valid customer email for order ${orderId} morning reminder.`);
      return { success: false, error: 'No valid email' };
    }

    const transporter = getTransporter();
    const smtpFromUser = process.env.SMTP_USER || 'domealuk@gmail.com';
    const formattedDeliverySlot = await resolveDeliverySlot(order.deliverySlot || order.deliverySlotId);
    const itemsHtml = formatItemsHtml(order.items);
    const addressHtml = formatAddressHtml(order.address);

    const userContent = `
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Good morning ${order.address?.fullName || 'Foodie'}! ☀️</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Exciting news! Your authentic, freshly cooked meals are being prepared by our chefs and are scheduled for delivery <strong>today, ${deliveryDate}</strong>!
      </p>

      <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
          🚚 Today's Delivery Schedule
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Order Reference:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #111827;">#${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Date:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">Today (${deliveryDate})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Delivery Slot:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #111827;">${formattedDeliverySlot}</td>
          </tr>
          ${addressHtml}
        </table>
        ${itemsHtml}
      </div>

      ${order.notes ? `
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>Your Delivery Notes:</strong> ${order.notes}</p>
      </div>
      ` : ''}

      <div style="background-color: #ecfdf5; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
          <strong>💡 Tips for a smooth delivery:</strong><br/>
          • Please make sure someone is available at your address during the slot.<br/>
          • If you have reusable dabbas from prior deliveries, please keep them rinsed and ready for collection!
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">Warm wishes,<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
    `;

    const htmlBodyUser = wrapEmailHtml({
      previewTitle: `☀️ Good Morning! Your DoMeal delivery arrives today - #${orderId}`,
      heading: 'Your Meals Arrive Today! 🚚',
      subheading: `Delivery Scheduled for Today • ${formattedDeliverySlot}`,
      bodyContent: userContent,
    });

    await transporter.sendMail({
      from: `"DoMeal Deliveries" <${smtpFromUser}>`,
      to: validCustomerEmail,
      subject: `☀️ Good Morning! Your DoMeal delivery arrives today - #${orderId}`,
      html: htmlBodyUser,
    });

    console.log(`[emailService] ✅ Morning delivery email sent to ${validCustomerEmail} for order ${orderId} (${deliveryDate})`);

    // Record that morning email was sent for this date
    try {
      if (dbAdmin) {
        await dbAdmin.collection('orders').doc(orderId).update({
          morningEmailSentForDates: AdminFieldValue.arrayUnion(deliveryDate),
        });
      } else {
        await updateDoc(doc(db, 'orders', orderId), {
          morningEmailSentForDates: arrayUnion(deliveryDate),
        });
      }
    } catch (updErr) {
      console.error(`[emailService] Error updating morningEmailSentForDates on order ${orderId}:`, updErr);
    }

    return { success: true, emailSentToUser: true, customerEmail: validCustomerEmail };
  } catch (error: any) {
    console.error(`[emailService] Error processing morning delivery email for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 4. Send Delivery Status Notification Email
 * Triggered when order status changes to 'Out for Delivery' or 'Delivered'
 */
export async function sendDeliveryStatusEmail(
  orderId: string,
  newStatus: string,
  initialOrderData?: any
) {
  try {
    const order = await fetchOrderData(orderId, initialOrderData);

    if (!order) {
      console.warn(`[emailService] Order ${orderId} not found for status update email.`);
      return { success: false, error: 'Order not found' };
    }

    // Only send for delivery status updates
    if (!['Out for Delivery', 'Delivered'].includes(newStatus)) {
      return { success: true, message: 'Status does not require notification email' };
    }

    // Prevent duplicate sending for the same status
    const sentStatuses = order.statusEmailSent || {};
    if (sentStatuses[newStatus]) {
      console.log(`[emailService] Status email for order ${orderId} (${newStatus}) already sent.`);
      return { success: true, message: 'Already sent for this status' };
    }

    const validCustomerEmail = await resolveCustomerEmail(order);
    if (!validCustomerEmail) {
      console.warn(`[emailService] No valid customer email for order ${orderId} status notification.`);
      return { success: false, error: 'No valid email' };
    }

    const transporter = getTransporter();
    const smtpFromUser = process.env.SMTP_USER || 'domealuk@gmail.com';
    const formattedDeliverySlot = await resolveDeliverySlot(order.deliverySlot || order.deliverySlotId);
    const addressHtml = formatAddressHtml(order.address);

    let emailSubject = '';
    let heading = '';
    let subheading = '';
    let messageBody = '';

    if (newStatus === 'Out for Delivery') {
      emailSubject = `🚚 Out for Delivery: Your DoMeal order #${orderId} is on the way!`;
      heading = 'Out for Delivery! 🚚';
      subheading = 'Your driver is on the road';
      messageBody = `
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${order.address?.fullName || 'Foodie'},</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Great news! Your DoMeal order <strong style="color: #1E3B2B;">#${orderId}</strong> is packed fresh and is now <strong>out for delivery</strong> heading toward your address!
        </p>

        <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
            Delivery Details
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 140px;">Order ID:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #111827;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Slot:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #111827;">${formattedDeliverySlot}</td>
            </tr>
            ${addressHtml}
          </table>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Please keep your phone handy in case our delivery driver needs any assistance accessing your building or driveway.
        </p>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">See you shortly!<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
      `;
    } else if (newStatus === 'Delivered') {
      emailSubject = `🍽️ Delivered: Your DoMeal order #${orderId} has arrived!`;
      heading = 'Order Delivered! 🍽️';
      subheading = 'Enjoy your delicious authentic meals';
      messageBody = `
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${order.address?.fullName || 'Foodie'},</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Your DoMeal order <strong style="color: #1E3B2B;">#${orderId}</strong> has been successfully <strong>delivered</strong>!
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #166534; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
            Delivered To
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
            ${addressHtml}
          </table>
        </div>

        <div style="background-color: #f8faf9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1E3B2B;">♻️ Reusable Dabba Deposit Note:</p>
          <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
            Enjoy your hot, authentic home-cooked meal! After enjoying, simply rinse the reusable stainless-steel containers and have them ready for hand-off on your next delivery date.
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          Have questions or feedback on today's dishes? Feel free to reply directly to this email or rate your experience!
        </p>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">Enjoy your meal!<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
      `;
    }

    const htmlBodyUser = wrapEmailHtml({
      previewTitle: emailSubject,
      heading,
      subheading,
      bodyContent: messageBody,
    });

    await transporter.sendMail({
      from: `"DoMeal Deliveries" <${smtpFromUser}>`,
      to: validCustomerEmail,
      subject: emailSubject,
      html: htmlBodyUser,
    });

    console.log(`[emailService] ✅ Delivery status email (${newStatus}) sent to ${validCustomerEmail} for order ${orderId}`);

    // Record status email sent
    try {
      const updateData = {
        [`statusEmailSent.${newStatus}`]: new Date().toISOString(),
      };
      if (dbAdmin) {
        await dbAdmin.collection('orders').doc(orderId).update(updateData);
      } else {
        await updateDoc(doc(db, 'orders', orderId), updateData);
      }
    } catch (updErr) {
      console.error(`[emailService] Error updating statusEmailSent on order ${orderId}:`, updErr);
    }

    return { success: true, emailSentToUser: true, customerEmail: validCustomerEmail };
  } catch (error: any) {
    console.error(`[emailService] Error processing delivery status email for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 5. Send Corporate Catering Inquiry Emails (to admins and customer confirmation)
 */
export async function sendCorporateInquiryEmails(inquiry: any) {
  try {
    const {
      companyName = 'N/A',
      contactName = 'N/A',
      email = '',
      phone = 'N/A',
      eventDate = 'N/A',
      eventTime = 'Not specified',
      eventLocation = 'Not specified',
      selectedPackage = 'Not specified',
      paxCount = 0,
      estimatedTotal = 0,
      selectedDishes = null,
      specialNotes = '',
    } = inquiry;

    const transporter = getTransporter();
    const adminRecipients = await getAdminRecipients();
    const smtpFromUser = process.env.SMTP_USER || 'domealuk@gmail.com';
    const formattedDate = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

    let dishesHtml = '';
    if (selectedDishes) {
      dishesHtml = `
        <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">
            🍽️ Selected Menu & Dish Choices
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
            ${selectedDishes.chaat ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;">Chaat Selection:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.chaat}</td></tr>` : ''}
            ${selectedDishes.mains ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Main Course:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.mains}</td></tr>` : ''}
            ${selectedDishes.bread ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Bread Selection:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.bread}</td></tr>` : ''}
            ${selectedDishes.curries ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Curries:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.curries}</td></tr>` : ''}
            ${selectedDishes.dessert ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Dessert Selection:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.dessert}</td></tr>` : ''}
          </table>
        </div>
      `;
    }

    const htmlBodyAdmin = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>New Corporate Catering Inquiry</title></head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          <tr>
            <td style="background-color: #1E3B2B; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">🍱 New Corporate Catering Inquiry</h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">DoMeal - Instant Website Lead Alert</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">🏢 Company & Contact Details</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;">Company Name:</td><td style="padding: 6px 0; font-weight: 700; color: #111827;">${companyName}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Contact Person:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${contactName}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Email Address:</td><td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #1E3B2B; font-weight: 600;">${email}</a></td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Phone Number:</td><td style="padding: 6px 0;"><a href="tel:${phone}" style="color: #1E3B2B; font-weight: 600;">${phone}</a></td></tr>
                </table>
              </div>

              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">📅 Event & Package Details</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;">Event Date:</td><td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${eventDate}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Event Time:</td><td style="padding: 6px 0; color: #111827;">${eventTime}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Venue Location:</td><td style="padding: 6px 0; color: #111827;">${eventLocation}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Package Selected:</td><td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${selectedPackage}</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Number of Pax:</td><td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${paxCount} Guests</td></tr>
                  <tr><td style="padding: 6px 0; font-weight: 600; color: #64748b;">Estimated Total:</td><td style="padding: 6px 0; font-weight: 800; font-size: 16px; color: #1E3B2B;">£${Number(estimatedTotal).toFixed(2)}</td></tr>
                </table>
              </div>

              ${dishesHtml}

              ${specialNotes ? `
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #92400e; font-size: 15px; margin-bottom: 8px;">📝 Special Notes / Requests</h2>
                <p style="margin: 0; font-size: 14px; color: #78350f; white-space: pre-wrap;">${specialNotes}</p>
              </div>` : ''}

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">Submitted on ${formattedDate}</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              DoMeal Corporate Catering Automated System &copy; ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const htmlBodyCustomer = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>We Received Your Corporate Catering Inquiry</title></head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f5; margin: 0; padding: 30px 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          <tr>
            <td style="background-color: #1E3B2B; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Inquiry Received! 🍱</h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">DoMeal Corporate Catering</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 24px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${contactName},</p>
              <p style="font-size: 15px; line-height: 1.6;">Thank you for your interest in DoMeal corporate catering for <strong>${companyName}</strong>. We have received your inquiry and our corporate catering team is currently reviewing your event requirements.</p>

              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">Your Event Summary</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Event Date:</td><td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${eventDate}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Event Time:</td><td style="padding: 6px 0; color: #111827;">${eventTime}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Location:</td><td style="padding: 6px 0; color: #111827;">${eventLocation}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Package:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedPackage}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Number of Guests:</td><td style="padding: 6px 0; font-weight: 600; color: #111827;">${paxCount} Guests</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Estimated Total:</td><td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">£${Number(estimatedTotal).toFixed(2)}</td></tr>
                </table>
              </div>

              <p style="font-size: 15px; line-height: 1.6;">Our corporate catering manager will get in touch with you shortly to confirm dates, logistics, and finalize menu selections.</p>
              <p style="font-size: 15px; line-height: 1.6;">Need immediate assistance? Reach us at <a href="mailto:admin@vegchennaisrilalitha.co.uk" style="color: #1E3B2B; font-weight: 600;">admin@vegchennaisrilalitha.co.uk</a>.</p>

              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Warm regards,<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              DoMeal Corporate Catering &copy; ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    let adminSent = false;
    let customerSent = false;

    if (adminRecipients.length > 0) {
      try {
        await transporter.sendMail({
          from: `"DoMeal Corporate Inquiries" <${smtpFromUser}>`,
          to: adminRecipients,
          subject: `🍱 New Corporate Catering Inquiry: ${companyName} (${paxCount} Pax - ${eventDate})`,
          html: htmlBodyAdmin,
        });
        adminSent = true;
        console.log(`[emailService] ✅ Corporate inquiry email sent to admins: [${adminRecipients.join(', ')}]`);
      } catch (adminErr) {
        console.error('[emailService] ❌ Failed sending corporate email to admins:', adminErr);
      }
    }

    if (email && email.includes('@')) {
      try {
        await transporter.sendMail({
          from: `"DoMeal Corporate Catering" <${smtpFromUser}>`,
          to: email.trim(),
          subject: `We Received Your Corporate Catering Inquiry - ${companyName}`,
          html: htmlBodyCustomer,
        });
        customerSent = true;
        console.log(`[emailService] ✅ Inquiry confirmation email sent to customer: ${email}`);
      } catch (custErr) {
        console.error(`[emailService] ❌ Failed sending inquiry confirmation email to customer (${email}):`, custErr);
      }
    }

    return {
      success: true,
      adminSent,
      customerSent,
      adminRecipients,
    };
  } catch (error: any) {
    console.error('[emailService] Error sending corporate inquiry emails:', error);
    return { success: false, error: error.message };
  }
}
