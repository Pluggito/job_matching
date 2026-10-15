import webPush from "web-push";
import { db, pushSubscriptions, eq, and } from "@repo/db";

// Configure Web Push with VAPID credentials
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@staffguru.ng";

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

/**
 * Upsert or register a push subscription for a user
 */
export async function savePushSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
) {
  if (!subscription?.endpoint || !subscription?.keys) {
    throw new Error("Invalid subscription object");
  }

  // Check if this endpoint already exists for this user
  const [existing] = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, subscription.endpoint)
      )
    )
    .limit(1);

  if (existing) {
    // Update keys and timestamp
    await db
      .update(pushSubscriptions)
      .set({
        keys: subscription.keys,
        createdAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing.id));
    return { success: true, id: existing.id };
  }

  // Insert new subscription
  const [inserted] = await db
    .insert(pushSubscriptions)
    .values({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    })
    .returning({ id: pushSubscriptions.id });

  return { success: true, id: inserted?.id };
}

/**
 * Remove an existing push subscription (e.g., when user toggles off)
 */
export async function deletePushSubscription(userId: string, endpoint: string) {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );
  return { success: true };
}

/**
 * Send a Web Push notification to all active devices registered by a user
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[Push] VAPID keys not configured in environment, skipping push dispatch.");
    return { dispatched: 0, failed: 0 };
  }

  // Fetch all subscriptions for this user
  const subs = await db
    .select({
      id: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      keys: pushSubscriptions.keys,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  if (subs.length === 0) {
    return { dispatched: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/dashboard",
    icon: payload.icon || "/icons/icon-192x192.png",
    badge: payload.badge || "/icons/icon-192x192.png",
    tag: payload.tag || "staff-guru-notice",
  });

  let dispatched = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        const pushConfig = {
          endpoint: sub.endpoint,
          keys: sub.keys as { p256dh: string; auth: string },
        };

        await webPush.sendNotification(pushConfig, notificationPayload);
        dispatched++;
      } catch (err: any) {
        failed++;
        console.warn(`[Push] Failed to send to endpoint (${sub.endpoint.slice(0, 30)}...):`, err?.message);

        // If the subscription is no longer valid (expired or unsubscribed from browser)
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          console.info("[Push] Pruning expired subscription id:", sub.id);
          try {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          } catch (deleteErr) {
            console.error("[Push] Error deleting expired subscription:", deleteErr);
          }
        }
      }
    })
  );

  return { dispatched, failed };
}

/**
 * Dispatch push notifications to multiple users in parallel
 */
export async function sendPushToMultipleUsers(userIds: string[], payload: PushPayload) {
  const uniqueUserIds = Array.from(new Set(userIds));
  return Promise.all(uniqueUserIds.map((id) => sendPushToUser(id, payload)));
}
