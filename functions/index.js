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
  return [
    'orders@domeal.co.uk',
    'admin@vegchennaisrilalitha.co.uk',
    'Digitalbotsolutions@gmail.com',
    'rahulbadugu22@gmail.com',
  ];
};

/**
 * Replace placeholders like {{orderId}} or {{customerName}} in templates
 */
const replaceVars = (str, vars) => {
  if (!str || typeof str !== 'string') return '';
  let res = str;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    res = res.replace(regex, val !== undefined && val !== null ? String(val) : '');
  }
  return res;
};

/**
 * Fetch dynamic global settings (email templates & delivery slots) from Firestore settings/global
 */
const getGlobalSettings = async () => {
  try {
    const db = getFirestore();
    const globalDoc = await db.collection('settings').doc('global').get();
    if (globalDoc.exists) {
      return globalDoc.data() || {};
    }
  } catch (err) {
    console.error('Error fetching global settings:', err);
  }
  return {};
};

const getEmailTemplates = async () => {
  const globalData = await getGlobalSettings();
  return globalData.emailTemplates || null;
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

    // Fetch dynamic email template
    const templates = await getEmailTemplates();
    const corpTemplates = templates?.corporateInquiry || {};
    const templateVars = {
      companyName,
      contactName,
      email,
      phone,
      paxCount,
      eventDate,
      eventTime,
    };

    const adminSubject = replaceVars(
      corpTemplates.adminSubject || `🍱 New Corporate Catering Inquiry: {{companyName}} ({{paxCount}} Pax - {{eventDate}})`,
      templateVars
    );
    const customerSubject = replaceVars(
      corpTemplates.customerSubject || `We Received Your Corporate Catering Inquiry - {{companyName}}`,
      templateVars
    );
    const customerMsg = replaceVars(
      corpTemplates.customerMessage || `Thank you for inquiring about corporate catering for <strong>{{companyName}}</strong>. Our team has received your request for <strong>{{paxCount}} guests</strong> on <strong>{{eventDate}}</strong> and will contact you shortly.`,
      templateVars
    );

    const mailOptions = {
      from: `"DoMeal Corporate Inquiries" <${process.env.SMTP_USER || "domealuk@gmail.com"}>`,
      to: await getAdminRecipients(),
      subject: adminSubject,
      html: htmlBody,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email notification sent successfully to [${(await getAdminRecipients()).join(", ")}]. Message ID: ${info.messageId}`);

      // Send customer acknowledgment email if email provided
      if (email && email.includes('@')) {
        try {
          await transporter.sendMail({
            from: `"DoMeal Corporate Catering" <${process.env.SMTP_USER || "domealuk@gmail.com"}>`,
            to: email.trim(),
            subject: customerSubject,
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
                <h2 style="color: #1E3B2B;">Inquiry Received! 🍱</h2>
                <p>Hi ${contactName},</p>
                <p>${customerMsg}</p>
                <p>Warm regards,<br><strong>The DoMeal Team</strong></p>
              </div>
            `,
          });
          console.log(`✅ Customer inquiry confirmation sent to ${email}`);
        } catch (cErr) {
          console.error(`Failed sending customer acknowledgment email:`, cErr);
        }
      }
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
    
    // Fetch dynamic welcome email template
    const templates = await getEmailTemplates();
    const welcomeTemplates = templates?.welcomeEmail || {};
    const welcomeVars = {
      userName: user.name || 'Foodie',
      email: user.email,
    };

    const welcomeSubject = replaceVars(welcomeTemplates.subject || 'Welcome to DoMeal! 🎉', welcomeVars);
    const welcomeHeading = replaceVars(welcomeTemplates.heading || 'Welcome to DoMeal!', welcomeVars);
    const welcomeBody = replaceVars(
      welcomeTemplates.bodyMessage || 'Thank you for joining DoMeal! We are thrilled to have you with us.\n\nYour journey to enjoying fresh, authentic, and delicious home-cooked Indian meals starts right here. Explore our menu and find your new favorite dish.',
      welcomeVars
    );
    const welcomeBtn = replaceVars(welcomeTemplates.buttonText || 'Order Now', welcomeVars);

    // Email to User
    const htmlBodyUser = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${welcomeSubject}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 40px 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #C39B54;">
              <img src="https://domeal.co.uk/DOMEAL_Logo.png" alt="DoMeal Logo" style="height: 65px; margin-bottom: 15px;" />
              <h1 style="color: #1E3B2B; margin: 0; font-size: 24px; font-weight: 700;">${welcomeHeading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${user.name || 'Foodie'},</p>
              <div style="font-size: 16px; line-height: 1.6; color: #334155; white-space: pre-line;">${welcomeBody}</div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://domeal.co.uk" style="background-color: #1E3B2B; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">${welcomeBtn}</a>
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
      subject: welcomeSubject,
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

    // Format items list with package choices / sub-items
    let itemsHtml = '';
    if (Array.isArray(order.items) && order.items.length > 0) {
      itemsHtml = `
        <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #1E3B2B; font-weight: 700;">Ordered Package & Items:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${order.items
              .map((item) => {
                const subItemsList =
                  Array.isArray(item.subItems) && item.subItems.length > 0
                    ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px; padding-left: 8px; border-left: 2px solid #C39B54;">
                        ${item.subItems.map((s) => s.name).join(', ')}
                      </div>`
                    : '';
                return `
                  <tr>
                    <td style="padding: 6px 0; color: #334155; border-bottom: 1px solid #f1f5f9;">
                      <strong>${item.quantity || item.qty || 1}x</strong> ${item.name || item.title || 'Meal'}
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

    // Format delivery address if available
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

    const totalAmount = Number(order.totalAmount || order.total || order.amount || 0).toFixed(2);

    // Fetch dynamic email templates & global settings
    const globalSettings = await getGlobalSettings();
    const templates = globalSettings.emailTemplates || {};
    const custOrderTpl = templates?.orderConfirmationCustomer || {};
    const adminOrderTpl = templates?.orderNotificationAdmin || {};

    // Dynamically resolve delivery slot label & time
    let formattedDeliverySlot = order.deliverySlot || '';
    if (formattedDeliverySlot) {
      const configuredSlots = globalSettings.deliverySlots || [];
      const matchedSlot = configuredSlots.find((s) => s.id === formattedDeliverySlot);
      if (matchedSlot) {
        formattedDeliverySlot = matchedSlot.time
          ? `${matchedSlot.label} (${matchedSlot.time})`
          : matchedSlot.label;
      }
    }

    const vars = {
      orderId,
      customerName: order.address?.fullName || 'Valued Customer',
      customerEmail: customerEmail || '',
      total: totalAmount,
      frequency: order.subscriptionFrequency || 'Delivery every 1 Week',
      deliverySlot: formattedDeliverySlot,
      status: order.status || 'Order Received',
    };

    const custSubject = replaceVars(custOrderTpl.subject || 'Your DoMeal Order Confirmation - #{{orderId}}', vars);
    const custHeading = replaceVars(custOrderTpl.heading || 'Order Confirmed! 🎉', vars);
    const custSubheading = replaceVars(custOrderTpl.subheading || 'Thank you for ordering with DoMeal', vars);
    const custIntro = replaceVars(
      custOrderTpl.introMessage || 'Thank you for your order! We have received your subscription and our kitchen team is preparing your fresh, authentic home-cooked meals.',
      vars
    );
    const custFooter = replaceVars(
      custOrderTpl.footerMessage || 'If you have any questions, feel free to reply directly to this email or contact us at orders@domeal.co.uk.',
      vars
    );

    const adminSubject = replaceVars(adminOrderTpl.subject || '📦 New Order Alert: #{{orderId}} - £{{total}}', vars);
    const adminHeading = replaceVars(adminOrderTpl.heading || '📦 New Order Alert: #{{orderId}}', vars);
    const adminSubheading = replaceVars(adminOrderTpl.subheading || 'DoMeal Admin Notification • Total: £{{total}}', vars);
    const adminNotes = replaceVars(
      adminOrderTpl.adminNotes || 'Automated alert dispatched by Cloud Functions. Please ensure timely kitchen preparation and packaging.',
      vars
    );

    // Customer Email Template
    const htmlBodyUser = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${custSubject}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f5; margin: 0; padding: 40px 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 30px; text-align: center; border-bottom: 2px solid #C39B54; background-color: #1E3B2B;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">${custHeading}</h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">${custSubheading}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${order.address?.fullName || 'Valued Customer'},</p>
              <div style="font-size: 16px; line-height: 1.6; color: #334155; white-space: pre-line;">${custIntro}</div>
              
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
                  ${order.subscriptionFrequency ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Plan Frequency:</td>
                    <td style="padding: 8px 0; font-weight: 700; color: #1E3B2B;">${order.subscriptionFrequency}</td>
                  </tr>
                  ` : ''}
                  ${deliveryDatesHtml}
                  ${formattedDeliverySlot ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Delivery Slot:</td>
                    <td style="padding: 8px 0; font-weight: 500; color: #111827;">${formattedDeliverySlot}</td>
                  </tr>
                  ` : ''}
                  ${addressHtml}
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

              <div style="font-size: 15px; line-height: 1.6; color: #475569; white-space: pre-line;">${custFooter}</div>

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

    // Admin Email Template
    const adminRecipients = await getAdminRecipients();
    const htmlBodyAdmin = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${adminSubject}</title>
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f5; margin: 0; padding: 20px; color: #1f2937;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          <tr>
            <td style="background-color: #1E3B2B; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">${adminHeading}</h1>
              <p style="color: #C39B54; margin: 6px 0 0 0; font-size: 14px; font-weight: 600;">${adminSubheading}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <!-- Package & Subscription Plan Highlight -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 13px; color: #065f46; font-weight: 700;">
                  🔁 Package & Subscription Plan: 
                  <span style="background-color: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 4px; font-weight: 800; margin-left: 4px;">
                    ${order.subscriptionFrequency || 'Delivery every 1 Week'}
                  </span>
                </p>
              </div>

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
                      <a href="mailto:${customerEmail}" style="color: #1E3B2B; font-weight: 600;">${customerEmail || 'Not specified'}</a>
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

              <!-- Delivery & Schedule Info -->
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

              <div style="background-color: #f1f5f9; border-left: 3px solid #1E3B2B; padding: 12px 14px; margin-bottom: 20px; font-size: 13px; color: #475569;">
                ${adminNotes}
              </div>

              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px; margin-bottom: 0;">
                Automated alert dispatched by Cloud Functions to: <code>${adminRecipients.join(', ')}</code>
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

    // Send customer email if email is present
    if (customerEmail && !customerEmail.includes('@domeal.co.uk')) {
      try {
        const userMailOptions = {
          from: `"DoMeal" <${process.env.SMTP_USER || 'domealuk@gmail.com'}>`,
          to: customerEmail,
          subject: custSubject,
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
          from: `"DoMeal Notifications" <${process.env.SMTP_USER || 'domealuk@gmail.com'}>`,
          to: adminRecipients,
          subject: adminSubject,
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
