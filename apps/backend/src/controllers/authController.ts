import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email';
import dotenv from 'dotenv';

dotenv.config();
export const register = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create user with verification token (temporary solution since no verification fields in schema)
    const user = await prisma.users.create({
      data: {
        email,
        name,
        role: 'user',
        is_verified: false,
        // Store token in password field temporarily (you should add verification fields to schema)
        password: verificationToken,
      },
    });
    console.log('EMAIL_HOST =', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT =', process.env.EMAIL_PORT);
    console.log('EMAIL_USER =', process.env.EMAIL_USER);
    console.log('EMAIL_PASS =', process.env.EMAIL_PASS ? '[SET]' : '[MISSING]');

    await sendVerificationEmail(email, verificationToken);

    res.json({
      message: 'Verification email sent',
      userId: user.id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Find user by temporary token stored in password field
    const user = await prisma.users.findFirst({
      where: {
        password: token,
        is_verified: false,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be between 6 and 10 characters',
      });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        password: hashedPassword,
      },
    });

    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      is_verified: true,
    });

    res.json({
      message: 'Email verified successfully',
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_verified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      return res.status(400).json({
        error: 'Email not verified',
        message: 'Please verify your email before logging in',
      });
    }

    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
    });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_verified: user.is_verified,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether email exists
      return res.json({
        message: 'If the email exists, a reset link will be sent',
      });
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token temporarily (you should add reset token fields to schema)
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: resetToken, // Temporary storage
      },
    });

    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await prisma.users.findFirst({
      where: {
        password: token, // Looking for reset token
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be between 6 and 10 characters',
      });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
