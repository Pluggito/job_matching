"use server";

import { db, notifications, eq, and, desc, isNull, sql } from "@repo/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { sendPushToUser } from "@/server/services/pushNotifications";

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  content: string;
  link?: string;
  tag?: string;
  skipPush?: boolean;
}

/**
 * Unified notification dispatcher:
 * Inserts in-app database notification AND dispatches real-time Web Push notification.
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        content: params.content,
        link: params.link,
      })
      .returning();

    const notifId = inserted?.id || `notif-${Date.now()}`;

    // Trigger Web Push in background if not skipped
    if (!params.skipPush) {
      sendPushToUser(params.userId, {
        title: params.title,
        body: params.content,
        url: params.link || "/dashboard",
        tag: params.tag || `notification-${notifId}`,
      }).catch((err) => {
        console.error("[Notification Service] Push dispatch error:", err);
      });
    }

    return { success: true, notification: inserted };
  } catch (err: any) {
    console.error("[Notification Service] Failed to create notification:", err);
    return { success: false, error: err?.message || "Failed to create notification" };
  }
}

/**
 * Fetch notifications for current authenticated user with pagination and filter
 */
export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "Unauthorized", items: [], totalUnread: 0 };
  }

  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  const unreadOnly = params?.unreadOnly ?? false;

  try {
    const conditions = [eq(notifications.userId, session.userId)];
    if (unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }

    const items = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get unread count
    const [unreadResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.userId),
          isNull(notifications.readAt)
        )
      );

    const totalUnread = Number(unreadResult?.count || 0);

    return {
      success: true,
      items: items.map((item) => ({
        ...item,
        isRead: !!item.readAt,
      })),
      totalUnread,
    };
  } catch (err: any) {
    console.error("[Notification Action] Failed to fetch notifications:", err);
    return { success: false, error: err?.message, items: [], totalUnread: 0 };
  }
}

/**
 * Get quick count of unread notifications for badge display
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const session = await getCurrentUser();
  if (!session) return 0;

  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.userId),
          isNull(notifications.readAt)
        )
      );

    return Number(result?.count || 0);
  } catch (err) {
    console.error("[Notification Action] Error counting unread:", err);
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string) {
  const session = await getCurrentUser();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, session.userId)
        )
      );

    revalidatePath("/dashboard");
    revalidatePath("/employer");
    return { success: true };
  } catch (err: any) {
    console.error("[Notification Action] Failed to mark as read:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead() {
  const session = await getCurrentUser();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, session.userId),
          isNull(notifications.readAt)
        )
      );

    revalidatePath("/dashboard");
    revalidatePath("/employer");
    return { success: true };
  } catch (err: any) {
    console.error("[Notification Action] Failed to mark all as read:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string) {
  const session = await getCurrentUser();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, session.userId)
        )
      );

    revalidatePath("/dashboard");
    revalidatePath("/employer");
    return { success: true };
  } catch (err: any) {
    console.error("[Notification Action] Failed to delete notification:", err);
    return { success: false, error: err?.message };
  }
}
