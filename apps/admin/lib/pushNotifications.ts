import webPush from "web-push";
import { db, pushSubscriptions, users, eq, and, inArray } from "@repo/db";

// Configure Web Push with VAPID credentials
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@staffguru.ng";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error("[Admin Push] VAPID initialization error:", err);
  }
}

export interface AdminPushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

/**
 * Register or update push subscription for an admin user
 */
export async function saveAdminPushSubscription(
  adminUserId: string,
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

  // Check if endpoint exists
  const [existing] = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, adminUserId),
        eq(pushSubscriptions.endpoint, subscription.endpoint)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(pushSubscriptions)
      .set({
        keys: subscription.keys,
        createdAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing.id));
    return { success: true, id: existing.id };
  }

  const [inserted] = await db
    .insert(pushSubscriptions)
    .values({
      userId: adminUserId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    })
    .returning({ id: pushSubscriptions.id });

  return { success: true, id: inserted?.id };
}

/**
 * Remove an existing admin push subscription
 */
export async function deleteAdminPushSubscription(adminUserId: string, endpoint: string) {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, adminUserId),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );
  return { success: true };
}

/**
 * Send Web Push notification to a specific admin
 */
export async function sendPushToAdmin(adminUserId: string, payload: AdminPushPayload) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("[Admin Push] VAPID keys not configured, skipping push.");
    return { dispatched: 0, failed: 0 };
  }

  const subs = await db
    .select({
      id: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      keys: pushSubscriptions.keys,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, adminUserId));

  if (subs.length === 0) {
    return { dispatched: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/",
    icon: payload.icon || "/logo.png",
    badge: payload.badge || "/logo.png",
    tag: payload.tag || "staffguru-admin-notice",
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
        console.warn(`[Admin Push] Failed to send: ${err?.message}`);
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          try {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          } catch (delErr) {
            console.error("[Admin Push] Error cleaning up expired sub:", delErr);
          }
        }
      }
    })
  );

  return { dispatched, failed };
}

/**
 * Broadcast Web Push to all active admin devices across the team
 */
export async function sendPushToAllAdmins(payload: AdminPushPayload) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { dispatched: 0, failed: 0 };
  }

  // Get all user IDs with ADMIN role
  const adminUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "ADMIN"));

  if (adminUsers.length === 0) return { dispatched: 0, failed: 0 };

  const results = await Promise.all(
    adminUsers.map((u) => sendPushToAdmin(u.id, payload))
  );

  const dispatched = results.reduce((sum, r) => sum + r.dispatched, 0);
  const failed = results.reduce((sum, r) => sum + r.failed, 0);

  return { dispatched, failed };
}
