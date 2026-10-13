import Link from "next/link";
import { Building, AlertCircle, ArrowRight } from "lucide-react";
import { db, workerProfiles, workerBankAccounts, eq, and } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";

export default async function BankPromptBanner() {
  const session = await getCurrentUser();
  if (!session || session.role !== "WORKER") return null;

  // Fetch worker profile
  const [profile] = await db
    .select({
      id: workerProfiles.id,
      openToErrands: workerProfiles.openToErrands,
    })
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile || !profile.openToErrands) {
    // Only prompt workers who have opted into errands
    return null;
  }

  // Check if worker already has an active bank account on file
  const [bankAccount] = await db
    .select({ id: workerBankAccounts.id })
    .from(workerBankAccounts)
    .where(
      and(
        eq(workerBankAccounts.workerProfileId, profile.id),
        eq(workerBankAccounts.isActive, true)
      )
    )
    .limit(1);

  if (bankAccount) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Building size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
            Bank Account on File Required for Errand Payouts
          </h4>
          <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
            You opted in to receive on-demand Alabaru errands. Add your Nigerian bank account to receive direct 70% payouts upon completing tasks. Your bank details are encrypted and never shown to employers.
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/profile/bank"
        className="h-10 px-5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs transition-transform hover:-translate-y-0.5 flex items-center gap-2 shrink-0 shadow-md shadow-amber-900/10"
      >
        Add Bank Account <ArrowRight size={14} />
      </Link>
    </div>
  );
}
