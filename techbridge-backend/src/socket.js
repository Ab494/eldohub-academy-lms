import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';

let io = null;

/**
 * Initialize Socket.IO on an existing HTTP server
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:5173',
        config.frontendUrl,
      ].filter(Boolean),
      credentials: true,
    },
  });

  // Auth middleware – verify JWT on connect
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.userId || decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join a personal room keyed by userId
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('disconnect', () => {
      // cleanup if needed
    });
  });

  return io;
}

/**
 * Get the active Socket.IO instance
 */
export function getIO() {
  return io;
}

/**
 * Emit a notification to a specific user
 */
export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit a notification to multiple users
 */
export function emitToUsers(userIds, event, data) {
  if (!io) return;
  for (const userId of userIds) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
