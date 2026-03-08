import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/store/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

type EventHandler = (data: any) => void;

/**
 * Hook that manages a single Socket.IO connection per authenticated session.
 * Accepts a map of event names → handlers.
 */
export function useSocket(handlers: Record<string, EventHandler> = {}) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const getToken = useCallback(() => localStorage.getItem('accessToken'), []);

  useEffect(() => {
    const token = getToken();
    if (!isAuthenticated || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // Register all event handlers
    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return socketRef;
}
