"use client";

import * as React from "react";
import {
  MessageSquare,
  Send,
  Building,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendAdminReply } from "@/lib/actions";

export interface MessageItem {
  id: string;
  senderId: string;
  senderEmail: string;
  content: string;
  createdAt: string;
}

export interface ThreadItem {
  id: string;
  employerId: string;
  employerEmail: string;
  businessName: string;
  lastMessageSnippet: string;
  lastMessageAt: string;
  messages: MessageItem[];
}

interface MessagesInboxViewProps {
  initialThreads: ThreadItem[];
  adminUserId: string;
}

export default function MessagesInboxView({
  initialThreads,
  adminUserId,
}: MessagesInboxViewProps) {
  const [threads, setThreads] = React.useState<ThreadItem[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(
    initialThreads[0]?.id || null
  );
  const [replyText, setReplyText] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const activeThread = React.useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !replyText.trim()) return;

    setIsSending(true);
    setErrorMsg(null);

    try {
      await sendAdminReply({
        threadId: activeThreadId,
        content: replyText.trim(),
      });

      // Update locally
      const newMsg: MessageItem = {
        id: `msg-${Date.now()}`,
        senderId: adminUserId,
        senderEmail: "Admin",
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                lastMessageSnippet: replyText.trim(),
                lastMessageAt: new Date().toISOString(),
                messages: [...t.messages, newMsg],
              }
            : t
        )
      );

      setReplyText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-heading">
          Employer Messages
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Direct communication channel with employers inquiring about candidate staffing and dispute resolution.
        </p>
      </div>

      {/* Main Inbox Box */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-[580px]">
        {/* Left Thread List */}
        <div className="border-r border-black/10 flex flex-col bg-neutral-50/50">
          <div className="p-4 border-b border-black/10">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Conversations ({threads.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-black/5">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No employer conversations started yet.
              </div>
            ) : (
              threads.map((t) => {
                const isSelected = t.id === activeThreadId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-white border-l-4 border-[#008751] shadow-xs"
                        : "hover:bg-neutral-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {t.businessName || t.employerEmail.split("@")[0]}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {t.lastMessageAt
                          ? new Date(t.lastMessageAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-mono truncate">
                      {t.employerEmail}
                    </p>
                    <p className="text-xs text-neutral-600 truncate mt-1">
                      {t.lastMessageSnippet || "No messages yet"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Conversation Pane */}
        <div className="flex flex-col h-full bg-white">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-black/10 bg-neutral-50/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 font-heading">
                    {activeThread.businessName}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    {activeThread.employerEmail}
                  </p>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {activeThread.messages.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400 italic py-12">
                    No messages in this thread yet. Send a message below to start the conversation.
                  </p>
                ) : (
                  activeThread.messages.map((m) => {
                    const isAdmin = m.senderId === adminUserId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isAdmin ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            isAdmin
                              ? "bg-[#008751] text-white rounded-br-xs"
                              : "bg-neutral-100 text-neutral-800 rounded-bl-xs"
                          }`}
                        >
                          <p>{m.content}</p>
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1 px-1 font-mono">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="px-5 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Composer */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-black/10 bg-neutral-50/40 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official admin response..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#008751] hover:bg-[#007043] text-white font-bold gap-1 px-4"
                  disabled={isSending || !replyText.trim()}
                >
                  <Send size={14} />
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400">
              <MessageSquare size={36} className="text-neutral-300 mb-2" />
              <p className="text-sm">Select an employer conversation from the left to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
