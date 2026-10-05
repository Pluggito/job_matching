import { getMatchesForRequest } from "../../../../../../server/services/matching";
import { getHiringRequest } from "../../../../../../server/services/hiringRequests";
import { getCurrentUser } from "../../../../../../actions/auth";
import { CheckCircle2, MapPin, Briefcase, Calendar, Star, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Matches page fetches directly from server
export default async function MatchesPage({ params }: { params: { id: string } }) {
  const session = await getCurrentUser();
  if (!session) return notFound();
  
  let matches;
  let request;
  try {
    matches = await getMatchesForRequest(session.userId, params.id);
    request = await getHiringRequest(params.id);
  } catch (error) {
    return notFound();
  }

  if (!request) return notFound();

  return (
    <div className="max-w-5xl mx-auto py-8">
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
        {matches.data.map((match, idx) => (
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

              {/* Action */}
              <div className="shrink-0 flex flex-col items-stretch gap-3 w-full md:w-auto">
                <button className="h-10 px-6 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm hover:-translate-y-0.5 transition-transform shadow-lg shadow-[var(--ink)]/10">
                  Shortlist
                </button>
                <button className="h-10 px-6 rounded-xl border border-[var(--ink)] text-[var(--ink)] font-bold text-sm hover:bg-[var(--canvas)] transition-colors">
                  View Profile
                </button>
              </div>

            </div>
          </div>
        ))}

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
