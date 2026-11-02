"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { sendErrandMessage, markErrandMessagesAsRead } from "@/actions/errandMessages";

export interface ErrandChatMessage {
  id: string;
  senderId: string;
  content: string;
  attachmentUrl?: string | null;
  status?: string; // 'sending' | 'sent' | 'delivered' | 'read'
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  tempId?: string;
}

interface UseErrandChatOptions {
  errandId: string;
  initialMessages: ErrandChatMessage[];
  currentUserId: string;
  userToken?: string;
}

export function useErrandChat({
  errandId,
  initialMessages,
  currentUserId,
  userToken,
}: UseErrandChatOptions) {
  const [messages, setMessages] = useState<ErrandChatMessage[]>(initialMessages);
  const [isCounterpartTyping, setIsCounterpartTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Only connect in browser environment
    if (typeof window === "undefined") return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (window.location.hostname === "localhost" ? "http://localhost:4000" : "");

    // If no socket URL configured, fallback gracefully to server action
    if (!socketUrl) {
      console.log("[useErrandChat] No NEXT_PUBLIC_SOCKET_URL defined, running in server-action mode.");
      return;
    }

    const socket = io(socketUrl, {
      auth: { token: userToken || `user_${currentUserId}` },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("chat:join", { errandId });
      // Mark existing messages read
      socket.emit("chat:mark_read", { errandId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.warn("[useErrandChat] Socket connection warning:", err.message);
      setIsConnected(false);
    });

    // Handle incoming message
    socket.on("chat:new", (newMsg: ErrandChatMessage) => {
      setMessages((prev) => {
        // If message was sent optimistically by this user, replace tempId
        if (newMsg.tempId && newMsg.senderId === currentUserId) {
          return prev.map((m) => (m.id === newMsg.tempId ? newMsg : m));
        }
        // Avoid duplicate appends
        if (prev.some((m) => m.id === newMsg.id)) {
          return prev;
        }
        return [...prev, newMsg];
      });

      // If message is from counterparty, emit read receipt
      if (newMsg.senderId !== currentUserId) {
        socket.emit("chat:mark_read", { errandId, messageIds: [newMsg.id] });
      }
    });

    // Handle typing indicator
    socket.on("chat:typing_update", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== currentUserId) {
        setIsCounterpartTyping(isTyping);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (isTyping) {
          typingTimerRef.current = setTimeout(() => {
            setIsCounterpartTyping(false);
          }, 4000);
        }
      }
    });

    // Handle read receipts
    socket.on("chat:read_receipt", ({ readByUserId, readAt }: { readByUserId: string; readAt: string }) => {
      if (readByUserId !== currentUserId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId
              ? { ...m, status: "read", readAt: readAt }
              : m
          )
        );
      }
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.emit("chat:leave", { errandId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [errandId, currentUserId, userToken]);

  // Mark read via server action on mount as backup
  useEffect(() => {
    markErrandMessagesAsRead(errandId).catch(() => {});
  }, [errandId]);

  // Send message with seamless socket + server action fallback
  const sendMessage = useCallback(
    async (content: string, attachmentUrl?: string) => {
      const trimmed = content.trim();
      if (!trimmed && !attachmentUrl) return { success: false, error: "Empty message" };

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const optimisticMsg: ErrandChatMessage = {
        id: tempId,
        tempId,
        senderId: currentUserId,
        content: trimmed,
        attachmentUrl: attachmentUrl || null,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setMessages((prev) => [...prev, optimisticMsg]);

      // If socket is connected, emit through socket
      if (socketRef.current?.connected) {
        return new Promise<{ success: boolean; error?: string }>((resolve) => {
          socketRef.current?.emit(
            "chat:send",
            { errandId, content: trimmed, tempId, attachmentUrl },
            (res: any) => {
              if (res?.success && res.message) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === tempId ? { ...res.message, status: "sent" } : m))
                );
                resolve({ success: true });
              } else {
                // If socket returned error, fallback to server action
                sendErrandMessage({ errandId, content: trimmed })
                  .then((saRes) => {
                    if (saRes.success) {
                      setMessages((prev) =>
                        prev.map((m) => (m.id === tempId ? { ...m, status: "sent" } : m))
                      );
                      resolve({ success: true });
                    } else {
                      resolve({ success: false, error: saRes.error || "Failed to send" });
                    }
                  })
                  .catch((err) => resolve({ success: false, error: err.message }));
              }
            }
          );
        });
      } else {
        // Fallback directly to Server Action
        try {
          const res = await sendErrandMessage({ errandId, content: trimmed });
          if (res.success) {
            setMessages((prev) =>
              prev.map((m) => (m.id === tempId ? { ...m, status: "sent" } : m))
            );
            return { success: true };
          } else {
            return { success: false, error: res.error || "Failed to send" };
          }
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      }
    },
    [errandId, currentUserId]
  );

  // Send typing event
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("chat:typing", { errandId, isTyping });
      }
    },
    [errandId]
  );

  return {
    messages,
    sendMessage,
    sendTyping,
    isCounterpartTyping,
    isConnected,
  };
}
