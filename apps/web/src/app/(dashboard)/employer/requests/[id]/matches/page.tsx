import { getMatchesForRequest } from "../../../../../../server/services/matching";
import { getHiringRequest } from "../../../../../../server/services/hiringRequests";
import { getCurrentUser } from "../../../../../../actions/auth";
import { verifyPaymentReference } from "../../../../../../actions/payments";
import { CheckCircle2, MapPin, Briefcase, Calendar, Star, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { db, selections, payments, eq, sql } from "@repo/db";
import ShortlistButton from "./ShortlistButton";
import HireButton from "./HireButton";
import PayAgencyFeeButton from "@/components/payments/PayAgencyFeeButton";
import { notFound } from "next/navigation";

// Matches page fetches directly from server
export default async function MatchesPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { payment_ref?: string };
}) {
  const session = await getCurrentUser();
  if (!session) return notFound();

  // If returning from Paystack redirect with a payment reference, verify it in real-time in background
  if (searchParams?.payment_ref) {
    try {
      await verifyPaymentReference(searchParams.payment_ref);
    } catch (e) {
      console.error("[Payment Callback Verify Error]:", e);
    }
  }
  
  let matches;
  let request;
  try {
    matches = await getMatchesForRequest(session.userId, params.id);
    request = await getHiringRequest(params.id);
  } catch (error) {
    return notFound();
  }

  if (!request) return notFound();

  // Fetch existing selections with their status and verified payment
  const requestSelections = await db
    .select({
      id: selections.id,
      workerProfileId: selections.workerProfileId,
      status: selections.status,
      feeAmount: selections.feeAmount,
      termsAcceptedAt: selections.termsAcceptedAt,
      hiredAt: selections.hiredAt,
      isPaid: sql<boolean>`EXISTS (
        SELECT 1 FROM ${payments} 
        WHERE ${payments.selectionId} = ${selections.id} 
        AND ${payments.status} = 'VERIFIED'
      )`,
      isPendingPayment: sql<boolean>`EXISTS (
        SELECT 1 FROM ${payments} 
        WHERE ${payments.selectionId} = ${selections.id} 
        AND ${payments.status} = 'PENDING'
      )`,
    })
    .from(selections)
    .where(eq(selections.hiringRequestId, request.id));
    
  const selectionMap = new Map(requestSelections.map(s => [s.workerProfileId, s]));

  return (
    <div className="w-full py-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/employer" className="text-sm font-bold text-[var(--green)] hover:text-[var(--ink)] mb-4 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-[var(--ink)]">Smart Matches</h1>
          <p className="text-muted-foreground mt-2">Showing {matches.total} top candidates for <strong>{request.title}</strong></p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[var(--line)] shadow-sm">
          <div className="text-center px-4">
            <span className="block text-2xl font-black text-[var(--ink)]">{matches.total}</span>
            <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider">Found</span>
          </div>
          <div className="w-px h-10 bg-[var(--line)]"></div>
          <div className="text-center px-4">
            <span className="block text-2xl font-black text-[var(--green)]">{request.budgetMax.toLocaleString()}₦</span>
            <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider">Max Budget</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {matches.data.map((match, idx) => {
          const sel = selectionMap.get(match.workerId);

          return (
            <div key={match.workerId} className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-[var(--green)] text-white text-xs font-bold px-4 py-1 rounded-bl-xl shadow-sm z-10">
                  TOP MATCH
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                
                {/* Match Score Ring */}
                <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-full border-4 border-[var(--canvas)] relative">
                  <div 
                    className="absolute inset-[-4px] rounded-full border-4 border-[var(--lime)]"
                    style={{ clipPath: `polygon(0 0, 100% 0, 100% ${match.score}%, 0 ${match.score}%)` }}
                  />
                  <span className="text-3xl font-black text-[var(--ink)] relative z-10">{match.score}</span>
                  <span className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider relative z-10">Match</span>
                </div>

                {/* Candidate Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-[var(--ink)]">{match.preview.category}</h3>
                      {match.preview.isVerified && (
                        <div className="flex items-center gap-1 bg-[var(--lime)]/20 text-[var(--green)] text-xs font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} strokeWidth={3} /> Verified
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--ink-soft)]">
                      {match.preview.locationState && (
                        <span className="flex items-center gap-1"><MapPin size={14} /> {match.preview.locationArea}, {match.preview.locationState}</span>
                      )}
                      <span className="flex items-center gap-1"><Briefcase size={14} /> {match.preview.experienceYears} Years Exp.</span>
                      <span className="flex items-center gap-1"><Calendar size={14} /> {match.preview.availabilityStatus.replace("_", " ")}</span>
                      {match.preview.rating && (
                        <span className="flex items-center gap-1 text-[var(--orange)] font-bold"><Star size={14} fill="currentColor" /> {match.preview.rating}</span>
                      )}
                    </div>
                  </div>

                  {/* Reasons Chips */}
                  <div className="flex flex-wrap gap-2">
                    {match.reasons.map((reason: string, i: number) => (
                      <span key={i} className="inline-flex items-center bg-[var(--canvas)] text-[var(--ink)] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)]">
                        {reason}
                      </span>
                    ))}
                    {match.gap && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-200">
                        <AlertTriangle size={12} /> {match.gap}
                      </span>
                    )}
                  </div>
                  
                  {/* Skills Preview */}
                  <div className="pt-2 border-t border-[var(--line)]/50">
                    <p className="text-xs text-[var(--ink-soft)] mb-2 uppercase tracking-wider font-bold">Skills</p>
                    <p className="text-sm font-medium">{match.preview.skills.join(" • ")}</p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="shrink-0 flex flex-col items-stretch gap-3 w-full md:w-56">
                  {!sel ? (
                    <ShortlistButton 
                      workerProfileId={match.workerId} 
                      hiringRequestId={request.id} 
                      initialSent={false} 
                    />
                  ) : sel.isPaid && (sel.status === "CONFIRMED" || sel.termsAcceptedAt) ? (
                    <div className="flex flex-col gap-1 text-center">
                      <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 border border-neutral-200/80 text-xs font-semibold px-3 py-1.5 rounded-xl justify-center">
                        <CheckCircle2 size={13} strokeWidth={2.5} className="text-[#008751]" /> Handshake Confirmed
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        14-day SLA active
                      </span>
                    </div>
                  ) : (sel.status === "CONFIRMED" || sel.termsAcceptedAt) ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 justify-center">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Candidate Accepted! 🎉</span>
                      </div>
                      <PayAgencyFeeButton
                        selectionId={sel.id}
                        feeAmount={50000}
                        candidateName={match.preview.category}
                        jobTitle={request.title}
                        triggerText="Unlock Credentials"
                        compact
                      />
                      <span className="text-[10px] text-center text-neutral-500 font-medium">
                        Staff Guru holds credentials until fee payment
                      </span>
                    </div>
                  ) : sel.status === "CANCELLED" ? (
                    <div className="flex flex-col gap-1.5 text-center">
                      <div className="h-10 px-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-2">
                        <span>Offer Declined</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-medium text-center">
                        Select another candidate
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 text-center">
                      <div className="h-10 px-4 rounded-xl bg-neutral-100 text-neutral-800 border border-neutral-200 font-semibold text-xs flex items-center justify-center gap-2">
                        <Clock size={14} className="text-neutral-500" />
                        <span>Offer Sent</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-medium text-center">
                        Waiting for candidate response
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/employer/workers/${match.workerId}`}
                    className="h-10 px-6 rounded-xl border border-[var(--ink)] text-[var(--ink)] font-bold text-sm hover:bg-[var(--canvas)] transition-colors flex items-center justify-center text-center"
                  >
                    {sel?.isPaid && (sel?.status === "CONFIRMED" || sel?.termsAcceptedAt)
                      ? "View Phone Number"
                      : "View Profile"}
                  </Link>
                </div>

              </div>
            </div>
          );
        })}

        {matches.data.length === 0 && (
          <div className="bg-white rounded-2xl border border-[var(--line)] p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No matches found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We couldn't find any approved workers that match your strict requirements at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

