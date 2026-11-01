import { Search, Filter, Download, MoreVertical, MapPin, Star, ShieldCheck, Calendar } from "lucide-react";
import { db, selections, hiringRequests, workerProfiles, employerProfiles, users, eq, and } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import { formatDateDDMMYYYY } from "@repo/shared";

export default async function EmployedWorkersPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") return null;

  const [employerProfile] = await db
    .select({ id: employerProfiles.id })
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!employerProfile) return null;

  const hiredWorkers = await db
    .select({
      id: selections.id,
      feeAmount: selections.feeAmount,
      termsAcceptedAt: selections.termsAcceptedAt,
      jobTitle: hiringRequests.title,
      locationState: hiringRequests.locationState,
      locationArea: hiringRequests.locationArea,
      workerCategory: workerProfiles.category,
      workerName: users.email, // using email as placeholder for name
      ninVerificationStatus: workerProfiles.ninVerificationStatus,
    })
    .from(selections)
    .innerJoin(hiringRequests, eq(selections.hiringRequestId, hiringRequests.id))
    .innerJoin(workerProfiles, eq(selections.workerProfileId, workerProfiles.id))
    .innerJoin(users, eq(workerProfiles.userId, users.id))
    .where(
      and(
        eq(selections.employerProfileId, employerProfile.id),
        eq(selections.status, "CONFIRMED")
      )
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Employed Workers</h1>
          <p className="text-[var(--ink-soft)] mt-1">Manage your active workforce and their details.</p>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--ng)] px-6 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--ng-deep)] shadow-lg shadow-[var(--ng)]/20">
          <Download size={18} />
          Export List
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[var(--line)]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search workers by name or role..." 
            className="w-full pl-10 pr-4 py-2 bg-[var(--canvas)] border border-[var(--line)] rounded-lg focus:outline-none focus:border-[var(--green)] transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--line)] rounded-lg font-medium text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors">
          <Filter size={16} />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--canvas)]/50 border-b border-[var(--line)] text-[var(--ink-soft)] text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Worker Details</th>
                <th className="p-4 font-semibold">Role & Location</th>
                <th className="p-4 font-semibold">Status & Pay</th>
                <th className="p-4 font-semibold">Start Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {hiredWorkers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--ink-soft)]">
                    You haven't hired any workers yet. Send an offer from the matchmaking tab!
                  </td>
                </tr>
              )}
              {hiredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--green)]/10 text-[var(--green)] flex items-center justify-center font-bold text-lg border border-[var(--green)]/20 uppercase">
                        {worker.workerName.substring(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                          {worker.workerName.split('@')[0]}
                          {worker.ninVerificationStatus === 'VERIFIED' && <ShieldCheck size={14} className="text-green-600" />}
                        </div>
                        <div className="text-sm text-[var(--ink-soft)] flex items-center gap-1 mt-0.5">
                          <Star size={12} className="text-[var(--orange)] fill-[var(--orange)]" />
                          5.0
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[var(--ink)]">{worker.jobTitle}</div>
                    <div className="text-sm text-[var(--ink-soft)] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {worker.locationArea}, {worker.locationState}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="mb-1">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                        Active
                      </span>
                    </div>
                    <div className="text-sm font-medium text-[var(--ink)]">₦{worker.feeAmount.toLocaleString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[var(--ink)] text-sm flex items-center gap-2">
                      <Calendar size={14} className="text-[var(--ink-soft)]" />
                      {worker.termsAcceptedAt ? formatDateDDMMYYYY(worker.termsAcceptedAt) : 'N/A'}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
