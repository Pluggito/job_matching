"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  RefreshCw,
  Radio,
  CheckCircle2,
  CreditCard,
  Briefcase,
  Users,
  Package,
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import type { LiveActivityItem } from "@/app/api/live-sync/route";

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // AudioContext blocked or not allowed by browser policy until interaction
  }
}

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getActivityIcon(type: LiveActivityItem["type"]) {
  switch (type) {
    case "PAYMENT":
      return <CreditCard className="w-4 h-4 text-emerald-600" />;
    case "REQUEST":
      return <Briefcase className="w-4 h-4 text-blue-600" />;
    case "PLACEMENT":
      return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
    case "ERRAND":
      return <Package className="w-4 h-4 text-amber-600" />;
    case "WORKER":
      return <Users className="w-4 h-4 text-purple-600" />;
    case "REPLACEMENT":
      return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    default:
      return <Radio className="w-4 h-4 text-gray-600" />;
  }
}

export function AdminLiveWatcher() {
  const router = useRouter();
  const [isLive, setIsLive] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState<LiveActivityItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const lastSeenTimestampRef = useRef<string>(new Date().toISOString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load sound preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("staffguru_admin_sound");
      if (stored !== null) setSoundEnabled(stored === "true");
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("staffguru_admin_sound", String(next));
      } catch {}
      return next;
    });
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Main synchronization routine
  const checkLiveActivity = useCallback(async (isManual = false) => {
    if (!isManual && !isLive) return;
    if (typeof document !== "undefined" && document.hidden && !isManual) return;

    setIsSyncing(true);
    try {
      const url = `/api/live-sync?since=${encodeURIComponent(lastSeenTimestampRef.current)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      if (!data.success) return;

      setActivities(data.activities || []);
      setLastSyncedAt(new Date());

      if (data.hasNewActivity) {
        lastSeenTimestampRef.current = data.latestTimestamp;
        setUnreadCount((prev) => prev + (data.newItemsCount || 1));

        // Trigger seamless server component re-render
        router.refresh();

        // Sound alert
        if (soundEnabled) {
          playNotificationChime();
        }

        // Show brief floating toast
        const newest = data.activities?.[0];
        if (newest) {
          setToast({ title: newest.title, desc: newest.description });
          setTimeout(() => setToast(null), 4500);
        }
      } else if (isManual) {
        // Explicit manual click: refresh the router
        router.refresh();
      }
    } catch (err) {
      console.warn("[Admin Live Sync] Background poll error:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isLive, soundEnabled, router]);

  // Initial load
  useEffect(() => {
    checkLiveActivity(true);
  }, [checkLiveActivity]);

  // Polling loop (every 7 seconds)
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      checkLiveActivity();
    }, 7000);

    return () => clearInterval(interval);
  }, [isLive, checkLiveActivity]);

  // Heartbeat router refresh every 30 seconds for background data consistency
  useEffect(() => {
    if (!isLive) return;
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        router.refresh();
      }
    }, 30000);

    return () => clearInterval(heartbeat);
  }, [isLive, router]);

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleManualSync = () => {
    checkLiveActivity(true);
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      {/* Live Sync Status Pill */}
      <button
        onClick={() => setIsLive(!isLive)}
        title={isLive ? "Auto-sync active (click to pause)" : "Auto-sync paused (click to resume)"}
        className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          isLive
            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100"
            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span>{isLive ? "LIVE SYNC" : "PAUSED"}</span>
      </button>

      {/* Manual Refresh / Sync Button */}
      <button
        onClick={handleManualSync}
        disabled={isSyncing}
        title="Sync page data now"
        className="p-2 text-muted-foreground hover:text-black transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <RefreshCw size={17} className={isSyncing ? "animate-spin text-emerald-600" : ""} />
      </button>

      {/* Bell Notification Trigger */}
      <button
        onClick={handleOpenDropdown}
        className="relative p-2 text-muted-foreground hover:text-black transition-colors rounded-lg hover:bg-gray-100"
        title="Live website activity"
      >
        <Bell size={19} />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        )}
      </button>

      {/* Floating Toast Notification on Event */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-200 shadow-xl rounded-2xl p-4 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Live Website Event
              </span>
              <button
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs font-bold text-gray-900 truncate mt-0.5">{toast.title}</p>
            <p className="text-[11px] text-gray-600 truncate">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* Activity Feed Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-black/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>Live Activity</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </h4>
              <p className="text-[10px] text-gray-500">
                Auto-syncs live actions without refreshing
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                title={soundEnabled ? "Mute chimes" : "Enable sound chimes"}
                className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200/60 transition-colors"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => setUnreadCount(0)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded"
              >
                Mark read
              </button>
            </div>
          </div>

          {/* List of Activities */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No recent activity detected.
              </div>
            ) : (
              activities.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => setIsOpen(false)}
                  className="p-3 flex items-start gap-3 hover:bg-gray-50/80 transition-colors block group"
                >
                  <div className="p-2 bg-gray-100 rounded-xl shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="text-gray-300 group-hover:text-emerald-600 shrink-0 mt-1 transition-colors"
                  />
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Last sync: {lastSyncedAt.toLocaleTimeString()}</span>
            <button
              onClick={() => checkLiveActivity(true)}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Refresh Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
