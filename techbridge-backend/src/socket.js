import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/index.js';

let io = null;
const onlineUsers = new Set();
let broadcastInterval = null;

function broadcastOnlineCount() {
  if (io) {
    const count = onlineUsers.size;
    io.to('role:admin').emit('online:count', { count });
    console.log(`[Socket] Broadcasting online count: ${count}`);
  }
}

/**
 * Initialize Socket.IO on an existing HTTP server
 */
export function initSocket(httpServer) {
  // Get frontend URL from config - this should be set in Render env vars
  const frontendUrl = config.frontendUrl;
  
  // Build CORS origins array - include all common development and production URLs
  const corsOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
    // Include the configured frontend URL (should be set via FRONTEND_URL env var)
    frontendUrl,
  ].filter(Boolean);
  
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
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
    console.log(`[Socket] User connected: ${socket.userId} (role: ${socket.userRole})`);
    
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
      console.log(`[Socket] Admin connected, sent count: ${onlineUsers.size}`);
    }

    broadcastOnlineCount();

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.userId}`);
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

  // Start periodic broadcast every 30 seconds
  broadcastInterval = setInterval(() => {
    broadcastOnlineCount();
  }, 30000);

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
