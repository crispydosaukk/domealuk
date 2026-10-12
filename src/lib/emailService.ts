import nodemailer from 'nodemailer';
import { dbAdmin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
 * Send Order Confirmation Emails (to customer and admins)
 */
export async function sendOrderConfirmationEmails(orderId: string, initialOrderData?: any) {
  try {
    let order: any = initialOrderData;

    // 1. Fetch latest order data if not provided
    if (!order) {
      if (dbAdmin) {
        const snap = await dbAdmin.collection('orders').doc(orderId).get();
        if (snap.exists) {
          order = snap.data();
        }
      } else {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          order = snap.data();
        }
      }
    }

    if (!order) {
      console.warn(`[emailService] Order ${orderId} not found. Cannot send email.`);
      return { success: false, error: 'Order not found' };
    }

    // 2. Prevent duplicate email sending
    if (order.confirmationEmailSent) {
      console.log(`[emailService] Order ${orderId} confirmation email was already sent.`);
      return { success: true, message: 'Already sent' };
    }

    // 3. Resolve customer email
    let customerEmail =
      order.customerEmail ||
      order.email ||
      order.userEmail ||
      (order.address && order.address.email);

    // Fallback: check users/{userId} if customerEmail is missing
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

    // Clean placeholder phone emails if any
    const isSyntheticEmail = customerEmail && customerEmail.includes('@domeal.co.uk') && !customerEmail.startsWith('admin');
    const validCustomerEmail = !isSyntheticEmail && customerEmail && customerEmail.includes('@') ? customerEmail.trim() : null;

    const transporter = getTransporter();
    const adminRecipients = await getAdminRecipients();
    const totalAmount = Number(order.totalAmount || order.total || order.amount || 0).toFixed(2);
    const smtpFromUser = process.env.SMTP_USER || 'domealuk@gmail.com';

    // Resolve dynamic delivery slot label & time
    let formattedDeliverySlot = order.deliverySlot || '';
    try {
      let deliverySlots: any[] = [];
      if (dbAdmin) {
        const snap = await dbAdmin.collection('settings').doc('global').get();
        if (snap.exists) deliverySlots = snap.data()?.deliverySlots || [];
      } else {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) deliverySlots = snap.data()?.deliverySlots || [];
      }
      if (formattedDeliverySlot && Array.isArray(deliverySlots)) {
        const matched = deliverySlots.find((s: any) => s.id === formattedDeliverySlot);
        if (matched) {
          formattedDeliverySlot = matched.time ? `${matched.label} (${matched.time})` : matched.label;
        }
      }
    } catch (e) {
      console.error('[emailService] Error fetching slot settings:', e);
    }

    // Format items list
    let itemsHtml = '';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsHtml = `
        <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1E3B2B; font-weight: 700;">Ordered Items:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${order.items
              .map(
                (item: any) => `
              <tr>
                <td style="padding: 6px 0; color: #334155; border-bottom: 1px solid #f1f5f9;">
                  <strong>${item.quantity || item.qty || 1}x</strong> ${item.name || item.title || 'Meal'}
                </td>
                <td style="padding: 6px 0; text-align: right; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">
                  £${Number(item.price || 0).toFixed(2)}
                </td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
      `;
    }

    // Format delivery address
    let addressHtml = '';
    if (order.address) {
      const addr = order.address;
      addressHtml = `
        <tr>
          <td style="padding: 8px 0; color: #64748b; vertical-align: top; width: 140px;">Delivery Address:</td>
          <td style="padding: 8px 0; font-weight: 500; color: #111827;">
            ${addr.fullName ? `<strong>${addr.fullName}</strong><br/>` : ''}
            ${addr.addressLine1 || ''}${addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br/>
            ${addr.city || ''} ${addr.postcode || ''}<br/>
            ${addr.phone ? `Phone: ${addr.phone}` : ''}
          </td>
        </tr>
      `;
    }

    // Format delivery dates
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

    // Customer Email HTML
    const htmlBodyUser = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your DoMeal Order Confirmation</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 40px 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #C39B54; background-color: #1E3B2B;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">Order Confirmed! 🎉</h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">Thank you for ordering with DoMeal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${order.address?.fullName || 'Foodie'},</p>
              <p style="font-size: 16px; line-height: 1.6;">Thank you for your order! We have received your order and our chefs are getting ready to prepare your fresh, authentic home-cooked meals.</p>
              
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 10px; margin-bottom: 15px;">
                  Order Summary
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 140px;">Order ID:</td>
                    <td style="padding: 8px 0; font-weight: 700; color: #111827;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Status:</td>
                    <td style="padding: 8px 0; font-weight: 700; color: #1E3B2B;">${order.status || 'Order Received'}</td>
                  </tr>
                  ${deliveryDatesHtml}
                  ${addressHtml}
                  ${formattedDeliverySlot ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Delivery Slot:</td>
                    <td style="padding: 8px 0; font-weight: 500; color: #111827;">${formattedDeliverySlot}</td>
                  </tr>
                  ` : ''}
                  ${order.subscriptionFrequency ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Frequency:</td>
                    <td style="padding: 8px 0; font-weight: 500; color: #111827;">${order.subscriptionFrequency}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 10px 0; color: #64748b; border-top: 2px solid #e2e8f0;">Total Paid:</td>
                    <td style="padding: 10px 0; font-weight: 800; color: #1E3B2B; border-top: 2px solid #e2e8f0; font-size: 20px;">£${totalAmount}</td>
                  </tr>
                </table>
                ${itemsHtml}
              </div>

              ${order.notes ? `
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>Special Instructions:</strong> ${order.notes}</p>
              </div>
              ` : ''}

              <p style="font-size: 15px; line-height: 1.6; color: #475569;">If you have any questions about your delivery, feel free to reply directly to this email or reach us at <a href="mailto:admin@vegchennaisrilalitha.co.uk" style="color: #1E3B2B; font-weight: 600;">admin@vegchennaisrilalitha.co.uk</a>.</p>

              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Warmly,<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8faf9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} DoMeal. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Admin Email HTML
    const htmlBodyAdmin = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Alert: ${orderId}</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          <tr>
            <td style="background-color: #1E3B2B; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">📦 New Order Alert: #${orderId}</h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">DoMeal Admin Notification &bull; Total: £${totalAmount}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <!-- Customer Details -->
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
                  👤 Customer Details
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 140px; font-weight: 600;">Customer Name:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #111827;">${order.address?.fullName || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Email:</td>
                    <td style="padding: 4px 0;">
                      <a href="mailto:${validCustomerEmail || customerEmail}" style="color: #1E3B2B; font-weight: 600;">${validCustomerEmail || customerEmail || 'Not specified'}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Phone:</td>
                    <td style="padding: 4px 0;">
                      <a href="tel:${order.address?.phone}" style="color: #1E3B2B; font-weight: 600;">${order.address?.phone || 'Not specified'}</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Order & Delivery Info -->
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 15px; border-bottom: 2px solid #C39B54; padding-bottom: 8px; margin-bottom: 12px;">
                  🚚 Delivery & Schedule
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  ${addressHtml}
                  ${deliveryDatesHtml}
                  ${formattedDeliverySlot ? `
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Delivery Slot:</td>
                    <td style="padding: 4px 0; font-weight: 600; color: #111827;">${formattedDeliverySlot}</td>
                  </tr>
                  ` : ''}
                  ${order.subscriptionFrequency ? `
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Plan Frequency:</td>
                    <td style="padding: 4px 0; font-weight: 600; color: #111827;">${order.subscriptionFrequency}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Status:</td>
                    <td style="padding: 4px 0; font-weight: 700; color: #1E3B2B;">${order.status || 'Order Received'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 700; border-top: 1px solid #e2e8f0;">Total Order Amount:</td>
                    <td style="padding: 8px 0; font-weight: 800; color: #1E3B2B; border-top: 1px solid #e2e8f0; font-size: 18px;">£${totalAmount}</td>
                  </tr>
                </table>
                ${itemsHtml}
              </div>

              ${order.notes ? `
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                <strong style="color: #92400e; font-size: 13px;">📝 Special Instructions:</strong>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #78350f;">${order.notes}</p>
              </div>
              ` : ''}

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px; margin-bottom: 0;">
                Automated alert sent to admin emails: <code>${adminRecipients.join(', ')}</code>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              DoMeal Admin Management System &copy; ${new Date().getFullYear()}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    let emailSentToUser = false;
    let emailSentToAdmin = false;

    // Send customer email
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
    } else {
      console.warn(`[emailService] ⚠️ No valid customer email found for order ${orderId} (${customerEmail || 'none'})`);
    }

    // Send admin notification
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

    // Update order with confirmation flag
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
        console.log(`[emailService] Order ${orderId} marked with confirmationEmailSent = true`);
      } catch (updErr) {
        console.error(`[emailService] Error updating confirmationEmailSent on order ${orderId}:`, updErr);
      }
    }

    return {
      success: true,
      emailSentToUser,
      emailSentToAdmin,
      customerEmail: validCustomerEmail,
      adminRecipients,
    };
  } catch (error: any) {
    console.error(`[emailService] Error processing order emails for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Corporate Catering Inquiry Emails (to admins and customer confirmation)
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

    // Dishes HTML
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

    // HTML Admin Email
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

    // Customer Inquiry Confirmation Email HTML
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

    // Send Admin Email
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

    // Send Customer Confirmation Email
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
