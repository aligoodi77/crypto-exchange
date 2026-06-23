import type { Server as HttpServer } from "node:http";

import { Server, type Socket } from "socket.io";

import { isOriginAllowed } from "../config/cors.js";
import { prisma } from "../lib/prisma.js";
import { isTokenRevoked } from "../services/token.service.js";
import { verifyToken } from "../utils/jwt.js";

import {
  ADMIN_ROOM,
  getTokenRoom,
  getUserRoom,
  MARKET_ROOM,
} from "./socket.rooms.js";

type SocketAuthData = {
  userId: string;
  role: "USER" | "ADMIN";
  tokenId: string;
};

type AppSocketData = {
  auth?: SocketAuthData;
};

let io: Server | null = null;

function getTokenFromSocket(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authorizationHeader = socket.handshake.headers.authorization;

  if (
    typeof authorizationHeader === "string" &&
    authorizationHeader.startsWith("Bearer ")
  ) {
    const token = authorizationHeader.replace("Bearer ", "").trim();

    return token || null;
  }

  return null;
}

export function initializeSocketServer(httpServer: HttpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin is not allowed by CORS"));
      },

      methods: ["GET", "POST"],

      allowedHeaders: ["Content-Type", "Authorization"],

      credentials: false,
    },

    maxHttpBufferSize: 1e6,
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        next(new Error("Unauthorized: token is missing"));
        return;
      }

      const payload = verifyToken(token);

      const isRevoked = await isTokenRevoked(payload.jti);

      if (isRevoked) {
        next(new Error("Unauthorized: token has been revoked"));
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
        select: {
          id: true,
          role: true,
          tokenVersion: true,
        },
      });

      if (!user) {
        next(new Error("Unauthorized: user not found"));
        return;
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        next(new Error("Unauthorized: session expired"));
        return;
      }

      const socketData = socket.data as AppSocketData;

      socketData.auth = {
        userId: user.id,
        role: user.role,
        tokenId: payload.jti,
      };

      next();
    } catch {
      next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const socketData = socket.data as AppSocketData;
    const auth = socketData.auth;

    if (!auth) {
      socket.disconnect(true);
      return;
    }

    socket.join(MARKET_ROOM);

    socket.join(getUserRoom(auth.userId));

    socket.join(getTokenRoom(auth.tokenId));

    if (auth.role === "ADMIN") {
      socket.join(ADMIN_ROOM);
    }

    console.log(`[socket] connected user=${auth.userId} socket=${socket.id}`);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected user=${auth.userId} reason=${reason}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }

  return io;
}

export function disconnectTokenSockets(tokenId: string) {
  io?.in(getTokenRoom(tokenId)).disconnectSockets(true);
}

export function disconnectUserSockets(userId: string) {
  io?.in(getUserRoom(userId)).disconnectSockets(true);
}

export function getOptionalIO(): Server | null {
  return io ?? null;
}
