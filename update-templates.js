const fs = require('fs');
let code = fs.readFileSync('functions/index.js', 'utf8');

// Replacement for User Registration Email (to User)
const oldUserRegistrationHtml = `    const htmlBodyUser = \`
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
    \`;`;

const newUserRegistrationHtml = `    const htmlBodyUser = \`
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
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi \${user.name || 'Foodie'},</p>
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
              &copy; \${new Date().getFullYear()} DoMeal. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    \`;`;

// Replacement for Order Confirmation Email (to User)
const oldOrderConfirmationHtml = `    const htmlBodyUser = \`
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
    \`;`;

const newOrderConfirmationHtml = `    const htmlBodyUser = \`
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
                    <td style="padding: 8px 0; font-weight: 600; color: #111827;">\${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Status:</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #C39B54;">\${order.status}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #e2e8f0;">Total Amount:</td>
                    <td style="padding: 8px 0; font-weight: 700; color: #1E3B2B; border-top: 1px solid #e2e8f0; font-size: 18px;">£\${Number(order.totalAmount || order.amount || 0).toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 0;">Warmly,<br><strong style="color: #1E3B2B;">The DoMeal Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8faf9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
              &copy; \${new Date().getFullYear()} DoMeal. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    \`;`;

// Replace User Reg Template
if (code.includes('<h2>Welcome to DoMeal, ${user.name || \'Foodie\'}!</h2>')) {
  code = code.replace(oldUserRegistrationHtml, newUserRegistrationHtml);
}

// Replace Order Confirmation Template
if (code.includes('<h2>Order Confirmation - ${orderId}</h2>')) {
  code = code.replace(oldOrderConfirmationHtml, newOrderConfirmationHtml);
}

fs.writeFileSync('functions/index.js', code);
console.log('Templates updated!');
