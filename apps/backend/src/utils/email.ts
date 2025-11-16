import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  console.log('📧 [Email] Preparing verification email...');
  console.log('📧 [Email] To:', email);
  console.log('📧 [Email] Token:', token);

  try {
    const verificationUrl = `${token}`;

    console.log('📧 [Email] Sending via Resend...');

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Email Verification',
      html: `"${verificationUrl}" This token will expire in 1 hour.`,
    });

    if (error) {
      console.error('❌ [Resend Error]:', error);
      return false;
    }

    console.log('✅ [Email] Email sent successfully!');
    console.log('📨 [Email Info]:', data);

    return true;
  } catch (err: any) {
    console.error('❌ [Email Error] Failed to send email!');
    console.error('❌ RESEND ERROR:', err?.message || err);
    console.error('❌ FULL ERROR:', err);
    return false;
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Reset Password',
      html: `"${resetUrl}" This reset password token will expire in 1 hour.`,
    });

    if (error) {
      console.error('❌ [Resend Error - Password Reset]:', error);
      return false;
    }

    console.log('✅ [Password Reset Email] Sent successfully!');
    return true;
  } catch (err: any) {
    console.error('❌ [Password Reset Email Error]:', err);
    return false;
  }
};