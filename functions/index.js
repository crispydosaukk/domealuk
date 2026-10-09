const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const nodemailer = require("nodemailer");
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

/**
 * Configure Nodemailer Transporter.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false";
  const user = process.env.SMTP_USER || "domealuk@gmail.com";
  const pass = process.env.SMTP_PASS || "elqwohzzejtphnyr";

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
 * Target Recipient Email Addresses (Dynamic)
 */
const getAdminRecipients = async () => {
  try {
    const db = getFirestore();
    const globalDoc = await db.collection('settings').doc('global').get();
    if (globalDoc.exists && Array.isArray(globalDoc.data().adminEmails)) {
      const activeEmails = globalDoc.data().adminEmails
        .filter(e => e && e.enabled && e.email)
        .map(e => e.email.trim());
      if (activeEmails.length > 0) return activeEmails;
    }

    const doc = await db.collection('settings').doc('emailRecipients').get();
    if (doc.exists && Array.isArray(doc.data().adminEmails)) {
      const activeEmails = doc.data().adminEmails
        .filter(e => e && e.enabled && e.email)
        .map(e => e.email.trim());
      if (activeEmails.length > 0) return activeEmails;
    }
  } catch (error) {
    console.error('Error fetching admin recipients:', error);
  }
  // Fallback
  return ['Digitalbotsolutions@gmail.com', 'rahulbadugu22@gmail.com'];
};


/**
 * Firebase Cloud Function triggered when a new Corporate Inquiry document is created in Firestore.
 */
exports.sendCorporateInquiryNotification = onDocumentCreated(
  {
    document: "corporateInquiries/{inquiryId}",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const inquiry = snapshot.data();
    const inquiryId = event.params.inquiryId;

    console.log(`Processing corporate inquiry notification for Doc ID: ${inquiryId}`);

    const {
      companyName = "N/A",
      contactName = "N/A",
      email = "N/A",
      phone = "N/A",
      eventDate = "N/A",
      eventTime = "Not specified",
      eventLocation = "Not specified",
      selectedPackage = "Not specified",
      paxCount = 0,
      estimatedTotal = 0,
      selectedDishes = null,
      specialNotes = "",
      createdAt,
    } = inquiry;

    const formattedDate = createdAt && createdAt.toDate 
      ? createdAt.toDate().toLocaleString("en-GB", { timeZone: "Europe/London" })
      : new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });

    // HTML Email Template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Corporate Catering Inquiry</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1E3B2B; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                🍱 New Corporate Catering Inquiry
              </h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">
                DoMeal - Instant Lead Alert
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 24px;">
              
              <!-- Company & Contact Details -->
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">
                  🏢 Company & Contact Information
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;">Company Name:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #111827;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Contact Person:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${contactName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Email Address:</td>
                    <td style="padding: 6px 0;">
                      <a href="mailto:${email}" style="color: #1E3B2B; font-weight: 600; text-decoration: underline;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Phone Number:</td>
                    <td style="padding: 6px 0;">
                      <a href="tel:${phone}" style="color: #1E3B2B; font-weight: 600; text-decoration: underline;">${phone}</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Event & Booking Details -->
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">
                  📅 Event & Package Details
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;">Event Date:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Event Time:</td>
                    <td style="padding: 6px 0; color: #111827;">${eventTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Venue Location:</td>
                    <td style="padding: 6px 0; color: #111827;">${eventLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Package Selected:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${selectedPackage}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Number of Pax:</td>
                    <td style="padding: 6px 0; font-weight: 700; color: #1E3B2B;">${paxCount} Guests</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Estimated Total:</td>
                    <td style="padding: 6px 0; font-weight: 800; font-size: 16px; color: #1E3B2B;">£${Number(estimatedTotal).toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <!-- Selected Menu Choices -->
              ${selectedDishes ? `
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 8px;">
                  🍽️ Selected Menu & Dish Choices
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                  ${selectedDishes.chaat ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 140px;">Chaat Selection:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.chaat}</td>
                  </tr>` : ''}
                  ${selectedDishes.mains ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Main Course:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.mains}</td>
                  </tr>` : ''}
                  ${selectedDishes.bread ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Bread Selection:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.bread}</td>
                  </tr>` : ''}
                  ${selectedDishes.curries ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Curries:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.curries}</td>
                  </tr>` : ''}
                  ${selectedDishes.dessert ? `
                  <tr>
                    <td style="padding: 6px 0; font-weight: 600; color: #64748b;">Dessert Selection:</td>
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedDishes.dessert}</td>
                  </tr>` : ''}
                </table>
              </div>
              ` : ''}

              <!-- Special Notes -->
              ${specialNotes ? `
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #92400e; font-size: 15px; margin-bottom: 8px;">
                  📝 Special Notes / Requests
                </h2>
                <p style="margin: 0; font-size: 14px; color: #78350f; white-space: pre-wrap; line-height: 1.5;">${specialNotes}</p>
              </div>
              ` : ''}

              <!-- Submission Timestamp -->
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; margin-bottom: 0;">
                Submitted on ${formattedDate} | Document ID: <code>${inquiryId}</code>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              DoMeal Corporate Catering Automated System &copy; ${new Date().getFullYear()}
            </td>
          </tr>

        </table>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    const mailOptions = {
      from: `"DoMeal Corporate Inquiries" <${process.env.SMTP_USER || "domealuk@gmail.com"}>`,
      to: await getAdminRecipients(),
      subject: `🍱 New Corporate Catering Inquiry: ${companyName} (${paxCount} Pax - ${eventDate})`,
      html: htmlBody,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email notification sent successfully to [${(await getAdminRecipients()).join(", ")}]. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`❌ Failed to send email for corporate inquiry ${inquiryId}:`, error);
      throw error;
    }
  }
);


