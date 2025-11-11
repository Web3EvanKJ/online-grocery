// src/utils/email.ts
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { EmailTemplate } from '../types/index.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  private async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email transporter verification failed:', error);
      return false;
    }
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const isConnected = await this.verifyConnection();
      if (!isConnected) {
        throw new Error('Email service not available');
      }

      const mailOptions = {
        from: `"Grocify" <${env.EMAIL_USER}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  generateVerificationEmail(token: string, name?: string): EmailTemplate {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
    const subject = 'Verify Your Grocify Account';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Grocify! 🛒</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || 'there'}!</h2>
            <p>Thank you for registering with Grocify. To complete your registration and set your password, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>This verification link will expire in 1 hour.</p>
            <p>If you didn't create an account with Grocify, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Grocify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Grocify!
      
      Thank you for registering. To complete your registration and set your password, please verify your email address by visiting:
      
      ${verificationUrl}
      
      This verification link will expire in 1 hour.
      
      If you didn't create an account with Grocify, please ignore this email.
      
      Best regards,
      The Grocify Team
    `;

    return { subject, html, text };
  }

  generatePasswordResetEmail(token: string, name?: string): EmailTemplate {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Reset Your Grocify Password';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || 'there'}!</h2>
            <p>We received a request to reset your Grocify account password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This reset link will expire in 30 minutes and can only be used once.</p>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Grocify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      We received a request to reset your Grocify account password. Visit the link below to create a new password:
      
      ${resetUrl}
      
      This reset link will expire in 30 minutes and can only be used once.
      
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      
      Best regards,
      The Grocify Team
    `;

    return { subject, html, text };
  }
}

export const emailService = new EmailService();