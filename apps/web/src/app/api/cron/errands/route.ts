import { NextResponse } from "next/server";
import {
  processUnclaimedExpiredErrands,
  processAutoReleaseProofPayouts,
  processLiftBankPayoutHolds,
} from "@/actions/errandJobs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Authorize with CRON_SECRET or bearer authorization header
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "staffguru_cron_dev_secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron trigger." }, { status: 401 });
  }

  try {
    const expiredResult = await processUnclaimedExpiredErrands();
    const proofResult = await processAutoReleaseProofPayouts();
    const bankHoldResult = await processLiftBankPayoutHolds();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      expiredErrands: expiredResult,
      autoReleasedProofs: proofResult,
      bankHoldsLifted: bankHoldResult,
    });
  } catch (error: any) {
    console.error("Errand cron job error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal cron error." },
      { status: 500 }
    );
  }
}
