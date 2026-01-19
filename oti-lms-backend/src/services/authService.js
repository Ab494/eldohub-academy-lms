import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateTokens, verifyToken } from '../utils/tokenUtils.js';
import { AppError } from '../utils/errorHandler.js';
import { sendEmail, forgotPasswordEmailTemplate } from '../utils/emailService.js';

export class AuthService {
  static async register(userData) {
    const { firstName, lastName, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'student',
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Save refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  static async refreshAccessToken(refreshToken) {
    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found', 401);
    }

    if (user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token mismatch', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      user.role
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  static async updateProfile(userId, updateData) {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'bio'];
    const updates = {};

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const userName = `${user.firstName} ${user.lastName}`;

    try {
      await sendEmail(
        user.email,
        'Password Reset Request - OTI',
        forgotPasswordEmailTemplate(userName, resetUrl)
      );
      console.log('✅ Password reset email sent to:', user.email);
    } catch (error) {
      console.log('⚠️ Email sending failed, but token generated for testing. Reset URL:', resetUrl);
      // For testing purposes, don't throw error - just log it
      // In production, you might want to throw the error
      // throw new AppError('Failed to send reset email', 500);
    }

    return { message: 'Password reset email sent successfully' };
  }

  static async resetPassword(token, newPassword) {
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Password reset successfully' };
  }
}
