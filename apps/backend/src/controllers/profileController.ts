import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { uploadImage } from '../utils/cloudinary';
import { sendVerificationEmail } from '../utils/email';
import { v4 as uuidv4 } from 'uuid';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_verified: true,
        profile_image: true,
        referral_code: true,
        referred_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { name, phone, email, currentPassword, newPassword } = req.body;
    const file = req.file;

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let profileImageUrl = user.profile_image;
    let updatedEmail = user.email;
    let isVerified = user.is_verified;
    let updatedPassword = user.password;

    // Handle profile image upload
    if (file) {
      const result = await uploadImage(file);
      profileImageUrl = result.secure_url;
    }

    // Handle email change
    if (email && email !== user.email) {
      const emailExists = await prisma.users.findUnique({
        where: { email },
      });

      if (emailExists) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }

      updatedEmail = email;
      isVerified = false;

      // Send verification email for new email
      const verificationToken = uuidv4();
      await sendVerificationEmail(email, verificationToken);
      
      // Store verification token temporarily
      await prisma.users.update({
        where: { id: userId },
        data: { password: verificationToken },
      });
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required' });
        return;
      }

      if (!user.password) {
        res.status(400).json({ error: 'Password not set for this account' });
        return;
      }

      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      updatedPassword = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        phone: phone || user.phone,
        email: updatedEmail,
        is_verified: isVerified,
        profile_image: profileImageUrl,
        password: updatedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_verified: true,
        profile_image: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }

    const verificationToken = uuidv4();
    
    // Store token temporarily and send email
    await prisma.users.update({
      where: { id: userId },
      data: { password: verificationToken },
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};