"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

const socketUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function connectRealtime(token: string) {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,

      auth: {
        token,
      },

      reconnection: true,

      reconnectionAttempts: 5,
    });
  }

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectRealtime() {
  if (!socket) {
    return;
  }

  socket.disconnect();

  socket = null;
}
