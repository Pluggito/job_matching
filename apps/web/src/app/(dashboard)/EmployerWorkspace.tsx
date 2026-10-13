import { JOB_CATEGORIES } from "@repo/shared";
import { getCurrentUser } from "../../actions/auth";
import { getEmployerRequests } from "../../server/services/hiringRequests";
import Link from "next/link";
import { db, eq, employerProfiles } from "@repo/db";
import { BriefcaseBusiness } from "lucide-react";

export default async function EmployerWorkspace() {
  const session = await getCurrentUser();
  if (!session) return null; // Should be handled by layout/middleware

  const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, session.userId)).limit(1);
  if (!profile) return <div>Please complete your employer profile first.</div>;

  const requests = await getEmployerRequests(profile.id);
  const activeJobsCount = requests.filter(r => r.status === "OPEN").length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-space tracking-tight text-[var(--ink)]">Employer Overview</h1>
          <p className="text-muted-foreground font-medium">Manage your vacancies and review curated shortlists.</p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <Link
            href="/employer/errands/new"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/15 bg-white px-5 text-sm font-bold text-[var(--ink)] transition-all hover:bg-neutral-50 shadow-xs"
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
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[var(--line)] p-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Active Roles</p>
          <p className="text-3xl font-black">{activeJobsCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--line)] p-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Curated Matches</p>
          <p className="text-3xl font-black">0</p>
        </div>
        <div className="bg-white rounded-xl border border-[var(--line)] p-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Hired Workers</p>
          <p className="text-3xl font-black">0</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white/50 rounded-2xl border border-[var(--line)] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--ng)]/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-[var(--ng)]/20">
            <BriefcaseBusiness size={28} className="text-[var(--ng)]" />
          </div>
          <h3 className="text-lg font-bold mb-2 text-[var(--ink)]">No active roles</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
            Post a new role to instantly generate a curated shortlist of verified workers perfectly matched to your needs.
          </p>
          <Link href="/employer/requests/new" className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--ng)] px-8 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--ng-deep)] shadow-lg shadow-[var(--ng)]/20">
            Post a Role or Errand
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Your Hiring Requests</h2>
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-[var(--line)] p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <h3 className="text-lg font-bold text-[var(--ink)]">{req.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)] mt-2">
                  <span className="bg-[var(--canvas)] px-2 py-1 rounded text-xs font-semibold">{req.category}</span>
                  <span>{req.locationArea}, {req.locationState}</span>
                  <span>Max Budget: {req.budgetMax.toLocaleString()}?</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${req.status === 'OPEN' ? 'bg-[var(--lime)] text-[var(--green)]' : 'bg-gray-200 text-gray-700'}`}>
                    {req.status}
                  </span>
                </div>
              </div>
              
              <Link 
                href={`/employer/requests/${req.id}/matches`}
                className="shrink-0 h-10 px-6 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm hover:-translate-y-0.5 transition-transform shadow-lg flex items-center justify-center"
              >
                View Smart Matches
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
