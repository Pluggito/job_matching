"use server";

import { getAdminUser } from "./auth";
import {
  saveAdminPushSubscription,
  deleteAdminPushSubscription,
  sendPushToAdmin,
} from "./pushNotifications";

export interface SerializedAdminSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function subscribeAdminAction(subscription: SerializedAdminSubscription) {
  const admin = await getAdminUser().catch(() => null);
  if (!admin) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const res = await saveAdminPushSubscription(admin.id, subscription);
    return { success: true, id: res.id };
  } catch (err: any) {
    console.error("[Admin Push Action] Subscribe error:", err);
    return { success: false, error: err?.message || "Failed to register subscription." };
  }
}

export async function unsubscribeAdminAction(endpoint: string) {
  const admin = await getAdminUser().catch(() => null);
  if (!admin) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await deleteAdminPushSubscription(admin.id, endpoint);
    return { success: true };
  } catch (err: any) {
    console.error("[Admin Push Action] Unsubscribe error:", err);
    return { success: false, error: err?.message || "Failed to remove subscription." };
  }
}

export async function sendAdminTestPushAction() {
  const admin = await getAdminUser().catch(() => null);
  if (!admin) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    const res = await sendPushToAdmin(admin.id, {
      title: "Staff Guru Admin Alerts Active 🔔",
      body: `Hi ${admin.fullName}! Admin push alerts are connected and working on this device.`,
      url: "/",
      tag: "admin-test-push",
    });

    if (res.dispatched === 0) {
      return {
        success: false,
        error: "No active push subscription found for your admin account. Please toggle alerts off and on again.",
      };
    }

    return { success: true, dispatched: res.dispatched };
  } catch (err: any) {
    console.error("[Admin Push Action] Test push error:", err);
    return { success: false, error: err?.message || "Failed to dispatch test notification." };
  }
}
