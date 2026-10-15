import { NextResponse } from "next/server";
import { getCurrentUser } from "@/actions/auth";
import {
  savePushSubscription,
  deletePushSubscription,
  sendPushToUser,
} from "@/server/services/pushNotifications";

// GET /api/push: Returns public VAPID key
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPID public key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey });
}

// POST /api/push: Handles subscribe, unsubscribe, and test-send
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, subscription, endpoint } = body;

    if (action === "subscribe") {
      if (!subscription?.endpoint || !subscription?.keys) {
        return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
      }
      const res = await savePushSubscription(session.userId, subscription);
      return NextResponse.json({ success: true, id: res.id });
    }

    if (action === "unsubscribe") {
      if (!endpoint) {
        return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
      }
      await deletePushSubscription(session.userId, endpoint);
      return NextResponse.json({ success: true });
    }

    if (action === "test") {
      const res = await sendPushToUser(session.userId, {
        title: "Staff Guru Push Alerts Active 🚀",
        body: "Real-time push notifications are successfully configured and active on this device.",
        url: session.role === "EMPLOYER" ? "/employer" : "/dashboard",
      });
      return NextResponse.json({ success: true, count: res.dispatched });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[API Push Error]:", err);
    return NextResponse.json({ error: err.message || "Push error" }, { status: 500 });
  }
}
