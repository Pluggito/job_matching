import { formatDateTimeDDMMYYYY } from "@repo/shared";
import {
  db,
  workerProfiles,
  employerProfiles,
  placements,
  hiringRequests,
  selections,
  replacementRequests,
  auditLogs,
  platformSettings,
  sql,
  desc,
  eq,
  or,
} from "@repo/db";
import {
  Users,
  BriefcaseBusiness,
  Activity,
  ArrowRight,
  AlertCircle,
  Clock,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck,
  Sliders,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Fetch live operational statistics
  const [
    workersCountResult,
    employersCountResult,
    activePlacementsResult,
    openRequestsResult,
    pendingVerificationsResult,
    unpaidFeesResult,
    replacementsResult,
    recentAuditLogs,
    errandPriceSetting,
  ] = await Promise.all([
    db.select({ count: sql`count(*)`.mapWith(Number) }).from(workerProfiles),
    db.select({ count: sql`count(*)`.mapWith(Number) }).from(employerProfiles),
    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(placements)
      .where(sql`${placements.status} = 'ACTIVE'`),
    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(hiringRequests)
      .where(sql`${hiringRequests.status} = 'OPEN'`),
    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(workerProfiles)
      .where(
        or(
          eq(workerProfiles.verificationStatus, "pending"),
          eq(workerProfiles.verificationStatus, "under_review")
        )
      ),
    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(selections)
      .where(eq(selections.status, "PENDING")),
    db.select({ count: sql`count(*)`.mapWith(Number) }).from(replacementRequests),
    db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(6),
    db
      .select({ value: platformSettings.value })
      .from(platformSettings)
      .where(eq(platformSettings.key, "errand_commission_global"))
      .limit(1),
  ]);

  const workersCount = workersCountResult[0]?.count || 0;
  const employersCount = employersCountResult[0]?.count || 0;
  const activePlacementsCount = activePlacementsResult[0]?.count || 0;
  const openRequestsCount = openRequestsResult[0]?.count || 0;
  const pendingVerificationsCount = pendingVerificationsResult[0]?.count || 0;
  const unpaidFeesCount = unpaidFeesResult[0]?.count || 0;
  const replacementsCount = replacementsResult[0]?.count || 0;

  const commissionVal = errandPriceSetting[0]?.value as { basisPoints?: number } | undefined;
  const isErrandConfigUnset = commissionVal?.basisPoints === undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-[#152822] tracking-tight font-heading">
            Platform Operations
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Real-time overview of marketplace activity, verification triage, and contractual compliance.
          </p>
        </div>
      </div>

      {/* Errand Config Unset Alert Banner */}
      {isErrandConfigUnset && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 text-amber-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-sm">Alabaru Errand Commission Not Set</p>
              <p className="text-xs text-amber-800">
                Errand commission rate is currently not configured on the marketplace.
              </p>
            </div>
          </div>
          <Link
            href="/settings/errands"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Sliders size={14} />
            Configure Errand Settings &rarr;
          </Link>
        </div>
      )}

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">
            Total workers
          </span>
          <div className="text-3xl font-bold text-[#152822] font-heading mt-2">
            {workersCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Registered talent & professionals</p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">
            Total employers
          </span>
          <div className="text-3xl font-bold text-[#152822] font-heading mt-2">
            {employersCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Registered businesses & clients</p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">
            Active placements
          </span>
          <div className="text-3xl font-bold text-[#152822] font-heading mt-2">
            {activePlacementsCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Talent actively deployed</p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-neutral-500">
            Open requests
          </span>
          <div className="text-3xl font-bold text-[#152822] font-heading mt-2">
            {openRequestsCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Pending employer job orders</p>
        </div>
      </div>

      {/* Needs Attention Priority Strip */}
      <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Needs Attention
            </h2>
          </div>
          <span className="text-xs text-neutral-400">Operational triage queue</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/workers"
            className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/50 hover:bg-amber-50 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" />
                Pending Verifications
              </span>
              <p className="text-[11px] text-amber-700">Candidates awaiting NIN/portfolio review</p>
            </div>
            <span className="text-lg font-bold text-amber-900 px-2.5 py-0.5 rounded-lg bg-amber-100 font-heading">
              {pendingVerificationsCount}
            </span>
          </Link>

          <Link
            href="/requests"
            className="p-3.5 rounded-xl border border-blue-200/70 bg-blue-50/50 hover:bg-blue-50 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                <CreditCard size={14} className="text-blue-600" />
                Unpaid Agency Fees
              </span>
              <p className="text-[11px] text-blue-700">₦50,000 handshake fee pending</p>
            </div>
            <span className="text-lg font-bold text-blue-900 px-2.5 py-0.5 rounded-lg bg-blue-100 font-heading">
              {unpaidFeesCount}
            </span>
          </Link>

          <Link
            href="/placements"
            className="p-3.5 rounded-xl border border-purple-200/70 bg-purple-50/50 hover:bg-purple-50 transition-colors flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                <RefreshCw size={14} className="text-purple-600" />
                Replacement Requests
              </span>
              <p className="text-[11px] text-purple-700">Active 14-day SLA replacement track</p>
            </div>
            <span className="text-lg font-bold text-purple-900 px-2.5 py-0.5 rounded-lg bg-purple-100 font-heading">
              {replacementsCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Main Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Recent Activity / Audit Feed */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#152822] font-heading">
                Recent Audit Activity
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Immutable record of administrative operations and policy state changes.
              </p>
            </div>
            <Activity size={18} className="text-neutral-400" />
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-neutral-50 border border-black/5">
              <div className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-neutral-400 mb-3 shadow-xs">
                <Activity size={22} />
              </div>
              <h3 className="text-base font-semibold text-neutral-800">No activity yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mt-1">
                Audit logs will record automatically here as actions are executed.
              </p>
              <Link
                href="/workers"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#008751] hover:underline"
              >
                Review registered workers <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-100 text-neutral-600 font-mono">
                        {log.targetType}
                      </span>
                    </div>
                    <p className="text-neutral-500 text-[11px]">
                      By <span className="font-mono">{log.adminEmail}</span>
                      {log.reason && ` · "${log.reason}"`}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                    {formatDateTimeDDMMYYYY(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & System Notice */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#152822] font-heading">
                Quick Actions
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Frequent administrative operations.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Link
                href="/workers"
                className="h-10 px-4 bg-[#008751] hover:bg-[#007043] text-white font-bold text-sm rounded-xl flex items-center justify-start gap-2.5 transition-colors shadow-xs"
              >
                <Users size={16} /> Review Pending Workers
              </Link>
              <Link
                href="/placements"
                className="h-10 px-4 bg-white hover:bg-neutral-50 border border-black/15 text-neutral-800 font-medium text-sm rounded-xl flex items-center justify-start gap-2.5 transition-colors shadow-xs"
              >
                <BriefcaseBusiness size={16} className="text-neutral-500" /> View Placement Issues
              </Link>
              <Link
                href="/requests"
                className="h-10 px-4 bg-white hover:bg-neutral-50 border border-black/15 text-neutral-800 font-medium text-sm rounded-xl flex items-center justify-start gap-2.5 transition-colors shadow-xs"
              >
                <CreditCard size={16} className="text-neutral-500" /> Manage Hire Requests & Fees
              </Link>
            </div>
          </div>

          {/* Admin Alert Callout */}
          <div className="mt-6 flex items-start gap-3 p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/60 text-neutral-800">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-neutral-900">Admin Operational Alert</p>
              <p className="text-neutral-600 mt-0.5 leading-relaxed">
                Ensure all NIN verifications and fee confirmations are completed before granting direct employer access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
