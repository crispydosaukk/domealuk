const fs = require('fs');
let code = fs.readFileSync('functions/index.js', 'utf8');

const newImport = `const { getFirestore } = require('firebase-admin/firestore');\n`;
if (!code.includes('firebase-admin/firestore')) {
  code = code.replace('const nodemailer = require("nodemailer");', 'const nodemailer = require("nodemailer");\n' + newImport);
}

const getRecipientsCode = `
/**
 * Target Recipient Email Addresses (Dynamic)
 */
const getAdminRecipients = async () => {
  try {
    const db = getFirestore();
    const doc = await db.collection('settings').doc('emailRecipients').get();
    if (doc.exists && doc.data().emails) {
      const activeEmails = doc.data().emails.filter(e => e.enabled).map(e => e.email);
      if (activeEmails.length > 0) return activeEmails;
    }
  } catch (error) {
    console.error('Error fetching admin recipients:', error);
  }
  // Fallback
  return ['Digitalbotsolutions@gmail.com', 'rahulbadugu22@gmail.com'];
};
`;

if (!code.includes('const getAdminRecipients = async () =>')) {
  code = code.replace(/(\/\*\*[\s\S]*?Target Recipient Email Addresses[\s\S]*?const RECIPIENTS = \[[\s\S]*?\];)/, getRecipientsCode);

  code = code.replace('to: RECIPIENTS,', 'to: await getAdminRecipients(),');
  code = code.replace('RECIPIENTS.join', '(await getAdminRecipients()).join');
}

const userRegistrationCode = `
/**
 * Firebase Cloud Function triggered when a new User document is created.
 */
exports.sendUserRegistrationEmail = onDocumentCreated(
  {
    document: 'users/{userId}',
    secrets: ['SMTP_USER', 'SMTP_PASS'],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const user = snapshot.data();
    if (!user.email) return;

    const transporter = getTransporter();
    
    // Email to User
    const htmlBodyUser = \`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to DoMeal, \${user.name || 'Foodie'}!</h2>
        <p>Thank you for registering with us. We are excited to serve you authentic Indian meals.</p>
        <p>Your journey to great home-cooked food starts here.</p>
        <br/>
        <p>Best Regards,</p>
        <p>The DoMeal Team</p>
      </body>
      </html>
    \`;

    const userMailOptions = {
      from: '"DoMeal" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
      to: user.email,
      subject: 'Welcome to DoMeal!',
      html: htmlBodyUser,
    };

    // Email to Admin
    const adminRecipients = await getAdminRecipients();
    const htmlBodyAdmin = \`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> \${user.name}</p>
        <p><strong>Email:</strong> \${user.email}</p>
        <p><strong>Phone:</strong> \${user.phone || 'N/A'}</p>
      </body>
      </html>
    \`;

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
`;

const orderConfirmationCode = `
/**
 * Firebase Cloud Function triggered when a new Order document is created.
 */
exports.sendOrderConfirmationEmail = onDocumentCreated(
  {
    document: 'orders/{orderId}',
    secrets: ['SMTP_USER', 'SMTP_PASS'],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const order = snapshot.data();
    const orderId = event.params.orderId;
    
    // We only want to send email when it's just placed or successfully paid
    if (order.status !== 'Placed' && order.status !== 'Paid') return;
    
    // Wait for customer email
    let customerEmail = order.customerEmail || order.email;
    if (!customerEmail) return;

    const transporter = getTransporter();
    
    // Email to User
    const htmlBodyUser = \`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Order Confirmation - \${orderId}</h2>
        <p>Thank you for your order!</p>
        <p><strong>Total Amount:</strong> £\${Number(order.totalAmount || order.amount || 0).toFixed(2)}</p>
        <p><strong>Status:</strong> \${order.status}</p>
        <p>We are preparing your meal and will deliver it at the scheduled time.</p>
        <br/>
        <p>Best Regards,</p>
        <p>The DoMeal Team</p>
      </body>
      </html>
    \`;

    const userMailOptions = {
      from: '"DoMeal" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
      to: customerEmail,
      subject: 'Your DoMeal Order Confirmation',
      html: htmlBodyUser,
    };

    // Email to Admin
    const adminRecipients = await getAdminRecipients();
    const htmlBodyAdmin = \`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Order Received: \${orderId}</h2>
        <p><strong>Customer Email:</strong> \${customerEmail}</p>
        <p><strong>Total Amount:</strong> £\${Number(order.totalAmount || order.amount || 0).toFixed(2)}</p>
        <p><strong>Status:</strong> \${order.status}</p>
      </body>
      </html>
    \`;

    const adminMailOptions = {
      from: '"DoMeal Notifications" <' + (process.env.SMTP_USER || 'domealuk@gmail.com') + '>',
      to: adminRecipients,
      subject: 'New Order Received: ' + orderId,
      html: htmlBodyAdmin,
    };

    try {
      await transporter.sendMail(userMailOptions);
      if (adminRecipients.length > 0) {
        await transporter.sendMail(adminMailOptions);
      }
      console.log('✅ Order confirmation emails sent successfully');
    } catch (error) {
      console.error('❌ Failed to send order confirmation emails:', error);
    }
  }
);
`;

if (!code.includes('exports.sendUserRegistrationEmail')) {
  code += '\n' + userRegistrationCode + '\n' + orderConfirmationCode;
}
fs.writeFileSync('functions/index.js', code);
console.log('Functions updated successfully!');
