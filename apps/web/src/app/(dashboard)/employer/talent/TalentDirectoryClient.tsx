"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { JOB_CATEGORIES } from "@repo/shared";

export interface WorkerCardData {
  id: string;
  category: string;
  fullName: string;
  avatar?: string | null;
  experienceYears: number;
  locationState: string;
  locationArea: string;
  expectedPay: number;
  availabilityStatus: string;
  ninVerified: boolean;
  skills: string[];
  rating?: number | null;
  reviewCount?: number;
}

interface Props {
  initialWorkers: WorkerCardData[];
}

export default function TalentDirectoryClient({ initialWorkers }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"EXPERIENCE" | "PAY_LOW" | "PAY_HIGH">("EXPERIENCE");

  // Extract unique states for dropdown
  const states = useMemo(() => {
    const set = new Set<string>();
    initialWorkers.forEach((w) => {
      if (w.locationState) set.add(w.locationState);
    });
    return Array.from(set).sort();
  }, [initialWorkers]);

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return initialWorkers
      .filter((worker) => {
        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchCategory = worker.category.toLowerCase().includes(q);
          const matchName = worker.fullName.toLowerCase().includes(q);
          const matchLocation =
            worker.locationArea.toLowerCase().includes(q) ||
            worker.locationState.toLowerCase().includes(q);
          const matchSkills = worker.skills.some((s) => s.toLowerCase().includes(q));
          if (!matchCategory && !matchName && !matchLocation && !matchSkills) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "ALL" && worker.category !== selectedCategory) {
          return false;
        }

        // State filter
        if (selectedState !== "ALL" && worker.locationState !== selectedState) {
          return false;
        }

        // Verified only
        if (verifiedOnly && !worker.ninVerified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "EXPERIENCE") {
          return b.experienceYears - a.experienceYears;
        }
        if (sortBy === "PAY_LOW") {
          return a.expectedPay - b.expectedPay;
        }
        if (sortBy === "PAY_HIGH") {
          return b.expectedPay - a.expectedPay;
        }
        return 0;
      });
  }, [initialWorkers, searchTerm, selectedCategory, selectedState, verifiedOnly, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedState !== "ALL" ||
    verifiedOnly;

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedState("ALL");
    setVerifiedOnly(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-500/20 text-xs font-bold text-[var(--ng)] mb-2">
            <Sparkles size={13} />
            <span>Staff Guru Artisan &amp; Talent Directory</span>
          </div>
          <h1 className="text-3xl font-bold font-space tracking-tight text-[var(--ink)]">
            Find Verified Talent
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-0.5">
            Browse pre-vetted artisans, technicians, and skilled professionals across Nigeria.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/employer/requests/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--ng)] px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--ng-deep)] shadow-lg shadow-[var(--ng)]/20 whitespace-nowrap"
          >
            Post a Role to Auto-Match
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[var(--line)] p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by trade, skill (e.g. Tailor, Wiring, OBD-II)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs font-medium focus:bg-white focus:outline-none focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs font-medium focus:bg-white focus:outline-none focus:border-[var(--ng)]"
            >
              <option value="ALL">All Categories</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs font-medium focus:bg-white focus:outline-none focus:border-[var(--ng)]"
            >
              <option value="ALL">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs font-medium focus:bg-white focus:outline-none focus:border-[var(--ng)]"
            >
              <option value="EXPERIENCE">Most Experienced</option>
              <option value="PAY_LOW">Pay: Low to High</option>
              <option value="PAY_HIGH">Pay: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer font-bold ${
                verifiedOnly
                  ? "bg-emerald-50 text-[var(--ng)] border-[var(--ng)]"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <ShieldCheck size={14} />
              <span>NIN Verified Only</span>
            </button>

            {/* Popular category quick pills */}
            {["Tailor", "Electrician", "Plumber", "Auto Mechanic"].map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? "ALL" : cat)
                }
                className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                  selectedCategory === cat
                    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-neutral-500 font-medium">
            <span>
              Showing <strong className="text-neutral-900">{filteredWorkers.length}</strong> verified artisans
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[var(--ng)] hover:underline font-bold flex items-center gap-0.5 ml-2 cursor-pointer"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[var(--line)] p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Search size={28} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">No matching artisans found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
            Try adjusting your search keywords, clearing your filters, or broadening your state criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[var(--ng)] text-white font-bold text-xs shadow-xs hover:bg-[#007344] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map((worker) => {
            const initials =
              worker.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "SG";

            return (
              <div
                key={worker.id}
                className="bg-white rounded-3xl border border-[var(--line)] p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group"
              >
                <div className="space-y-4">
                  {/* Top Row: Avatar & Badges */}
                  <div className="flex items-center justify-between gap-3 min-h-[48px]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {worker.avatar ? (
                        <img
                          src={worker.avatar}
                          alt={worker.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border border-black/10 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[var(--ng)] font-bold text-base flex items-center justify-center border border-emerald-100 shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-neutral-900 truncate" title={worker.category}>
                          {worker.category}
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium truncate">
                          {worker.fullName}
                        </p>
                      </div>
                    </div>

                    {worker.ninVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[var(--ng)] border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider shrink-0">
                        <CheckCircle2 size={11} strokeWidth={3} /> Verified
                      </span>
                    )}
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50/70 p-3 rounded-2xl border border-neutral-100">
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={13} className="text-neutral-400 shrink-0" />
                      <span className="font-semibold text-neutral-800">
                        {worker.experienceYears}+ Yrs Exp
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-neutral-400 shrink-0" />
                      <span className="truncate">{worker.locationArea || worker.locationState}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-neutral-400 shrink-0" />
                      <span className="truncate text-emerald-800 font-medium">
                        {worker.availabilityStatus.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-bold text-neutral-800">
                        {worker.rating ? `${worker.rating.toFixed(1)}/5` : "5.0/5"}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Top Verified Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5 min-h-[52px] max-h-[52px] overflow-hidden content-start">
                      {worker.skills.slice(0, 3).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-white border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md text-[11px] font-medium truncate max-w-[170px]"
                          title={skill}
                        >
                          {skill}
                        </span>
                      ))}
                      {worker.skills.length > 3 && (
                        <span className="text-[10px] text-neutral-400 font-medium self-center">
                          +{worker.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Expected Pay & View Profile */}
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                      Expected Pay
                    </span>
                    <span className="text-sm font-bold text-neutral-900 font-mono">
                      ₦{Number(worker.expectedPay).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-400"> /mo</span>
                  </div>

                  <Link
                    href={`/employer/workers/${worker.id}`}
                    className="h-9 px-4 rounded-xl bg-[var(--ink)] hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs group-hover:bg-[var(--ng)] shrink-0"
                  >
                    <span>View Profile</span>
                    <ArrowRight size={13} />
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
