"use client";

import { MapPin, Check, Building, Hash, User, Copy, PhoneCall, Mail, Loader2, ShieldCheck, Clock, CheckCircle2, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PayAgencyFeeButton from "@/components/payments/PayAgencyFeeButton";
import { revealWorkerPhone } from "@/actions/contact";
import SubmitRatingModal from "@/components/ratings/SubmitRatingModal";

export default function PublicWorkerProfileClient({
  worker,
  isConnected = false,
  placementId,
  initialRating,
  pendingSelectionId,
  isSelectionPaid = false,
  isCandidateAccepted = false,
}: {
  worker: any;
  isConnected?: boolean;
  placementId?: string;
  initialRating?: {
    id?: string;
    score: number;
    feedback?: string | null;
  } | null;
  pendingSelectionId?: string;
  isSelectionPaid?: boolean;
  isCandidateAccepted?: boolean;
}) {
  const router = useRouter();
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(initialRating || null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const profileData = (worker.profileData as Record<string, any>) || {};
  
  const avatar = profileData.avatar || null;
  const portfolio = profileData.samples || [];
  
  const fullName = profileData.fullName || "Worker Profile";
  const aboutMe = profileData.aboutMe || "";
  
  const expectedPayStr = `₦${worker.expectedPay.toLocaleString()} / month`;

  const copyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const copyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleRevealContact = async () => {
    if (!placementId) return;
    setIsRevealing(true);
    setRevealError(null);
    try {
      const res = await revealWorkerPhone(placementId);
      if (res.success && (res.phone || res.email)) {
        setRevealedPhone(res.phone || null);
        setRevealedEmail(res.email || null);
      } else {
        setRevealError(res.error || "Failed to reveal contact details");
      }
    } catch (err: any) {
      setRevealError(err?.message || "Failed to reveal contact details");
    } finally {
      setIsRevealing(false);
    }
  };

  const initials =
    String(fullName)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "?";

  const sectionHeading = "text-[22px] font-semibold leading-tight text-[var(--ink)]";
  const rowLabel = "text-[13px] text-black/55";
  const rowValue = "mt-0.5 text-[15px] text-[var(--ink)] break-words";

  return (
    <div className="mx-auto w-full max-w-[1100px] pb-12">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span>Back</span>
      </button>
      
      <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
        {/* Header */}
        <header className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8 bg-black/[0.01]">
          <div className="flex min-w-0 items-start gap-5">
            <div className="relative h-[84px] w-[84px] shrink-0">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-full w-full rounded-full border border-black/10 object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full bg-black/[0.06] text-[26px] font-medium text-black/60"
                  role="img"
                >
                  {initials}
                </div>
              )}
              <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--ng)]" aria-hidden="true" />
            </div>

            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="break-words text-[32px] font-medium leading-tight tracking-tight text-[var(--ink)] capitalize">
                  {fullName}
                </h1>
                {worker.ninVerificationStatus === "VERIFIED" ? (
                  <span className="group/tip relative inline-flex">
                    <span className="inline-flex items-center gap-1.5 text-[14px] text-[var(--ink)] outline-none">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ng)] text-white" aria-hidden="true">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                      <span className="underline underline-offset-2">NIN verified</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-[14px] text-black/55">NIN pending</span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-black/60">
                <span className="text-[14px] font-medium text-[var(--ink)]">{worker.category}</span>
                <span aria-hidden="true" className="text-black/30">·</span>
                {worker.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} aria-hidden="true" />
                    <span>{worker.location}</span>
                  </span>
                )}
                {worker.location && <span aria-hidden="true" className="text-black/30">·</span>}
                <span className="inline-flex items-center gap-1.5">
                   <span className="font-semibold text-[var(--ink)]">4.9</span> (24 reviews)
                </span>
                <span aria-hidden="true" className="text-black/30">·</span>
                <span className="rounded-full border border-black/15 px-2.5 py-0.5 text-[12px] text-black/60">
                  {worker.availabilityStatus === "AVAILABLE_NOW" ? "Available now" : "Currently busy"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Body: main + narrow sidebar, split by a vertical rule */}
        <div className="grid grid-cols-1 border-t border-black/10 lg:grid-cols-[1fr_360px]">
          
          <div className="divide-y divide-black/10 lg:border-r border-black/10">
            <section aria-labelledby="about-heading" className="px-6 py-6 sm:px-8">
              <h2 id="about-heading" className={sectionHeading}>About</h2>
              {aboutMe ? (
                <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-[var(--ink)]/85">{aboutMe}</p>
              ) : (
                <p className="mt-4 text-[14px] text-black/55">No bio written.</p>
              )}
            </section>

            <section aria-labelledby="skills-heading" className="px-6 py-6 sm:px-8">
              <h2 id="skills-heading" className={sectionHeading}>Skills</h2>
              {worker.skills && worker.skills.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {worker.skills.map((skill: string) => (
                    <li key={skill} className="cursor-default rounded-full bg-black/[0.06] px-3.5 py-1.5 text-[14px] text-[var(--ink)]">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[14px] text-black/55">No skills listed.</p>
              )}
            </section>

            {portfolio.length > 0 && (
              <section aria-labelledby="portfolio-heading" className="px-6 py-6 sm:px-8">
                <h2 id="portfolio-heading" className={sectionHeading}>Portfolio</h2>
                <div className="mt-4">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {portfolio.map((url: string, i: number) => (
                      <div key={i} className="relative w-32 h-32 shrink-0 rounded-[12px] overflow-hidden border border-black/10">
                        <img src={url} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          <aside aria-labelledby="preferences-heading" className="px-6 py-6 sm:px-8 border-t border-black/10 lg:border-t-0 space-y-6">
            <div>
              <h2 id="preferences-heading" className={sectionHeading}>Work preferences</h2>
              <dl className="mt-4 divide-y divide-black/10">
                <div className="py-3 first:pt-0">
                  <dt className={rowLabel}>Expected pay</dt>
                  <dd className={rowValue}>{expectedPayStr}</dd>
                </div>
                <div className="py-3">
                  <dt className={rowLabel}>Availability</dt>
                  <dd className={rowValue}>{worker.availability}</dd>
                </div>
                <div className="py-3 last:pb-0">
                  <dt className={rowLabel}>Experience</dt>
                  <dd className={rowValue}>{worker.experienceYears}+ Years</dd>
                </div>
              </dl>
            </div>
            
            {/* Contact & Payment Status */}
            <div className="rounded-xl bg-[var(--canvas)] border border-[var(--line)] p-4 space-y-4">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
                    <Check size={14} strokeWidth={3} /> Agency Handshake Confirmed
                  </div>

                  <div className="rounded-lg bg-green-50/70 p-2.5 border border-green-200 text-xs text-green-900 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">14-Day SLA Active:</span> Protected by our candidate replacement guarantee.
                    </div>
                  </div>

                  {revealedPhone || revealedEmail ? (
                    <div className="space-y-3">
                      {revealedPhone && (
                        <div className="bg-white rounded-xl p-3.5 border border-[var(--line)] shadow-sm space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Candidate Direct Phone
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold font-mono text-[var(--ink)] tracking-wide">
                              {revealedPhone}
                            </span>
                            <button
                              onClick={() => copyAccount(revealedPhone)}
                              className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                              title="Copy phone number"
                            >
                              {copiedAcc ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {revealedEmail && (
                        <div className="bg-white rounded-xl p-3.5 border border-[var(--line)] shadow-sm space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Candidate Verified Email
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold font-mono text-[var(--ink)] tracking-wide truncate max-w-[200px]">
                              {revealedEmail}
                            </span>
                            <button
                              onClick={() => copyEmail(revealedEmail)}
                              className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
                              title="Copy email address"
                            >
                              {copiedEmail ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-gray-500 pt-1">
                        Call, SMS, or email candidate directly to finalize interview and resumption details.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleRevealContact}
                        disabled={isRevealing || !placementId}
                        className="w-full py-2.5 px-4 rounded-xl bg-[var(--green)] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isRevealing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <PhoneCall size={14} />
                        )}
                        Reveal Candidate Contact Details
                      </button>
                      {revealError && (
                        <p className="text-xs text-red-600 mt-2 font-medium">{revealError}</p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                        Access is securely logged and candidate is notified upon first contact details unlock.
                      </p>
                    </div>
                  )}

                  {/* Placement Rating & Review Section */}
                  {placementId && (
                    <div className="pt-3 border-t border-[var(--line)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Candidate Rating
                        </span>
                        <button
                          onClick={() => setIsRatingModalOpen(true)}
                          className="text-[11px] font-bold text-[var(--ng)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{currentRating ? "Edit Review" : "Rate Candidate"}</span>
                        </button>
                      </div>
                      {currentRating ? (
                        <div className="bg-white p-2.5 rounded-xl border border-[var(--line)] shadow-2xs space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={13}
                                className={s <= currentRating.score ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}
                              />
                            ))}
                            <span className="text-xs font-bold text-neutral-800 ml-1">
                              {currentRating.score}/5
                            </span>
                          </div>
                          {currentRating.feedback && (
                            <p className="text-[11px] text-neutral-600 italic">
                              "{currentRating.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400">
                          Leave feedback on work quality and reliability.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : pendingSelectionId && isCandidateAccepted && !isSelectionPaid ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Candidate Accepted Offer! 🎉</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    The candidate has accepted your job offer. Pay the agency fee (in full or 70%/30% installments) to immediately unlock their direct phone number and email address.
                  </p>
                  <PayAgencyFeeButton
                    selectionId={pendingSelectionId}
                    feeAmount={50000}
                    candidateName={worker.category || "Candidate"}
                    triggerText="Pay Agency Fee to Unlock Contact"
                    className="w-full"
                  />
                </div>
              ) : pendingSelectionId && !isCandidateAccepted ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 border border-neutral-200 text-xs font-semibold">
                    <Clock size={13} className="text-neutral-500" />
                    <span>Offer Sent · Awaiting Candidate</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    You have sent an official placement offer to this candidate. Once the candidate accepts the offer, you will be prompted to complete the agency placement fee to unlock their contact credentials.
                  </p>
                </div>
              ) : pendingSelectionId ? (
                <div className="space-y-3">
                  <PayAgencyFeeButton
                    selectionId={pendingSelectionId}
                    feeAmount={50000}
                    candidateName={worker.category || "Candidate"}
                    triggerText="Pay Agency Fee to Unlock Contact"
                    className="w-full"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                    Protected Contact Details
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    Candidate phone number and email are securely protected until an official Handshake offer is sent and the agency fee is confirmed.
                  </p>
                </div>
              )}
            </div>
          </aside>
          
        </div>
      </div>

      {/* Placement Rating Modal */}
      {placementId && (
        <SubmitRatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          targetTitle={fullName}
          targetSubtitle={`${worker.category || "Worker"} Placement Review`}
          placementId={placementId}
          existingRating={currentRating}
          onSuccess={(newRating) => {
            setCurrentRating(newRating);
          }}
        />
      )}
    </div>
  );
}

