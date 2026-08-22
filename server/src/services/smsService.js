import dotenv from 'dotenv';

dotenv.config();

// Standardize phone number format (+91 for 10-digit Indian numbers)
export function normalizePhoneNumber(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return digits;
}

export async function sendOtpSms({ phone, name, code }) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const message = `Your Dayflow HRMS verification code is: ${code}. Valid for 24 hours. Do not share this with anyone.`;

  // Check if Twilio is configured in .env
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  // Check if Fast2SMS (Indian SMS Gateway) is configured
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;

  if (fast2SmsKey && normalizedPhone) {
    try {
      const indianNumber = normalizedPhone.replace('+91', '').replace('+', '');
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: code,
          numbers: indianNumber
        })
      });
      const data = await res.json();
      console.log(`📱 Fast2SMS Gateway Dispatch to ${normalizedPhone}:`, data);
      return { success: true, gateway: 'fast2sms', response: data };
    } catch (err) {
      console.error('Fast2SMS gateway error:', err.message);
    }
  }

  if (twilioSid && twilioAuth && twilioPhone && normalizedPhone) {
    try {
      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const formData = new URLSearchParams({
        To: normalizedPhone,
        From: twilioPhone,
        Body: message
      });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });
      const data = await res.json();
      console.log(`📱 Twilio SMS Gateway Dispatch to ${normalizedPhone}:`, data);
      return { success: true, gateway: 'twilio', response: data };
    } catch (err) {
      console.error('Twilio SMS gateway error:', err.message);
    }
  }

  // Local / Development SMS Logger Transporter
  console.log('\n================== 📱 OUTGOING SMS OTP LOG 📱 ==================');
  console.log(`To:      ${normalizedPhone}`);
  console.log(`Name:    ${name || 'Team Member'}`);
  console.log(`Code:    ${code}`);
  console.log('--------------------------------------------------------------');
  console.log(message);
  console.log('==============================================================\n');

  return {
    success: true,
    gateway: 'dev_mock',
    phone: normalizedPhone,
    code
  };
}
