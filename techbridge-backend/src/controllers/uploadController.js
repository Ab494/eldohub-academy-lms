import { User } from '../models/User.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { config } from '../config/index.js';

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { avatar: avatarUrl },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: user,
  });
});