/**
 * Firebase Cloud Function triggered when a new User document is created.
 */
exports.sendUserRegistrationEmail = onDocumentCreated(
  {
    document: 'users/{userId}',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const user = snapshot.data();
    if (!user.email) return;

    const transporter = getTransporter();
    
    // Email to User
    const htmlBodyUser = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to DoMeal!</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 40px 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #C39B54;">
              <img src="https://domeal.co.uk/DOMEAL_Logo.png" alt="DoMeal Logo" style="height: 65px; margin-bottom: 15px;" />
              <h1 style="color: #1E3B2B; margin: 0; font-size: 24px; font-weight: 700;">Welcome to DoMeal!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${user.name || 'Foodie'},</p>
              <p style="font-size: 16px; line-height: 1.6;">Thank you for joining DoMeal! We are thrilled to have you with us.</p>
              <p style="font-size: 16px; line-height: 1.6;">Your journey to enjoying fresh, authentic, and delicious home-cooked Indian meals starts right here. Explore our menu and find your new favorite dish.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://domeal.co.uk" style="background-color: #1E3B2B; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Order Now</a>
              </div>
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

    const userMailOptions = {
      from: '"DoMeal" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
      to: user.email,
      subject: 'Welcome to DoMeal!',
      html: htmlBodyUser,
    };

    // Email to Admin
    const adminRecipients = await getAdminRecipients();
    const htmlBodyAdmin = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
      </body>
      </html>
    `;

    const adminMailOptions = {
      from: '"DoMeal Notifications" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
      to: adminRecipients,
      subject: 'New User Registered: ' + user.name,
      html: htmlBodyAdmin,
    };

    try {
      await transporter.sendMail(userMailOptions);
      if (adminRecipients.length > 0) {
        await transporter.sendMail(adminMailOptions);
      }
      console.log('✅ Registration emails sent successfully');
    } catch (error) {
      console.error('❌ Failed to send registration emails:', error);
    }
  }
);


/**
 * Firebase Cloud Function triggered when an Order document is created or updated in Firestore.
 */
exports.sendOrderConfirmationEmail = onDocumentWritten(
  {
    document: 'orders/{orderId}',
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot || !snapshot.after || !snapshot.after.exists) return;

    const order = snapshot.after.data();
    const orderId = event.params.orderId;

    // 1. Prevent duplicate email sending
    if (order.confirmationEmailSent) {
      return;
    }

    // 2. Validate confirmation status
    // Order is confirmed when status is 'Order Received', 'Confirmed', 'Placed', or 'Paid'
    const CONFIRMED_STATUSES = ['Order Received', 'Confirmed', 'Placed', 'Paid'];
    if (!CONFIRMED_STATUSES.includes(order.status)) {
      return;
    }

    // 3. Resolve customer email
    let customerEmail = order.customerEmail || order.email || order.userEmail || (order.address && order.address.email);

    // If customer email is not directly on the order, look up users/{userId}
    if (!customerEmail && order.userId && order.userId !== 'guest-user') {
      try {
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(order.userId).get();
        if (userDoc.exists && userDoc.data().email) {
          customerEmail = userDoc.data().email;
        }
      } catch (err) {
        console.error(`Error resolving customer email for user ${order.userId}:`, err);
      }
    }

    console.log(`Processing order confirmation email for Order ID: ${orderId}, Customer: ${customerEmail || 'Unknown'}`);

    const transporter = getTransporter();

    // Format items list if available
    let itemsHtml = '';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsHtml = `
        <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1E3B2B; font-weight: 700;">Ordered Items:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${order.items.map((item) => `
              <tr>
                <td style="padding: 4px 0; color: #334155;">${item.quantity || 1}x ${item.name || item.title || 'Meal'}</td>
                <td style="padding: 4px 0; text-align: right; color: #64748b; font-weight: 600;">£${Number(item.price || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }

    // Format delivery address if available
    let addressHtml = '';
    if (order.address) {
      const addr = order.address;
      addressHtml = `
        <tr>
          <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Delivery Address:</td>
          <td style="padding: 8px 0; font-weight: 500; color: #111827;">
            ${addr.fullName ? `<strong>${addr.fullName}</strong><br/>` : ''}
            ${addr.addressLine1 || ''}${addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br/>
            ${addr.city || ''} ${addr.postcode || ''}<br/>
            ${addr.phone ? `Phone: ${addr.phone}` : ''}
          </td>
        </tr>
      `;
    }

    const totalAmount = Number(order.totalAmount || order.total || order.amount || 0).toFixed(2);

    // Email to User
    const htmlBodyUser = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your DoMeal Order</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 40px 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #C39B54;">
              <img src="https://domeal.co.uk/DOMEAL_Logo.png" alt="DoMeal Logo" style="height: 65px; margin-bottom: 15px;" />
              <h1 style="color: #1E3B2B; margin: 0; font-size: 24px; font-weight: 700;">Order Confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0; text-align: center;">Thank you for your order. We are preparing your delicious meals and they will be delivered at your scheduled time.</p>
              
              <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h2 style="margin-top: 0; color: #1E3B2B; font-size: 16px; border-bottom: 2px solid #C39B54; padding-bottom: 10px; margin-bottom: 15px;">
                  Order Details
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 15px; line-height: 1.6;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 140px;">Order ID:</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #111827;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Status:</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #C39B54;">${order.status}</td>
                  </tr>
                  ${addressHtml}
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">Total Amount:</td>
                    <td style="padding: 8px 0; font-weight: 700; color: #1E3B2B; border-top: 1px solid #e2e8f0; font-size: 18px;">£${totalAmount}</td>
                  </tr>
                </table>
                ${itemsHtml}
              </div>

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

    // Email to Admin
    const adminRecipients = await getAdminRecipients();
    const htmlBodyAdmin = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Order Received: ${orderId}</h2>
        <p><strong>Customer Email:</strong> ${customerEmail || 'Not specified'}</p>
        <p><strong>Customer Name:</strong> ${order.address?.fullName || 'Not specified'}</p>
        <p><strong>Total Amount:</strong> £${totalAmount}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        ${itemsHtml}
      </body>
      </html>
    `;

    let emailSentToUser = false;
    let emailSentToAdmin = false;

    // Send customer email if email is present
    if (customerEmail) {
      try {
        const userMailOptions = {
          from: '"DoMeal" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
          to: customerEmail,
          subject: 'Your DoMeal Order Confirmation - ' + orderId,
          html: htmlBodyUser,
        };
        await transporter.sendMail(userMailOptions);
        emailSentToUser = true;
        console.log(`✅ Order confirmation email sent to customer: ${customerEmail}`);
      } catch (err) {
        console.error(`❌ Failed to send order confirmation email to customer (${customerEmail}):`, err);
      }
    } else {
      console.warn(`⚠️ No customer email available for order ${orderId}`);
    }

    // Send admin notification
    if (adminRecipients.length > 0) {
      try {
        const adminMailOptions = {
          from: '"DoMeal Notifications" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
          to: adminRecipients,
          subject: 'New Order Received: ' + orderId,
          html: htmlBodyAdmin,
        };
        await transporter.sendMail(adminMailOptions);
        emailSentToAdmin = true;
        console.log(`✅ Order notification sent to admin: [${adminRecipients.join(', ')}]`);
      } catch (err) {
        console.error('❌ Failed to send order notification to admin:', err);
      }
    }

    // Mark order with confirmationEmailSent = true to avoid duplicate emails
    if (emailSentToUser || emailSentToAdmin) {
      try {
        await snapshot.after.ref.update({
          confirmationEmailSent: true,
          confirmationEmailSentAt: new Date().toISOString(),
          ...(customerEmail && !order.customerEmail ? { customerEmail } : {}),
        });
      } catch (updateErr) {
        console.error('Error updating confirmationEmailSent flag on order:', updateErr);
      }
    }
  }
);
