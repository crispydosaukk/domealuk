const fs = require('fs');
let code = fs.readFileSync('functions/index.js', 'utf8');

if (!code.includes('const getAdminRecipients')) {
  const getRecipientsCode = `
/**
 * Target Recipient Email Addresses (Dynamic)
 */
const getAdminRecipients = async () => {
  try {
    const { getFirestore } = require('firebase-admin/firestore');
    const db = getFirestore();
    const doc = await db.collection('settings').doc('global').get();
    if (doc.exists && doc.data().adminEmails) {
      const activeEmails = doc.data().adminEmails.filter(e => e.enabled).map(e => e.email);
      if (activeEmails.length > 0) return activeEmails;
    }
  } catch (error) {
    console.error('Error fetching admin recipients:', error);
  }
  // Fallback
  return ['Digitalbotsolutions@gmail.com', 'rahulbadugu22@gmail.com'];
};
`;

  code = code.replace(/(\/\*\*[\s\S]*?Target Recipient Email Addresses[\s\S]*?const RECIPIENTS = \[[\s\S]*?\];)/, getRecipientsCode);
  code = code.replace('to: RECIPIENTS,', 'to: await getAdminRecipients(),');
  code = code.replace('RECIPIENTS.join', '(await getAdminRecipients()).join');
} else {
  // Update it to point to global
  code = code.replace(/doc\('settings'\)\.doc\('emailRecipients'\)/g, "doc('settings').doc('global')");
  code = code.replace(/doc\.data\(\)\.emails/g, 'doc.data().adminEmails');
}

fs.writeFileSync('functions/index.js', code);
console.log('Fixed index.js!');
