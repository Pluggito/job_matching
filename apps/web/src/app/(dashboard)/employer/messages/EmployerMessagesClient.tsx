"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Building,
  Clock,
  Loader2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  FileQuestion,
  Receipt,
  UserX,
  CheckCircle2,
} from "lucide-react";
import {
  SupportMessageItem,
  sendEmployerSupportMessage,
  getEmployerSupportConversation,
} from "@/actions/employerMessages";

interface Props {
  initialMessages: SupportMessageItem[];
  currentUserId: string;
}

const QUICK_TOPICS = [
  {
    label: "Errand Dispute",
    icon: AlertCircle,
    starter: "I want to lodge a complaint regarding an errand: ",
  },
  {
    label: "Billing & Refund",
    icon: Receipt,
    starter: "I have an inquiry regarding a payment / refund deduction: ",
  },
  {
    label: "Candidate Issue",
    icon: UserX,
    starter: "I would like to report an issue with a placed candidate: ",
  },
  {
    label: "General Support",
    icon: FileQuestion,
    starter: "Hello Staff Guru team, I need assistance with: ",
  },
];

export default function EmployerMessagesClient({
  initialMessages,
  currentUserId,
}: Props) {
  const [messages, setMessages] = useState<SupportMessageItem[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Periodic polling to fetch new admin responses every 6 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getEmployerSupportConversation();
        if (res.success && res.data) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        // Silently skip background polling errors
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getEmployerSupportConversation();
      if (res.success && res.data) {
        setMessages(res.data.messages);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to refresh conversation.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText("");
    setIsSending(true);
    setErrorMsg(null);

    // Optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: SupportMessageItem = {
      id: tempId,
      senderId: currentUserId,
      senderRole: "EMPLOYER",
      senderName: "You",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendEmployerSupportMessage(content);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.message! : m))
        );
      } else {
        setErrorMsg(res.error || "Failed to send message.");
        // Rollback optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectTopic = (starter: string) => {
    setInputText((prev) => (prev ? `${prev} ${starter}` : starter));
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Staff Guru Support Desk
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">
              Confidential Admin Channel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-heading">
            Complaints & Inquiries
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Lodge complaints, request candidate mediation, or resolve billing and task issues directly with the management team.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? "animate-spin text-emerald-600" : "text-neutral-500"}
          />
          {isRefreshing ? "Checking..." : "Refresh Messages"}
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col min-h-[580px]">
        {/* Support Banner */}
        <div className="bg-neutral-50/70 border-b border-neutral-200/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              <ShieldCheck size={20} className="text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-neutral-900">
                  Staff Guru Executive Operations
                </h3>
                <span className="text-[10px] bg-emerald-500 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Verified
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Typical reply window: within a few business hours. All resolutions are recorded in your audit ledger.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-neutral-400 bg-white px-3 py-1 rounded-lg border border-neutral-200/60 shadow-2xs">
            Direct Complaint Thread
          </div>
        </div>

        {/* Quick Complaint Shortcuts */}
        <div className="px-4 py-2.5 bg-neutral-50/40 border-b border-neutral-200/50 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" /> Quick Topics:
          </span>
          {QUICK_TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.label}
                type="button"
                onClick={() => handleSelectTopic(topic.starter)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-neutral-600 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-neutral-200/80 rounded-lg transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                <Icon size={12} className="text-neutral-400" />
                {topic.label}
              </button>
            );
          })}
        </div>

        {/* Message Thread History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
          {messages.length === 0 ? (
            <div className="h-full py-16 flex flex-col items-center justify-center text-center text-neutral-400 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-neutral-400 mb-3 shadow-xs">
                <MessageSquare size={26} className="opacity-60" />
              </div>
              <h4 className="text-sm font-bold text-neutral-800">
                No Complaints or Inquiries Yet
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                Have a concern about an errand, candidate placement, or billing? Send a message below and our admin team will attend to you promptly.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isEmployer = m.senderRole === "EMPLOYER";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isEmployer ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isEmployer && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                        Admin Desk
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-neutral-600">
                      {m.senderName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isEmployer
                        ? "bg-[#008751] text-white rounded-br-xs shadow-xs"
                        : "bg-neutral-100 text-neutral-900 rounded-bl-xs border border-neutral-200/70 shadow-2xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="px-5 py-2.5 bg-rose-50 border-t border-rose-200 text-xs text-rose-700 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-[10px] font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-neutral-200/70 bg-neutral-50/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your complaint or question for the admin team..."
              className="w-full px-4 py-2.5 text-xs bg-white rounded-xl border border-neutral-300 focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751] transition-colors"
              disabled={isSending}
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
          >
            {isSending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Send to Admin</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
