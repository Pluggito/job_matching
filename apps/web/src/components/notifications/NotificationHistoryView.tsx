"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/actions/notifications";

interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string | null;
  content: string;
  link: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
  isRead: boolean;
}

interface NotificationHistoryViewProps {
  role: "EMPLOYER" | "WORKER" | "ADMIN";
}

function formatFullDate(dateStr: Date | string) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationMeta(type: string) {
  switch (type) {
    case "JOB_OFFER":
      return {
        icon: Briefcase,
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Job Placement",
        category: "placement",
      };
    case "SELECTION_CONFIRMED":
      return {
        icon: ShieldCheck,
        badgeBg: "bg-emerald-50 text-[#008751] border-emerald-200",
        label: "Handshake Confirmed",
        category: "placement",
      };
    case "ERRAND_CLAIMED":
      return {
        icon: Sparkles,
        badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        label: "Errand Claimed",
        category: "errands",
      };
    case "PROOF_SUBMITTED":
      return {
        icon: Clock,
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Proof Submitted",
        category: "errands",
      };
    case "ERRAND_COMPLETED":
      return {
        icon: CheckCircle2,
        badgeBg: "bg-emerald-50 text-[#008751] border-emerald-200",
        label: "Payout Released",
        category: "payments",
      };
    case "ERRAND_REVISION_REQUESTED":
      return {
        icon: AlertTriangle,
        badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Revision Requested",
        category: "errands",
      };
    case "NEW_ERRAND_MESSAGE":
      return {
        icon: MessageSquare,
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        label: "Task Message",
        category: "errands",
      };
    default:
      return {
        icon: Bell,
        badgeBg: "bg-neutral-100 text-neutral-700 border-neutral-200",
        label: "Platform Alert",
        category: "other",
      };
  }
}

export function NotificationHistoryView({ role }: NotificationHistoryViewProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const returnUrl = role === "EMPLOYER" ? "/employer" : "/dashboard";

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications({ limit: 100 });
      if (res.success && res.items) {
        setNotifications(res.items as NotificationItem[]);
      }
    } catch (err) {
      console.error("[NotificationHistory] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleMarkAllRead = () => {
    startTransition(async () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      await markAllNotificationsAsRead();
    });
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      markNotificationAsRead(item.id).catch(console.error);
    }

    if (item.link) {
      router.push(item.link);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotification(id).catch(console.error);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredItems = notifications.filter((item) => {
    // Unread filter
    if (filterStatus === "unread" && item.isRead) return false;

    // Category filter
    const meta = getNotificationMeta(item.type);
    if (filterCategory !== "all" && meta.category !== filterCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      const matchType = item.type.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchType) return false;
    }

    return true;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="space-y-1">
          <button
            onClick={() => router.push(returnUrl)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-[#008751]">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500">
            Real-time feed of placement handshakes, escrow payments, and errand task updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-neutral-200/90 text-neutral-800 hover:bg-neutral-50 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[#008751]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications by keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-neutral-200/80 focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Read / Unread toggle */}
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === "all"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterStatus("unread")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === "unread"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-neutral-200/80 bg-white text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#008751]/20"
          >
            <option value="all">All Categories</option>
            <option value="placement">Placements</option>
            <option value="errands">Errands</option>
            <option value="payments">Payments</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-16 text-center text-neutral-400 text-sm flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-neutral-200/80">
            <Loader2 className="w-6 h-6 animate-spin text-[#008751]" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">No Notifications</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? `No notifications found matching "${searchQuery}".`
                : filterStatus === "unread"
                ? "You have zero unread notifications."
                : "No notifications have been recorded yet."}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const meta = getNotificationMeta(item.type);
            const IconComp = meta.icon;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative ${
                  !item.isRead
                    ? "bg-white border-[#008751]/30 shadow-sm ring-1 ring-[#008751]/10"
                    : "bg-white/80 border-neutral-200/80 hover:border-neutral-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.badgeBg}`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        {meta.label}
                      </span>
                      <span className="text-xs text-neutral-400">
                        • {formatFullDate(item.createdAt)}
                      </span>
                      {!item.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-[#008751]" />
                      )}
                    </div>

                    {item.title && (
                      <h4 className="text-sm font-semibold text-neutral-950 mb-1">
                        {item.title}
                      </h4>
                    )}

                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                      {item.content}
                    </p>

                    {item.link && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#008751] hover:text-[#007043]">
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Action buttons on right */}
                  <div className="absolute right-4 top-4 flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete notification"
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
