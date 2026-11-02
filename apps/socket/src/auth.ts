import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

export interface AuthenticatedUser {
  userId: string;
  role: "WORKER" | "EMPLOYER" | "ADMIN";
  email?: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthenticatedUser;
  };
}

export function verifySocketAuth(socket: Socket, next: (err?: Error) => void) {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "")) ||
    (socket.handshake.query?.token as string);

  if (!token) {
    return next(new Error("Authentication failed: Missing token"));
  }

  const jwtSecret = process.env.JWT_SECRET || "fallback_super_secret_staffguru_jwt_dev_key_2026";

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Support various token schemas (our custom auth session or NextAuth token)
    const userId = decoded.userId || decoded.sub || decoded.id;
    const role = decoded.role || "EMPLOYER";
    const email = decoded.email;

    if (!userId) {
      return next(new Error("Authentication failed: Invalid payload"));
    }

    socket.data.user = {
      userId,
      role,
      email,
    };

    next();
  } catch (err: any) {
    return next(new Error(`Authentication failed: ${err.message}`));
  }
}
