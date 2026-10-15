"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Send,
  Loader2,
  X,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  Zap,
} from "lucide-react";
import { subscribeToPush, unsubscribeFromPush, sendTestPushNotification } from "@/actions/push";

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

interface PushNotificationManagerProps {
  role?: "EMPLOYER" | "WORKER" | "ADMIN";
}

type PushState = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";

export function PushNotificationManager({ role }: PushNotificationManagerProps) {
  const [state, setState] = useState<PushState>("loading");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Initial check on mount
  useEffect(() => {
    async function checkSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          setState("subscribed");
        } else {
          setState("unsubscribed");
        }
      } catch (err) {
        console.error("[Push] Check error:", err);
        setState("unsubscribed");
      }
    }

    checkSubscription();
  }, []);

  async function handleToggleSubscribe() {
    setErrorMessage(null);
    setTestStatus(null);
    setIsSubmitting(true);

    try {
      if (state === "subscribed") {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await unsubscribeFromPush(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setState("unsubscribed");
      } else {
        // Request browser permission
        const permission = await Notification.requestPermission();
        if (permission === "denied") {
          setState("denied");
          setIsSubmitting(false);
          return;
        }

        if (permission !== "granted") {
          setState("unsubscribed");
          setIsSubmitting(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error("Push notifications VAPID public key is missing.");
        }

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        const serialized = JSON.parse(JSON.stringify(subscription));
        const res = await subscribeToPush(serialized);

        if (!res.success) {
          throw new Error(res.error || "Failed to register subscription on server.");
        }

        setState("subscribed");
      }
    } catch (err: any) {
      console.error("[Push] Subscription toggle failed:", err);
      setErrorMessage(err?.message || "Failed to update notification settings.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendTest() {
    setErrorMessage(null);
    setTestStatus(null);
    setIsSubmitting(true);

    try {
      const res = await sendTestPushNotification();
      if (res.success) {
        setTestStatus("Test alert sent! Check your device notification tray.");
      } else {
        setErrorMessage(res.error || "Failed to send test push.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error sending test alert.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Push Notification Settings"
        aria-label="Push Notification Settings"
        className="relative p-2 text-neutral-600 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100"
      >
        {state === "subscribed" ? (
          <BellRing className="w-5 h-5 text-neutral-800" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Status Dot */}
        {state === "subscribed" && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#008751] rounded-full ring-2 ring-white animate-pulse" />
        )}
        {state === "unsubscribed" && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#008751] flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Device Notifications</h3>
                <p className="text-xs text-neutral-500">Real-time alerts via Web Push</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-4">
            {/* Status Card */}
            <div className="p-3.5 rounded-xl border border-neutral-200/70 bg-neutral-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-neutral-500 block mb-0.5">Device Status</span>
                <div className="flex items-center gap-1.5">
                  {state === "subscribed" && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#008751]" />
                      <span className="text-xs font-semibold text-neutral-900">Active & Connected</span>
                    </>
                  )}
                  {state === "unsubscribed" && (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-neutral-800">Notifications Paused</span>
                    </>
                  )}
                  {state === "denied" && (
                    <>
                      <BellOff className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-semibold text-rose-700">Blocked in Browser</span>
                    </>
                  )}
                  {state === "unsupported" && (
                    <>
                      <AlertCircle className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-semibold text-neutral-600">Unsupported Browser</span>
                    </>
                  )}
                  {state === "loading" && (
                    <>
                      <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                      <span className="text-xs font-semibold text-neutral-500">Checking...</span>
                    </>
                  )}
                </div>
              </div>

              {state !== "unsupported" && state !== "denied" && state !== "loading" && (
                <button
                  onClick={handleToggleSubscribe}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    state === "subscribed"
                      ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                      : "bg-[#008751] text-white hover:bg-[#007043] shadow-sm shadow-[#008751]/20"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                  ) : state === "subscribed" ? (
                    "Turn Off"
                  ) : (
                    "Turn On"
                  )}
                </button>
              )}
            </div>

            {/* Error or Denied State Notice */}
            {state === "denied" && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold mb-1">Notifications Blocked</p>
                To enable alerts, tap the <strong>lock icon 🔒</strong> in your browser address bar and switch Notifications to <strong>Allow</strong>.
              </div>
            )}

            {state === "unsupported" && (
              <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
                This browser or device does not support Web Push notifications. For push alerts, install Staff Guru as a PWA in Chrome, Edge, or Safari 16.4+.
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 leading-relaxed">
                {errorMessage}
              </div>
            )}

            {testStatus && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
                <span>{testStatus}</span>
              </div>
            )}

            {/* What you receive list */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Instant Push Triggers
              </span>
              <ul className="space-y-1.5 text-xs text-neutral-600">
                <li className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                  <span>Job handshake offers & worker responses</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                  <span>Agency fee verification & contact unlocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                  <span>Direct errand runner & client chat messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                  <span>Proof submission, revisions & payout releases</span>
                </li>
              </ul>
            </div>

            {/* Test Push Button */}
            {state === "subscribed" && (
              <div className="pt-2 border-t border-neutral-100">
                <button
                  onClick={handleSendTest}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-[#008751]" />
                  )}
                  <span>Send Test Notification</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
