import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const RECIPIENTS = [
  'Digitalbotsolutions@gmail.com',
  'rahulbadugu22@gmail.com',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName = 'N/A',
      contactName = 'N/A',
      email = 'N/A',
      phone = 'N/A',
      eventDate = 'N/A',
      eventTime = 'Not specified',
      eventLocation = 'Not specified',
      selectedPackage = 'Not specified',
      paxCount = 0,
      estimatedTotal = 0,
      specialNotes = '',
    } = body;

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const user = process.env.SMTP_USER || 'domealuk@gmail.com';
    const pass = process.env.SMTP_PASS || 'elqwohzzejtphnyr';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: { user, pass },
    });

    const formattedDate = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

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
                DoMeal London - Instant Website Lead Alert
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
                    <td style="padding: 6px 0; font-weight: 600; color: #111827;">${selectedPackage}</td>
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
                Submitted on ${formattedDate}
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

    const mailOptions = {
      from: `"DoMeal Corporate Inquiries" <${user}>`,
      to: RECIPIENTS,
      subject: `🍱 New Corporate Catering Inquiry: ${companyName} (${paxCount} Pax - ${eventDate})`,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Direct corporate email sent successfully: ${info.messageId}`);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('❌ Failed sending corporate email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
