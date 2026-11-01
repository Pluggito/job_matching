import { formatDateDDMMYYYY } from "@repo/shared";
import {
  db,
  paymentEvents,
  payments,
  hiringRequests,
  placements,
  errands,
  workerProfiles,
  users,
  replacementRequests,
  desc,
  eq,
  sql,
} from "@repo/db";
import { getAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface LiveActivityItem {
  id: string;
  type: "PAYMENT" | "REQUEST" | "PLACEMENT" | "WORKER" | "ERRAND" | "REPLACEMENT";
  title: string;
  description: string;
  createdAt: string;
  link: string;
  badge?: string;
}

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser().catch(() => null);
    if (!admin) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get("since");
    const sinceDate = sinceParam ? new Date(sinceParam) : null;

    // Fetch latest events across critical tables in parallel
    const [
      recentPayments,
      recentRequests,
      recentPlacements,
      recentErrands,
      recentWorkers,
      recentReplacements,
      [openReqCount],
      [activePlaceCount],
      [pendingVerifCount],
    ] = await Promise.all([
      db
        .select({
          id: paymentEvents.id,
          eventType: paymentEvents.eventType,
          amountKobo: paymentEvents.amountKobo,
          createdAt: paymentEvents.createdAt,
          paymentId: paymentEvents.paymentId,
        })
        .from(paymentEvents)
        .orderBy(desc(paymentEvents.createdAt))
        .limit(10),

      db
        .select({
          id: hiringRequests.id,
          title: hiringRequests.title,
          category: hiringRequests.category,
          locationState: hiringRequests.locationState,
          budgetMax: hiringRequests.budgetMax,
          createdAt: hiringRequests.createdAt,
        })
        .from(hiringRequests)
        .orderBy(desc(hiringRequests.createdAt))
        .limit(10),

      db
        .select({
          id: placements.id,
          status: placements.status,
          startDate: placements.startDate,
          replacementDeadline: placements.replacementDeadline,
        })
        .from(placements)
        .orderBy(desc(placements.startDate))
        .limit(8),

      db
        .select({
          id: errands.id,
          title: errands.title,
          type: errands.type,
          status: errands.status,
          taskPriceKobo: errands.taskPriceKobo,
          createdAt: errands.createdAt,
        })
        .from(errands)
        .orderBy(desc(errands.createdAt))
        .limit(8),

      db
        .select({
          id: workerProfiles.id,
          category: workerProfiles.category,
          locationState: workerProfiles.locationState,
          verificationStatus: workerProfiles.verificationStatus,
          createdAt: users.createdAt,
        })
        .from(workerProfiles)
        .innerJoin(users, eq(workerProfiles.userId, users.id))
        .orderBy(desc(users.createdAt))
        .limit(8),

      db
        .select({
          id: replacementRequests.id,
          reason: replacementRequests.reason,
          createdAt: replacementRequests.createdAt,
        })
        .from(replacementRequests)
        .orderBy(desc(replacementRequests.createdAt))
        .limit(5),

      // Live metrics for badges
      db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(hiringRequests)
        .where(sql`${hiringRequests.status} = 'OPEN'`),

      db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(placements)
        .where(sql`${placements.status} = 'ACTIVE'`),

      db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(workerProfiles)
        .where(sql`${workerProfiles.verificationStatus} = 'PENDING'`),
    ]);

    // Normalize all items into a single unified timeline
    const activities: LiveActivityItem[] = [];

    for (const p of recentPayments) {
      const amountNaira = (p.amountKobo / 100).toLocaleString();
      let title = `Payment Event: ${p.eventType}`;
      let description = `₦${amountNaira} processed`;
      if (p.eventType === "COMMISSION_RETAINED") {
        title = `₦${amountNaira} Handshake Fee Verified`;
        description = "Agency fee paid & confirmed by employer";
      } else if (p.eventType === "ESCROW_HELD") {
        title = `₦${amountNaira} Errand Funded`;
        description = "Task escrow locked awaiting runner fulfillment";
      } else if (p.eventType === "REFUNDED_TO_EMPLOYER") {
        title = `₦${amountNaira} Refund Issued`;
        description = "Transaction amount refunded to employer";
      }

      activities.push({
        id: `payment_${p.id}`,
        type: "PAYMENT",
        title,
        description,
        createdAt: p.createdAt.toISOString(),
        link: "/requests",
        badge: "Payment",
      });
    }

    for (const r of recentRequests) {
      activities.push({
        id: `request_${r.id}`,
        type: "REQUEST",
        title: `New Job Request: ${r.title || r.category}`,
        description: `${r.locationState || "Nigeria"} · Budget: ₦${r.budgetMax ? r.budgetMax.toLocaleString() : "Negotiable"}`,
        createdAt: r.createdAt.toISOString(),
        link: "/requests",
        badge: "Hiring Request",
      });
    }

    for (const pl of recentPlacements) {
      activities.push({
        id: `placement_${pl.id}`,
        type: "PLACEMENT",
        title: `Placement Confirmed · 14-Day SLA Active`,
        description: `Candidate handshake confirmed. Replacement guarantee until ${pl.replacementDeadline ? formatDateDDMMYYYY(pl.replacementDeadline) : "14 days"}`,
        createdAt: pl.startDate.toISOString(),
        link: "/placements",
        badge: "Placement",
      });
    }

    for (const e of recentErrands) {
      const priceNaira = e.taskPriceKobo ? `₦${(e.taskPriceKobo / 100).toLocaleString()}` : "";
      activities.push({
        id: `errand_${e.id}`,
        type: "ERRAND",
        title: `Errand: ${e.title}`,
        description: `${e.type.replace(/_/g, " ")} · Status: ${e.status} ${priceNaira ? `· ${priceNaira}` : ""}`,
        createdAt: e.createdAt.toISOString(),
        link: "/errands",
        badge: "Errand",
      });
    }

    for (const w of recentWorkers) {
      activities.push({
        id: `worker_${w.id}`,
        type: "WORKER",
        title: `Candidate: ${w.category || "New Applicant"}`,
        description: `${w.locationState || "Nigeria"} · Verification: ${w.verificationStatus}`,
        createdAt: w.createdAt.toISOString(),
        link: "/workers",
        badge: "Worker",
      });
    }

    for (const rep of recentReplacements) {
      activities.push({
        id: `replacement_${rep.id}`,
        type: "REPLACEMENT",
        title: `SLA Replacement Claim`,
        description: `Reason: ${rep.reason || "Employer candidate replacement requested"}`,
        createdAt: rep.createdAt.toISOString(),
        link: "/placements",
        badge: "Replacement",
      });
    }

    // Sort combined activities descending by timestamp
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const topActivities = activities.slice(0, 15);
    const latestTimestamp = topActivities[0]?.createdAt ?? new Date().toISOString();

    let hasNewActivity = false;
    let newItemsCount = 0;

    if (sinceDate && !isNaN(sinceDate.getTime())) {
      const newItems = topActivities.filter((item) => new Date(item.createdAt) > sinceDate);
      if (newItems.length > 0) {
        hasNewActivity = true;
        newItemsCount = newItems.length;
      }
    }

    return Response.json({
      success: true,
      latestTimestamp,
      hasNewActivity,
      newItemsCount,
      activities: topActivities,
      counts: {
        openRequests: openReqCount?.count || 0,
        activePlacements: activePlaceCount?.count || 0,
        pendingVerifications: pendingVerifCount?.count || 0,
      },
    });
  } catch (error: any) {
    console.error("[Admin Live-Sync API Error]:", error);
    return Response.json(
      { success: false, error: error?.message || "Failed to fetch live sync data" },
      { status: 500 }
    );
  }
}
