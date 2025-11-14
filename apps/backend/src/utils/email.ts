import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  console.log('📧 [Email] Preparing verification email...');
  console.log('📧 [Email] To:', email);
  console.log('📧 [Email] Token:', token);

  try {
    const verificationUrl = `${token}`;

    console.log('📧 [Email] Sending via Nodemailer...');

    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `"${verificationUrl}" This token will expire in 1 hour.`,
    });

    console.log('✅ [Email] Email sent successfully!');
    console.log('📨 [Email Info]:', response);

    return true;
  } catch (err: any) {
    console.error('❌ [Email Error] Failed to send email!');
    console.error('❌ SMTP ERROR:', err?.message || err);
    console.error('❌ FULL ERROR:', err);

    // IMPORTANT: return false so your register route does not hang
    return false;
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Password',
    html: `"${resetUrl}" This reset password token will expire in 1 hour.`,
  });
};
