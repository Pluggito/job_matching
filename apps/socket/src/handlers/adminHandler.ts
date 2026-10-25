import { Server } from "socket.io";
import { AuthenticatedSocket } from "../auth";

export function registerAdminHandlers(io: Server, socket: AuthenticatedSocket) {
  if (socket.data.user.role !== "ADMIN") return;

  socket.on("admin:join", () => {
    socket.join("admin:stream");
    console.log(`[Socket] Admin ${socket.data.user.userId} joined admin:stream`);
    socket.emit("admin:joined");
  });

  socket.on("admin:leave", () => {
    socket.leave("admin:stream");
  });
}
