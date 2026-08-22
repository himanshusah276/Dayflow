import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`📧 EmailService: Configured SMTP transport (${host}:${port})`);
  } else {
    // Development / fallback logger transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n================== 📧 OUTGOING EMAIL LOG 📧 ==================');
        console.log(`To:      ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`From:    ${mailOptions.from || process.env.EMAIL_FROM || 'no-reply@dayflow.com'}`);
        console.log('--------------------------------------------------------------');
        console.log(mailOptions.text || mailOptions.html);
        console.log('==============================================================\n');
        return { messageId: `dev-mock-${Date.now()}` };
      }
    };
    console.log('📧 EmailService: Running in development mode (email output logged to console).');
  }

  return transporter;
}

export async function sendVerificationEmail({ to, name, code }) {
  const mailTransporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || 'Dayflow HRMS <no-reply@dayflow.com>';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .content { padding: 32px 28px; }
        .pin-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
        .pin-code { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #15803d; margin: 0; }
        .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Dayflow</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Human Resource & Workforce Management</p>
        </div>
        <div class="content">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Verify Your Email Address</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Hello ${name || 'there'},<br><br>
            Thank you for registering your account on Dayflow. To activate your account and gain access to your employee self-service portal, please use the 6-digit verification code below:
          </p>
          <div class="pin-box">
            <p class="pin-code">${code}</p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            This verification code is valid for <strong>24 hours</strong>. If you did not sign up for Dayflow HRMS, please ignore this email.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Dayflow HRMS. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return await mailTransporter.sendMail({
    from: fromAddress,
    to,
    subject: `Your Dayflow Verification Code: ${code}`,
    text: `Your Dayflow verification code is: ${code}. This code expires in 24 hours.`,
    html
  });
}

export async function sendLeaveStatusEmail({ to, name, leaveType, status, startDate, endDate, remark }) {
  const mailTransporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || 'Dayflow HRMS <no-reply@dayflow.com>';
  const isApproved = status === 'Approved';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
        .content { padding: 28px; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; background: ${isApproved ? '#dcfce7' : '#ffe4e6'}; color: ${isApproved ? '#166534' : '#9f1239'}; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0; font-size: 20px;">Dayflow Leave Management</h2>
        </div>
        <div class="content">
          <p>Hi ${name || 'Team Member'},</p>
          <p>Your <strong>${leaveType} Leave</strong> request for <strong>${startDate} to ${endDate}</strong> has been:</p>
          <div style="margin: 16px 0;">
            <span class="badge">${status.toUpperCase()}</span>
          </div>
          ${remark ? `<p style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px;"><strong>HR Remark:</strong> ${remark}</p>` : ''}
          <p style="font-size: 13px; color: #64748b;">You can review your updated leave balance on your Dayflow dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await mailTransporter.sendMail({
    from: fromAddress,
    to,
    subject: `Leave Request ${status}: ${leaveType} (${startDate} - ${endDate})`,
    text: `Your ${leaveType} leave request for ${startDate} to ${endDate} has been ${status.toLowerCase()}.${remark ? ` Remark: ${remark}` : ''}`,
    html
  });
}
