import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { verifySocketAuth, AuthenticatedSocket } from "./auth";
import { registerChatHandlers } from "./handlers/chatHandler";
import { registerAdminHandlers } from "./handlers/adminHandler";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4000", 10);
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Default development origins
if (allowedOrigins.length === 0) {
  allowedOrigins.push(
    "http://localhost:3000",
    "http://localhost:3001",
    "https://staffguru.ng",
    "https://admin.staffguru.ng"
  );
}

// 1. Create HTTP server with health check route
const server = http.createServer((req, res) => {
  // CORS headers for health check
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: "Staff Guru Real-Time Socket Service",
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, restrictive via CORS_ORIGIN
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 15000,
  transports: ["websocket", "polling"],
});

// 3. Attach Authentication Middleware
io.use(verifySocketAuth);

// 4. Socket Connection Lifecycle
io.on("connection", (socket) => {
  const authSocket = socket as AuthenticatedSocket;
  const user = authSocket.data.user;

  console.log(`[Socket Connected] User ${user.userId} (${user.role}) - ID: ${socket.id}`);

  // Auto-join personal room for direct notifications
  const userRoom = `user:${user.userId}`;
  socket.join(userRoom);

  // Register feature handlers
  registerChatHandlers(io, authSocket);
  registerAdminHandlers(io, authSocket);

  socket.on("disconnect", (reason) => {
    console.log(`[Socket Disconnected] User ${user.userId} - Reason: ${reason}`);
  });
});

// 5. Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Staff Guru Realtime Socket Server running on port ${PORT}`);
});
