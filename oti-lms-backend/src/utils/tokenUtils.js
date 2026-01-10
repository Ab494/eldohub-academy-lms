import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateTokens = (userId, role) => {
  const payload = { userId, role };
  
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken
      ? config.jwt.refreshSecret
      : config.jwt.accessSecret;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
