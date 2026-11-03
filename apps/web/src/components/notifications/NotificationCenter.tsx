"use client";

import { formatDateDDMMYYYY } from "@repo/shared";

import React, { useState, useEffect, useRef, useTransition } from "react";
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
  Settings,
  ChevronRight,
  Smartphone,
  Send,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  triggerTestNotificationAction,
} from "@/actions/notifications";
import { subscribeToPush, unsubscribeFromPush, sendTestPushNotification } from "@/actions/push";

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

interface NotificationCenterProps {
  role?: "EMPLOYER" | "WORKER" | "ADMIN";
}

function formatRelativeTime(dateStr: Date | string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return formatDateDDMMYYYY(date);
}

function getNotificationMeta(type: string) {
  switch (type) {
    case "TEST_NOTIFICATION":
      return {
        icon: Sparkles,
        bg: "bg-emerald-50 text-[#008751] border-emerald-200",
        label: "System Test",
      };
    case "ERRAND_POSTED":
      return {
        icon: Sparkles,
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        label: "Errand Posted",
      };
    case "DISPUTE_FILED":
      return {
        icon: AlertTriangle,
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        label: "Dispute Opened",
      };
    case "INTERVIEW_INVITATION":
      return {
        icon: Clock,
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Interview Invite",
      };
    case "HANDSHAKE_ACCEPTED":
      return {
        icon: ShieldCheck,
        bg: "bg-emerald-50 text-[#008751] border-emerald-200",
        label: "Offer Accepted",
      };
    case "HANDSHAKE_DECLINED":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Offer Declined",
      };
    case "JOB_OFFER":
      return {
        icon: Briefcase,
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Job Placement",
      };
    case "SELECTION_CONFIRMED":
      return {
        icon: ShieldCheck,
        bg: "bg-emerald-50 text-[#008751] border-emerald-200",
        label: "Handshake Confirmed",
      };
    case "ERRAND_CLAIMED":
      return {
        icon: Sparkles,
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        label: "Errand Claimed",
      };
    case "PROOF_SUBMITTED":
      return {
        icon: Clock,
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Proof Submitted",
      };
    case "ERRAND_COMPLETED":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50 text-[#008751] border-emerald-200",
        label: "Payout Released",
      };
    case "ERRAND_REVISION_REQUESTED":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        label: "Revision Requested",
      };
    case "NEW_ERRAND_MESSAGE":
      return {
        icon: MessageSquare,
        bg: "bg-sky-50 text-sky-700 border-sky-200",
        label: "Task Message",
      };
    default:
      return {
        icon: Bell,
        bg: "bg-neutral-100 text-neutral-700 border-neutral-200",
        label: "Notification",
      };
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationCenter({ role }: NotificationCenterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [showPushSettings, setShowPushSettings] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Push subscription state
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);

  // Real-time test alert state
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testAlertBanner, setTestAlertBanner] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPushSettings(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Load notifications and check push status
  const fetchFeed = async () => {
    try {
      const res = await getNotifications({ limit: 30 });
      if (res.success && res.items) {
        setNotifications(res.items as NotificationItem[]);
        setUnreadCount(res.totalUnread);
      }
    } catch (err) {
      console.error("[NotificationCenter] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Active polling every 8 seconds & on window focus or cross-tab sync
    const interval = setInterval(fetchFeed, 8000);
    const handleFocus = () => fetchFeed();
    const handleSync = () => fetchFeed();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "staffguru_notify_sync") fetchFeed();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("staffguru:notification", handleSync);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("staffguru:notification", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Check push subscription
  useEffect(() => {
    async function checkPush() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setPushSubscribed(!!sub);
      } catch (err) {
        console.error("[NotificationCenter] Push check error:", err);
      }
    }
    checkPush();
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    setTestPushStatus(null);
    try {
      if (pushSubscribed) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await unsubscribeFromPush(sub.endpoint);
          await sub.unsubscribe();
        }
        setPushSubscribed(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const reg = await navigator.serviceWorker.ready;
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (vapidKey) {
            const appServerKey = urlBase64ToUint8Array(vapidKey);
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: appServerKey,
            });
            await subscribeToPush(JSON.parse(JSON.stringify(sub)));
            setPushSubscribed(true);
          }
        }
      }
    } catch (err) {
      console.error("[NotificationCenter] Toggle push error:", err);
    } finally {
      setPushLoading(false);
    }
  };

  const handleTriggerTestNotification = async () => {
    setIsSendingTest(true);
    setTestAlertBanner(null);
    setTestPushStatus(null);
    try {
      // 1. Show immediate desktop/tray push if browser permission is already granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("Staff Guru Test Alert 🚀", {
              body: "Your notifications are active! Real-time feeds and push alerts are working.",
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
              tag: `test-notif-${Date.now()}`,
            });
          }).catch(() => {
            new Notification("Staff Guru Test Alert 🚀", {
              body: "Your notifications are active!",
              icon: "/icon-192x192.png",
            });
          });
        }
      }

      // 2. Insert into DB notifications table & dispatch Web Push in background
      const res = await triggerTestNotificationAction();
      if (res.success && res.notification) {
        const newItem: NotificationItem = {
          id: res.notification.id,
          userId: res.notification.userId,
          type: res.notification.type || "TEST_NOTIFICATION",
          title: res.notification.title,
          content: res.notification.content,
          link: res.notification.link,
          readAt: null,
          createdAt: new Date(),
          isRead: false,
        };

        // Optimistically update local feed and unread counter
        setNotifications((prev) => [newItem, ...prev.filter((n) => n.id !== newItem.id)]);
        setUnreadCount((c) => c + 1);
        setTestAlertBanner("Test alert dispatched! Added to feed & sent to device.");
        setTestPushStatus("Test alert sent to in-app feed & device tray!");

        // Broadcast to other open tabs
        window.dispatchEvent(new CustomEvent("staffguru:notification"));
        localStorage.setItem("staffguru_notify_sync", Date.now().toString());
      } else {
        const errMsg = res.error || "Failed to trigger test notification.";
        setTestAlertBanner(errMsg);
        setTestPushStatus(errMsg);
      }
    } catch (err: any) {
      console.error("[NotificationCenter] Test trigger error:", err);
      setTestAlertBanner("Error triggering test notification.");
      setTestPushStatus("Error sending test alert.");
    } finally {
      setIsSendingTest(false);
      setTimeout(() => {
        setTestAlertBanner(null);
      }, 5000);
    }
  };

  const handleSendTestPush = handleTriggerTestNotification;

  const handleItemClick = async (item: NotificationItem) => {
    // Optimistic read
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationAsRead(item.id).catch(console.error);
    }

    setIsOpen(false);

    // Resolve target link
    if (item.link) {
      router.push(item.link);
    } else if (role === "EMPLOYER") {
      router.push("/employer");
    } else {
      router.push("/dashboard");
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
      await markAllNotificationsAsRead();
    });
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = notifications.find((n) => n.id === id);
    if (item && !item.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotification(id).catch(console.error);
  };

  const filteredNotifications =
    activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const fullHistoryUrl = role === "EMPLOYER" ? "/employer/notifications" : "/dashboard/notifications";

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        title="Notifications"
        className="relative p-2 text-neutral-600 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#008751] rounded-full ring-2 ring-white animate-in zoom-in-50 duration-150">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 sm:hidden"
          onClick={() => {
            setIsOpen(false);
            setShowPushSettings(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="fixed inset-x-3.5 top-16 sm:inset-x-auto sm:left-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-[420px] max-h-[calc(100vh-80px)] sm:max-h-[580px] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-[#008751]">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  title="Mark all as read"
                  className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-md hover:bg-neutral-200/60 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={() => setShowPushSettings(!showPushSettings)}
                title="Push Notification Settings"
                className={`p-1.5 rounded-lg transition-colors ${
                  showPushSettings
                    ? "bg-neutral-200 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {testAlertBanner && (
            <div className="px-4 py-2 bg-emerald-600 text-white text-[11px] font-medium flex items-center justify-between shrink-0 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{testAlertBanner}</span>
              </div>
              <button onClick={() => setTestAlertBanner(null)} className="opacity-80 hover:opacity-100 p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Collapsible Web Push Settings Panel */}
          {showPushSettings && (
            <div className="p-4 bg-neutral-900 text-white border-b border-neutral-800 space-y-3 shrink-0 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-[#008751] shrink-0" />
                  <span className="text-xs font-semibold truncate">Instant Web Push Alerts</span>
                </div>
                <button
                  onClick={handleTogglePush}
                  disabled={pushLoading}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                    pushSubscribed
                      ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      : "bg-[#008751] text-white hover:bg-[#007043]"
                  }`}
                >
                  {pushLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  ) : pushSubscribed ? (
                    "Enabled (Turn Off)"
                  ) : (
                    "Turn On Alerts"
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-neutral-400">
                  {pushSubscribed ? "Test device tray & feed:" : "Test in-app notification feed:"}
                </span>
                <button
                  onClick={handleTriggerTestNotification}
                  disabled={isSendingTest}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors shrink-0"
                >
                  {isSendingTest ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#008751]" />
                  ) : (
                    <Send className="w-3 h-3 text-[#008751]" />
                  )}
                  <span>Send Test Alert</span>
                </button>
              </div>

              {testPushStatus && (
                <p className="text-[11px] text-emerald-400 pt-1">{testPushStatus}</p>
              )}
            </div>
          )}

          {/* Filter Tabs & Test Alert Bar */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 pt-2.5 pb-2 bg-neutral-50/50 shrink-0">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("all")}
                className={`pb-1.5 transition-colors border-b-2 ${
                  activeTab === "all"
                    ? "border-[#008751] text-neutral-950 font-bold"
                    : "border-transparent text-neutral-400 hover:text-neutral-700"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`pb-1.5 transition-colors border-b-2 ${
                  activeTab === "unread"
                    ? "border-[#008751] text-neutral-950 font-bold"
                    : "border-transparent text-neutral-400 hover:text-neutral-700"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Test Alert Button */}
            <button
              onClick={handleTriggerTestNotification}
              disabled={isSendingTest}
              title="Send a real-time test alert to your feed and device"
              className="flex items-center gap-1.5 text-[11px] font-bold text-[#008751] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 px-2.5 py-1 rounded-lg transition-all shadow-xs shrink-0"
            >
              {isSendingTest ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#008751]" />
              ) : (
                <Sparkles className="w-3 h-3 text-[#008751]" />
              )}
              <span>Test Alert</span>
            </button>
          </div>

          {/* Notification List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 min-h-0">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#008751]" />
                <span>Loading your notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#008751] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-neutral-800">All caught up!</p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  {activeTab === "unread"
                    ? "You have zero unread notifications."
                    : "No notifications recorded yet. Click below to verify real-time alerts."}
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleTriggerTestNotification}
                    disabled={isSendingTest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-[#008751] border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
                  >
                    {isSendingTest ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008751]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#008751]" />
                    )}
                    <span>Send Test Notification</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const meta = getNotificationMeta(item.type);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group px-4 py-3 flex items-start gap-3.5 transition-colors cursor-pointer hover:bg-neutral-50 relative ${
                      !item.isRead ? "bg-emerald-50/25" : ""
                    }`}
                  >
                    {/* Unread Indicator Bar / Dot */}
                    {!item.isRead && (
                      <span className="absolute left-1 top-4 w-1.5 h-1.5 rounded-full bg-[#008751]" />
                    )}

                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          • {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      {item.title && (
                        <p className="text-xs font-semibold text-neutral-900 truncate mb-0.5">
                          {item.title}
                        </p>
                      )}

                      <p className="text-xs text-neutral-700 leading-snug line-clamp-2">
                        {item.content}
                      </p>
                    </div>

                    {/* Quick Delete on hover */}
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Dismiss notification"
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs shrink-0">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(fullHistoryUrl);
              }}
              className="text-neutral-600 hover:text-neutral-950 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View full history</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleTriggerTestNotification}
              disabled={isSendingTest}
              className="text-xs font-semibold text-[#008751] hover:text-[#007043] flex items-center gap-1 transition-colors"
            >
              {isSendingTest ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#008751]" />
              ) : (
                <Sparkles className="w-3 h-3 text-[#008751]" />
              )}
              <span>Send Test Alert</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
