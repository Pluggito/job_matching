"use client";

import * as React from "react";
import {
  Building2,
  Mail,
  MapPin,
  Briefcase,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatDateDDMMYYYY } from "@repo/shared";

export interface EmployerDirectoryItem {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  email: string;
  location: string;
  hiringNeeds: string;
  totalRequests: number;
  activePlacements: number;
  createdAt: string;
}

interface EmployersViewProps {
  employers: EmployerDirectoryItem[];
}

export default function EmployersView({ employers }: EmployersViewProps) {
  const [data] = React.useState<EmployerDirectoryItem[]>(employers);
  const [search, setSearch] = React.useState("");
  const [selectedEmployer, setSelectedEmployer] = React.useState<EmployerDirectoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (e) =>
        e.businessName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleOpenEmployer = (emp: EmployerDirectoryItem) => {
    setSelectedEmployer(emp);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 font-heading">
          Employers Directory
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Registered business organizations and individual employers hiring verified talent on Staff Guru.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employers by business name, email, location..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008751]/20 focus:border-[#008751]"
          />
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50/75 border-b border-black/10 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Business / Employer</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Requests</th>
                <th className="px-6 py-3.5">Placements</th>
                <th className="px-6 py-3.5">Registered</th>
                <th className="px-6 py-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    No employers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-neutral-50/60 transition-colors cursor-pointer group"
                    onClick={() => handleOpenEmployer(emp)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#008751]/10 text-[#008751] font-bold flex items-center justify-center shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 group-hover:text-[#008751] transition-colors">
                            {emp.businessName}
                          </p>
                          <p className="text-xs text-neutral-500 font-mono">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-neutral-600">
                      <span className="flex items-center gap-1.5 text-xs">
                        <MapPin size={13} className="text-neutral-400" />
                        {emp.location || "Lagos, Nigeria"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
                        {emp.totalRequests} Requests
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {emp.activePlacements} Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-neutral-500 font-mono">
                      {formatDateDDMMYYYY(emp.createdAt)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#008751] hover:text-[#008751] hover:bg-[#008751]/10 text-xs font-semibold gap-1"
                      >
                        Inspect
                        <ChevronRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full p-0 flex flex-col h-full bg-white">
          {selectedEmployer && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-black/10 bg-neutral-50/75 shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-700 uppercase tracking-wider mb-2 inline-block">
                  {selectedEmployer.businessType}
                </span>
                <h2 className="text-xl font-bold text-neutral-900 font-heading">
                  {selectedEmployer.businessName}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  {selectedEmployer.email}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-black/5">
                    <p className="text-xs text-neutral-500">Total Hiring Requests</p>
                    <p className="text-xl font-bold text-neutral-900 font-heading mt-0.5">
                      {selectedEmployer.totalRequests}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                    <p className="text-xs text-emerald-800">Active Placements</p>
                    <p className="text-xl font-bold text-emerald-900 font-heading mt-0.5">
                      {selectedEmployer.activePlacements}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Location & Headquarters
                  </span>
                  <p className="text-sm text-neutral-800 p-3 rounded-xl bg-neutral-50 border border-black/5">
                    {selectedEmployer.location || "Not specified"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Hiring Needs Description
                  </span>
                  <p className="text-sm text-neutral-700 leading-relaxed p-3 rounded-xl bg-neutral-50 border border-black/5">
                    {selectedEmployer.hiringNeeds || "No specific requirements outlined."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
