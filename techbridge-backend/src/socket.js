import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';

let io = null;
const onlineUsers = new Set();

function broadcastOnlineCount() {
  if (io) {
    io.to('role:admin').emit('online:count', { count: onlineUsers.size });
  }
}

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
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = decoded.userId || decoded.id;
      socket.userRole = decoded.role || null;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Join personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      onlineUsers.add(socket.userId);
    }

    // Join role room for admins
    if (socket.userRole === 'admin') {
      socket.join('role:admin');
      // Send current count immediately to the newly connected admin
      socket.emit('online:count', { count: onlineUsers.size });
    }

    broadcastOnlineCount();

    socket.on('disconnect', () => {
      if (socket.userId) {
        // Only remove if no other sockets for this user
        const sockets = io.sockets.sockets;
        let stillConnected = false;
        for (const [, s] of sockets) {
          if (s.userId === socket.userId && s.id !== socket.id) {
            stillConnected = true;
            break;
          }
        }
        if (!stillConnected) {
          onlineUsers.delete(socket.userId);
        }
      }
      broadcastOnlineCount();
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
