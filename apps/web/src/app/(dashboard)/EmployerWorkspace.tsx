import { formatNaira } from "@repo/shared";
import { getCurrentUser } from "../../actions/auth";
import { getEmployerRequests } from "../../server/services/hiringRequests";
import Link from "next/link";
import {
  db,
  eq,
  and,
  or,
  sql,
  desc,
  employerProfiles,
  hiringRequests,
  selections,
  workerProfiles,
} from "@repo/db";
import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Briefcase,
} from "lucide-react";

export default async function EmployerWorkspace() {
  const session = await getCurrentUser();
  if (!session) return null;

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) return <div>Please complete your employer profile first.</div>;

  const requests = await getEmployerRequests(profile.id);
  const activeJobsCount = requests.filter((r) => r.status === "OPEN").length;

  // Real-time dynamic count for candidate pipeline / shortlists
  const [pipelineCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(selections)
    .where(eq(selections.employerProfileId, profile.id));
  const candidatePipelineCount = pipelineCountRes?.count || 0;

  // Real-time dynamic count for hired workers
  const [hiredCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(selections)
    .where(
      and(
        eq(selections.employerProfileId, profile.id),
        or(
          eq(selections.status, "CONFIRMED"),
          sql`${selections.hiredAt} IS NOT NULL`
        )
      )
    );
  const hiredWorkersCount = hiredCountRes?.count || 0;

  // Shortlisted & contacted candidates across all roles
  const shortlistedCandidates = await db
    .select({
      id: selections.id,
      workerProfileId: selections.workerProfileId,
      status: selections.status,
      termsAcceptedAt: selections.termsAcceptedAt,
      hiredAt: selections.hiredAt,
      interviewDate: selections.interviewDate,
      interviewType: selections.interviewType,
      hiringRequestTitle: hiringRequests.title,
      workerCategory: workerProfiles.category,
      workerExperience: workerProfiles.experienceYears,
      workerState: workerProfiles.locationState,
      workerArea: workerProfiles.locationArea,
    })
    .from(selections)
    .innerJoin(hiringRequests, eq(selections.hiringRequestId, hiringRequests.id))
    .innerJoin(workerProfiles, eq(selections.workerProfileId, workerProfiles.id))
    .where(eq(selections.employerProfileId, profile.id))
    .orderBy(desc(selections.interviewDate), desc(selections.hiredAt))
    .limit(5);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-space tracking-tight text-[var(--ink)]">
            Employer Overview
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-0.5">
            Manage your recruitment pipeline, active vacancies, and candidate shortlists.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Link
            href="/employer/errands/new"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/15 bg-white px-5 text-sm font-bold text-[var(--ink)] transition-all hover:bg-neutral-50 shadow-2xs"
          >
            Post an Errand
          </Link>
          <Link
            href="/employer/requests/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--ng)] px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--ng-deep)] shadow-lg shadow-[var(--ng)]/20 whitespace-nowrap"
          >
            Post a Role
          </Link>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Active Roles
            </p>
            <p className="text-3xl font-black text-[var(--ink)] font-mono">{activeJobsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--ng)] flex items-center justify-center border border-emerald-100">
            <BriefcaseBusiness size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Shortlisted Candidates
            </p>
            <p className="text-3xl font-black text-[var(--ink)] font-mono">
              {candidatePipelineCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--line)] p-6 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Hired Workers
            </p>
            <p className="text-3xl font-black text-[var(--ink)] font-mono">{hiredWorkersCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--ng)] flex items-center justify-center border border-emerald-100">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Hiring Requests Section */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--line)] p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-[var(--ng)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--ng)]/20">
            <BriefcaseBusiness size={28} className="text-[var(--ng)]" />
          </div>
          <h3 className="text-lg font-bold mb-1.5 text-[var(--ink)]">No active roles</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6 font-medium text-xs leading-relaxed">
            Post a role to generate smart matches of verified artisans and skilled workers tailored to your budget and location.
          </p>
          <Link
            href="/employer/requests/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--ng)] px-8 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--ng-deep)] shadow-lg shadow-[var(--ng)]/20"
          >
            Post a Role Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
              Your Hiring Requests
            </h2>
            <Link
              href="/employer/requests/new"
              className="text-xs font-bold text-[var(--ng)] hover:underline flex items-center gap-1"
            >
              + Create New Request
            </Link>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[var(--line)] p-6 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--ink)]">{req.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === "OPEN"
                          ? "bg-emerald-50 text-[var(--ng)] border border-emerald-500/20"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-soft)] font-medium">
                    <span className="bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                      {req.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-neutral-400" />
                      {req.locationArea}, {req.locationState}
                    </span>
                    <span className="font-semibold text-neutral-800">
                      Budget: {formatNaira(req.budgetMax)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/employer/requests/${req.id}/matches`}
                  className="shrink-0 h-10 px-5 rounded-xl bg-[var(--ink)] hover:bg-neutral-800 text-[var(--lime)] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>View Smart Matches</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Shortlist & Pipeline Section */}
      {shortlistedCandidates.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--line)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-heading text-[var(--ink)]">
                Active Candidate Pipeline
              </h2>
              <p className="text-xs text-neutral-500">
                Shortlisted candidates, interview proposals, and confirmed hires across your roles.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">
              {shortlistedCandidates.length} Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortlistedCandidates.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-2xl border border-[var(--line)] p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">{cand.workerCategory}</h4>
                      <p className="text-[11px] text-neutral-500 truncate max-w-[190px]">
                        For: {cand.hiringRequestTitle}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        cand.status === "CONFIRMED" || cand.termsAcceptedAt
                          ? "bg-emerald-50 text-[var(--ng)] border border-emerald-500/20"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {cand.status === "CONFIRMED" || cand.termsAcceptedAt
                        ? "Accepted"
                        : "Shortlisted"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} className="text-neutral-400" />
                      {cand.workerExperience}+ Yrs Exp
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-neutral-400" />
                      {cand.workerArea || cand.workerState}
                    </span>
                  </div>

                  {cand.interviewDate && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold">
                      <Calendar size={12} className="text-[var(--ng)]" />
                      <span>
                        Interview: {new Date(cand.interviewDate).toLocaleDateString()} (
                        {cand.interviewType || "Call"})
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/employer/workers/${cand.workerProfileId}`}
                  className="w-full py-2 px-3 rounded-xl border border-neutral-200 hover:border-[var(--ng)] hover:text-[var(--ng)] text-xs font-bold text-center text-neutral-700 transition-colors bg-neutral-50/50 hover:bg-white"
                >
                  View Profile &amp; Contact &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
