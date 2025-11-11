// src/controllers/profileController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import { prisma } from '../lib/prisma.js';
import { cacheService } from '../utils/cache.js';
import { emailService } from '../utils/email.js';
import { logger } from '../utils/logger.js';
import { AuthRequest } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary } from '@/config/cloudinary.js';
import { ApiResponseUtil } from '@/utils/api.js';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cacheKey = cacheService.generateUserKey(userId);

    const user = await cacheService.wrap(
      cacheKey,
      async () => {
        return await prisma.users.findUnique({
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
            created_at: true,
            updated_at: true,
          },
        });
      },
      3600 // 1 hour
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, email } = req.body;

    const updateData: any = {};
    let needsReVerification = false;

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // Check if email is being changed
    if (email && email !== req.user!.email) {
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
      }

      updateData.email = email;
      updateData.is_verified = false;
      needsReVerification = true;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_verified: true,
        profile_image: true,
        referral_code: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Invalidate user cache
    await cacheService.invalidateUserCaches(userId);

    let emailSent = false;
    if (needsReVerification) {
      // Generate new verification token
      const verificationToken = uuidv4();
      await prisma.verification_tokens.create({
        data: {
          token: verificationToken,
          user_id: userId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Send verification email
      emailSent = await emailService.sendEmail(
        email,
        emailService.generateVerificationEmail(verificationToken, name)
      );
    }

    res.json({
      success: true,
      message: needsReVerification 
        ? 'Profile updated. Please verify your new email address.' 
        : 'Profile updated successfully',
      data: {
        user: updatedUser,
        emailSent: needsReVerification ? emailSent : undefined,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Current password is not set',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Invalidate user cache
    await cacheService.invalidateUserCaches(userId);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    throw error;
  }
};

// Updated profile image upload in profileController.ts
export const updateProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return ApiResponseUtil.validationError(res, [
        { field: 'image', message: 'No image file provided' }
      ]);
    }

    const userId = req.user!.id;

    // Process image
    const processedImage = await sharp(req.file.buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    let imageUrl: string;

    if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_URL) {
      // Upload to Cloudinary in production
      const uploadResult: any = await uploadToCloudinary(processedImage, 'grocify/profiles');
      imageUrl = uploadResult.secure_url;
    } else {
      // Local storage in development
      const filename = `profile-${userId}-${Date.now()}.jpg`;
      const imagePath = `uploads/profiles/${filename}`;
      await sharp(processedImage).toFile(imagePath);
      imageUrl = `/api/${imagePath}`;
    }

    // Update user profile image
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { profile_image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_verified: true,
        profile_image: true,
        referral_code: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Invalidate user cache
    await cacheService.invalidateUserCaches(userId);

    ApiResponseUtil.success(res, 'Profile image updated successfully', updatedUser);
  } catch (error) {
    logger.error('Update profile image error:', error);
    throw error;
  }
};

export const deleteProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { profile_image: true },
    });

    if (!user || !user.profile_image) {
      return res.status(400).json({
        success: false,
        message: 'No profile image to delete',
      });
    }

    // Update user to remove profile image
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { profile_image: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        is_verified: true,
        profile_image: true,
        referral_code: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Invalidate user cache
    await cacheService.invalidateUserCaches(userId);

    res.json({
      success: true,
      message: 'Profile image deleted successfully',
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Delete profile image error:', error);
    throw error;
  }
};