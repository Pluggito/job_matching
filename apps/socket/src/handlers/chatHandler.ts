import { Server } from "socket.io";
import { AuthenticatedSocket } from "../auth";
import {
  db,
  errands,
  errandThreads,
  errandMessages,
  workerProfiles,
  eq,
  and,
  sql,
} from "@repo/db";
import { redactContactInformation } from "@repo/shared";
import { z } from "zod";

const SendMessageSchema = z.object({
  errandId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  tempId: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
});

const MarkReadSchema = z.object({
  errandId: z.string().uuid(),
  messageIds: z.array(z.string().uuid()).optional(),
});

export function registerChatHandlers(io: Server, socket: AuthenticatedSocket) {
  const currentUserId = socket.data.user.userId;

  // 1. Join Errand Room
  socket.on("chat:join", async ({ errandId }: { errandId: string }) => {
    try {
      if (!errandId) return;

      // Verify that user is participant in this errand thread
      const [thread] = await db
        .select({
          id: errandThreads.id,
          employerId: errandThreads.employerId,
          workerProfileId: errandThreads.workerProfileId,
        })
        .from(errandThreads)
        .where(eq(errandThreads.errandId, errandId))
        .limit(1);

      if (!thread && socket.data.user.role !== "ADMIN") {
        socket.emit("error", { message: "Chat thread does not exist for this errand." });
        return;
      }

      if (thread && socket.data.user.role !== "ADMIN") {
        let isAuthorized = thread.employerId === currentUserId;

        if (!isAuthorized) {
          const [worker] = await db
            .select({ userId: workerProfiles.userId })
            .from(workerProfiles)
            .where(eq(workerProfiles.id, thread.workerProfileId))
            .limit(1);

          isAuthorized = worker?.userId === currentUserId;
        }

        if (!isAuthorized) {
          socket.emit("error", { message: "Unauthorized: You are not a participant in this errand." });
          return;
        }
      }

      const roomName = `errand:${errandId}`;
      socket.join(roomName);
      console.log(`[Socket] User ${currentUserId} joined ${roomName}`);
      socket.emit("chat:joined", { errandId });
    } catch (err: any) {
      console.error("[chat:join error]:", err);
      socket.emit("error", { message: "Failed to join room." });
    }
  });

  // 2. Leave Errand Room
  socket.on("chat:leave", ({ errandId }: { errandId: string }) => {
    const roomName = `errand:${errandId}`;
    socket.leave(roomName);
    console.log(`[Socket] User ${currentUserId} left ${roomName}`);
  });

  // 3. Send Message
  socket.on("chat:send", async (rawPayload: unknown, callback?: (res: any) => void) => {
    try {
      const parsed = SendMessageSchema.safeParse(rawPayload);
      if (!parsed.success) {
        if (callback) callback({ success: false, error: "Invalid message payload" });
        return;
      }

      const { errandId, content, tempId, attachmentUrl } = parsed.data;

      // Find or create thread
      let [thread] = await db
        .select()
        .from(errandThreads)
        .where(eq(errandThreads.errandId, errandId))
        .limit(1);

      if (!thread) {
        if (callback) callback({ success: false, error: "Thread not found." });
        return;
      }

      // Run anti-circumvention contact protection
      const { cleanContent } = redactContactInformation(content.trim());

      const [newMsg] = await db
        .insert(errandMessages)
        .values({
          threadId: thread.id,
          senderId: currentUserId,
          content: cleanContent,
          attachmentUrl: attachmentUrl || null,
          status: "sent",
        })
        .returning();

      if (!newMsg) {
        if (callback) callback({ success: false, error: "Failed to persist message." });
        return;
      }

      const messagePayload = {
        id: newMsg.id,
        tempId,
        threadId: thread.id,
        errandId,
        senderId: currentUserId,
        content: newMsg.content,
        attachmentUrl: newMsg.attachmentUrl,
        status: newMsg.status,
        deliveredAt: newMsg.deliveredAt ? newMsg.deliveredAt.toISOString() : null,
        readAt: newMsg.readAt ? newMsg.readAt.toISOString() : null,
        createdAt: newMsg.createdAt.toISOString(),
      };

      // Broadcast to room
      io.to(`errand:${errandId}`).emit("chat:new", messagePayload);

      if (callback) callback({ success: true, message: messagePayload });
    } catch (err: any) {
      console.error("[chat:send error]:", err);
      if (callback) callback({ success: false, error: err?.message || "Failed to send message" });
    }
  });

  // 4. Typing State
  socket.on("chat:typing", ({ errandId, isTyping }: { errandId: string; isTyping: boolean }) => {
    socket.to(`errand:${errandId}`).emit("chat:typing_update", {
      errandId,
      userId: currentUserId,
      isTyping,
    });
  });

  // 5. Mark Messages Read
  socket.on("chat:mark_read", async (rawPayload: unknown) => {
    try {
      const parsed = MarkReadSchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const { errandId } = parsed.data;

      const [thread] = await db
        .select()
        .from(errandThreads)
        .where(eq(errandThreads.errandId, errandId))
        .limit(1);

      if (!thread) return;

      const now = new Date();

      await db
        .update(errandMessages)
        .set({
          status: "read",
          readAt: now,
        })
        .where(
          and(
            eq(errandMessages.threadId, thread.id),
            sql`${errandMessages.senderId} != ${currentUserId}`,
            sql`${errandMessages.readAt} IS NULL`
          )
        );

      io.to(`errand:${errandId}`).emit("chat:read_receipt", {
        errandId,
        readByUserId: currentUserId,
        readAt: now.toISOString(),
      });
    } catch (err: any) {
      console.error("[chat:mark_read error]:", err);
    }
  });
}
