import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token: string) {
  if (socket && socket.connected) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  socket = io(url, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
