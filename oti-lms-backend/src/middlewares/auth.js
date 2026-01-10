import { verifyToken } from '../utils/tokenUtils.js';
import { AppError } from '../utils/errorHandler.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401));
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token, false);

    if (!decoded) {
      return next(new AppError('Invalid or expired token', 401));
    }

    // Fetch fresh user data
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(
        new AppError('You do not have permission to access this resource', 403)
      );
    }

    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token, false);

    if (decoded) {
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = decoded.userId;
        req.userRole = decoded.role;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
