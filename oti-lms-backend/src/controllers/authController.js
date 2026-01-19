import { AuthService } from '../services/authService.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const result = await AuthService.refreshAccessToken(refreshToken);
  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: result,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.userId);
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.userId, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.userId, oldPassword, newPassword);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await AuthService.resetPassword(token, newPassword);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});
