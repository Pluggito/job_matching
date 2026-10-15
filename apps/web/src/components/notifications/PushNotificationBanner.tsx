"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import { subscribeToPush } from "@/actions/push";

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

export function PushNotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in localStorage
    const dismissed = localStorage.getItem("staffguru_push_banner_dismissed");
    if (dismissed) return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "denied" || Notification.permission === "granted") return;

    // Show prompt if user hasn't made a choice yet
    setIsVisible(true);
  }, []);

  async function handleEnable() {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (vapidPublicKey) {
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
          const serialized = JSON.parse(JSON.stringify(subscription));
          await subscribeToPush(serialized);
        }
      }
      setIsVisible(false);
    } catch (err) {
      console.error("[Push Banner] Subscription error:", err);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem("staffguru_push_banner_dismissed", "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="w-full bg-neutral-900 text-white px-4 py-2.5 rounded-xl mb-4 flex items-center justify-between shadow-md border border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#008751]/20 text-[#008751] flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-white">Enable Real-Time Alerts:</span>
          <span className="text-neutral-300 ml-1.5 hidden sm:inline">
            Get instant notifications on placement offers, fee verification, and runner chat updates.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnable}
          disabled={isLoading}
          className="px-3 py-1 bg-[#008751] hover:bg-[#007043] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enable"}
        </button>
        <button
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
