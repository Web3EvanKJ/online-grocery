// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { emailService } from '../utils/email.js';
import { cacheService } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { constants } from '../config/constants.js';
import { AuthRequest } from '../types/index.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
      select: { id: true, is_verified: true }
    });

    if (existingUser) {
      if (existingUser.is_verified) {
        res.status(409).json({
          success: false,
          message: 'User already exists and is verified',
        });
        return;
      } else {
        // User exists but not verified - allow resending verification
        await prisma.users.delete({
          where: { id: existingUser.id }
        });
      }
    }

    // Generate referral code
    const referralCode = uuidv4().substring(0, 8).toUpperCase();

    // Create user without password
    const user = await prisma.users.create({
      data: {
        email,
        name,
        phone,
        role: 'user',
        referral_code: referralCode,
      },
    });

    // Generate verification token
    const verificationToken = uuidv4();
    await prisma.verification_tokens.create({
      data: {
        token: verificationToken,
        user_id: user.id,
        expiresAt: new Date(Date.now() + constants.VERIFICATION_TOKEN_EXPIRY),
      },
    });

    // Send verification email
    const emailSent = await emailService.sendEmail(
      email,
      emailService.generateVerificationEmail(verificationToken, name)
    );

    if (!emailSent) {
      logger.warn(`Failed to send verification email to: ${email}`);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      data: {
        userId: user.id,
        emailSent,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find valid verification token
    const verification = await prisma.verification_tokens.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        used: false,
      },
      include: { user: true },
    });

    if (!verification) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: verification.user_id },
        data: {
          is_verified: true,
          password: hashedPassword,
        },
      });

      await tx.verification_tokens.update({
        where: { id: verification.id },
        data: { used: true },
      });
    });

    // Invalidate any cached user data
    await cacheService.invalidateUserCaches(verification.user_id);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.',
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        is_verified: true,
        name: true,
        profile_image: true,
      },
    });

    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email first',
      });
      return;
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Fix JWT signing - use proper options format
    const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: Number(constants.JWT_EXPIRY) || '1h',
    });

    const refreshToken = jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: Number(constants.JWT_REFRESH_EXPIRY) || '7d',
    });

    // Set cookies
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Cache user data
    await cacheService.set(
      cacheService.generateUserKey(user.id),
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile_image: user.profile_image,
      },
      3600 // 1 hour
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile_image: user.profile_image,
        },
        accessToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    // Invalidate user cache
    if (req.user) {
      await cacheService.invalidateUserCaches(req.user.id);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.users.findUnique({
      where: { email, is_verified: true },
    });

    if (!user) {
      // Don't reveal whether user exists
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    await prisma.password_reset_tokens.create({
      data: {
        token: resetToken,
        user_id: user.id,
        expiresAt: new Date(Date.now() + constants.PASSWORD_RESET_TOKEN_EXPIRY),
      },
    });

    // Send reset email
    const emailSent = await emailService.sendEmail(
      email,
      emailService.generatePasswordResetEmail(resetToken, user.name)
    );

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
      data: { emailSent },
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset request',
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // Find valid reset token
    const resetToken = await prisma.password_reset_tokens.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        used: false,
      },
      include: { user: true },
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user and mark token as used
    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: resetToken.user_id },
        data: { password: hashedPassword },
      });

      await tx.password_reset_tokens.update({
        where: { id: resetToken.id },
        data: { used: true },
      });
    });

    // Invalidate user cache
    await cacheService.invalidateUserCaches(resetToken.user_id);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset',
    });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.users.findUnique({
      where: { email, is_verified: false },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found or already verified',
      });
      return;
    }

    // Delete any existing verification tokens
    await prisma.verification_tokens.deleteMany({
      where: { user_id: user.id },
    });

    // Generate new verification token
    const verificationToken = uuidv4();
    await prisma.verification_tokens.create({
      data: {
        token: verificationToken,
        user_id: user.id,
        expiresAt: new Date(Date.now() + constants.VERIFICATION_TOKEN_EXPIRY),
      },
    });

    // Send verification email
    const emailSent = await emailService.sendEmail(
      email,
      emailService.generateVerificationEmail(verificationToken, user.name)
    );

    res.json({
      success: true,
      message: 'Verification email sent successfully.',
      data: { emailSent },
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during resend verification',
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId, is_verified: true },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: Number(constants.JWT_EXPIRY) || '1h' }
    );

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};