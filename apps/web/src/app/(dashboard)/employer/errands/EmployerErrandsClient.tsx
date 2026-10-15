"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { formatNaira } from "@repo/shared";
import { cancelOpenErrandEmployer } from "@/actions/errands";

export interface EmployerErrandListItem {
  id: string;
  title: string;
  type: string;
  status: string;
  locationState: string;
  locationArea: string;
  taskPriceKobo: number | null;
  creationFeeKobo: number | null;
  budgetKobo: number;
  deadline: string;
  createdAt: string;
  openedAt: string | null;
  claimedAt: string | null;
  proofSubmittedAt: string | null;
  completedAt: string | null;
}

interface Props {
  errands: EmployerErrandListItem[];
}

export default function EmployerErrandsClient({ errands }: Props) {
  const handleCancel = async (errandId: string) => {
    const reason = prompt("Please enter a reason for cancelling this errand:");
    if (!reason) return;
    try {
      const res = await cancelOpenErrandEmployer(errandId, reason);
      if (!res.success) {
        alert(res.error || "Failed to cancel errand");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to cancel errand");
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ng)]">
            <Package size={16} /> Alabaru Errand Management
          </div>
          <h1 className="text-3xl font-bold text-[var(--ink)] tracking-tight font-heading mt-1">
            My Posted Errands
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1">
            Track, fund, and review on-demand tasks executed by verified local runners.
          </p>
        </div>

        <Link
          href="/employer/errands/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--ng)] px-6 text-sm font-bold text-white transition-all hover:bg-[var(--ng-deep)] shadow-lg shadow-[var(--ng)]/20 gap-2 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Post an Errand
        </Link>
      </div>

      {/* Errands List */}
      {errands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/10 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--ng)]/10 text-[var(--ng)] flex items-center justify-center mx-auto">
            <Package size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--ink)]">No Errands Posted Yet</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              Need on-the-ground property inspections, queue waiting, or same-day deliveries? Dispatch a runner in minutes.
            </p>
          </div>
          <Link
            href="/employer/errands/new"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--ink)] px-6 text-xs font-bold text-white transition-all hover:bg-black shadow-xs cursor-pointer"
          >
            Post Your First Errand &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {errands.map((errand) => {
            const totalCharged = (errand.creationFeeKobo || 0) + (errand.taskPriceKobo || errand.budgetKobo);
            return (
              <div
                key={errand.id}
                className="bg-white rounded-2xl border border-black/10 p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-black/20 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--ng)] bg-[var(--ng)]/10 px-2 py-0.5 rounded-md">
                      {errand.type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                      {errand.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--ink)]">{errand.title}</h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {errand.locationArea}, {errand.locationState}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> Due: {new Date(errand.deadline).toLocaleString()}
                    </span>
                    <span className="font-mono font-semibold text-neutral-700">
                      Total: {formatNaira(totalCharged)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-auto">
                  {errand.status === "pending_payment" && (
                    <Link
                      href={`/employer/errands/${errand.id}/checkout`}
                      className="py-2 px-4 rounded-xl bg-[var(--ng)] text-white text-xs font-bold hover:opacity-95 shadow-xs"
                    >
                      Fund Errand &rarr;
                    </Link>
                  )}

                  {errand.status === "open" && (
                    <button
                      onClick={() => handleCancel(errand.id)}
                      className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer"
                    >
                      Cancel (100% Refund)
                    </button>
                  )}

                  <Link
                    href={`/employer/errands/${errand.id}`}
                    className="py-2 px-4 rounded-xl border border-black/15 text-[var(--ink)] text-xs font-bold hover:bg-neutral-50 flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
