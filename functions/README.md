# DoMeal Firebase Cloud Functions - Corporate Catering Email Integration

This directory contains the Firebase Cloud Function (`sendCorporateInquiryNotification`) that automatically triggers whenever a new corporate catering inquiry form is submitted to the `corporateInquiries` Firestore collection.

It sends an automated notification email containing all inquiry details (Company Name, Contact Person, Email, Phone, Event Date, Pax Count, Package Details, Estimated Total, and Special Notes) to:
- **`Digitalbotsolutions@gmail.com`**
- **`rahulbadugu22@gmail.com`**

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

From inside the `functions` directory, run:
```bash
cd functions
npm install
```

### 2. Configure SMTP Credentials (Gmail App Password)

To send emails using Gmail, generate an **App Password** for your Gmail account:
1. Go to your Google Account Settings -> **Security** -> **2-Step Verification** (Enable if not already enabled).
2. Scroll to **App passwords**.
3. Create an App Password for **Mail** / **Other (Custom Name: DoMeal Functions)**.
4. Copy the generated 16-character password.

#### Local Testing (.env)
Create a `.env` file inside the `functions/` directory:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=domealuk79812@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
```

#### Production Secret Configuration (Firebase CLI)
Set secrets in Firebase Secret Manager:
```bash
firebase functions:secrets:set SMTP_USER
# Enter email: domealuk79812@gmail.com

firebase functions:secrets:set SMTP_PASS
# Enter your 16-character App Password
```

---

## 🚀 Deployment

Login to Firebase and deploy the functions:

```bash
# 1. Login to Firebase CLI (if not logged in)
firebase login

# 2. Deploy only cloud functions
firebase deploy --only functions
```

---

## 🧪 Testing

1. Submit a corporate catering inquiry on your website (`/corporate-catering`).
2. Verify the document is added to the `corporateInquiries` collection in Firestore.
3. Check the Firebase Cloud Functions logs:
   ```bash
   firebase functions:log
   ```
4. Verify that `Digitalbotsolutions@gmail.com` and `rahulbadugu22@gmail.com` received the email notification.
