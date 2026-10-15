"use server";

import { getCurrentUser } from "./auth";
import {
  savePushSubscription,
  deletePushSubscription,
  sendPushToUser,
} from "@/server/services/pushNotifications";
import { db, pushSubscriptions, eq, and } from "@repo/db";

export interface SerializedPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Register or update push subscription for current user
 */
export async function subscribeToPush(subscription: SerializedPushSubscription) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const res = await savePushSubscription(session.userId, subscription);
    return { success: true, id: res.id };
  } catch (err: any) {
    console.error("[Push Action] Failed to save subscription:", err);
    return { success: false, error: err?.message || "Failed to register subscription" };
  }
}

/**
 * Unsubscribe current user device from push notifications
 */
export async function unsubscribeFromPush(endpoint: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deletePushSubscription(session.userId, endpoint);
    return { success: true };
  } catch (err: any) {
    console.error("[Push Action] Failed to remove subscription:", err);
    return { success: false, error: err?.message || "Failed to remove subscription" };
  }
}

/**
 * Send an immediate test push notification to verify device setup
 */
export async function sendTestPushNotification() {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const roleName = session.role === "EMPLOYER" ? "Employer" : "Worker";
    const res = await sendPushToUser(session.userId, {
      title: "Staff Guru Push Alerts Active 🚀",
      body: `Hi ${roleName}! Real-time push notifications are successfully configured on this device.`,
      url: session.role === "EMPLOYER" ? "/employer" : "/dashboard",
      tag: "test-push",
    });

    if (res.dispatched === 0) {
      return {
        success: false,
        error: "No active push subscription registered on this device yet. Please enable push notifications first.",
      };
    }

    return { success: true, count: res.dispatched };
  } catch (err: any) {
    console.error("[Push Action] Error sending test notification:", err);
    return { success: false, error: err?.message || "Failed to send test push" };
  }
}

/**
 * Check if the current user has any active subscriptions
 */
export async function getPushSubscriptionCount() {
  const session = await getCurrentUser();
  if (!session) return 0;

  const count = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, session.userId));

  return count.length;
}
