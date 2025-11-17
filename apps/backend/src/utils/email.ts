import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  console.log('📧 [Email] Preparing verification email...');
  console.log('📧 [Email] To:', email);
  console.log('📧 [Email] Token:', token);

  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    console.log('📧 [Email] Sending via Resend...');

    const { data, error } = await resend.emails.send({
      from: 'Your App <noreply@resend.dev>', // You can use resend.dev for testing
      to: email,
      subject: 'Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
          <p style="margin-top: 20px; color: #666;">
            Or copy and paste this link in your browser:<br/>
            <code>${verificationUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px;">
            This verification link will expire in 1 hour.
          </p>
        </div>
      `,
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
    console.error('❌ FULL ERROR:', err);
    return false;
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  console.log('📧 [Email] Preparing reset password email...');

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Your App <noreply@resend.dev>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666;">
            Or copy and paste this link in your browser:<br/>
            <code>${resetUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px;">
            This reset password link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ [Resend Error]:', error);
      return false;
    }

    console.log('✅ [Email] Reset password email sent successfully!');
    return true;
  } catch (err: any) {
    console.error('❌ [Email Error] Failed to send reset password email!', err);
    return false;
  }
};