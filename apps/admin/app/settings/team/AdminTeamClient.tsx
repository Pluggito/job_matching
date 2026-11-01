"use client";

import { useState } from "react";
import { formatDateDDMMYYYY } from "@repo/shared";
import {
  generateAdminInviteAction,
  revokeAdminInviteAction,
} from "@/lib/auth-actions";
import {
  ShieldCheck,
  Shield,
  Sparkles,
  Users,
  KeyRound,
  Copy,
  Check,
  Plus,
  Trash2,
  Calendar,
  Mail,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface AdminMember {
  id: string;
  email: string;
  fullName: string;
  adminRole: string;
  slotNumber: number | null;
  createdAt: string;
}

interface AdminInvite {
  id: string;
  code: string;
  email: string | null;
  role: string;
  isUsed: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

interface AdminTeamClientProps {
  initialData: {
    currentAdmin: {
      id: string;
      email: string;
      fullName: string;
      adminRole: string;
    } | null;
    members: AdminMember[];
    invites: AdminInvite[];
  };
}

export default function AdminTeamClient({ initialData }: AdminTeamClientProps) {
  const [members, setMembers] = useState(initialData.members);
  const [invites, setInvites] = useState(initialData.invites);
  const currentAdmin = initialData.currentAdmin;
  const isSuperAdmin = currentAdmin?.adminRole === "SUPER_ADMIN";

  // Invite Generator state
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [targetRole, setTargetRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalAdmins = members.length;
  const superAdminSlotsClaimed = Math.min(3, totalAdmins);
  const superAdminSlotsRemaining = Math.max(0, 3 - totalAdmins);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const res = await generateAdminInviteAction({
        role: targetRole,
        email: targetEmail || undefined,
      });

      if (!res.success || !res.invite) {
        setError(res.error || "Failed to generate invite code.");
        setIsGenerating(false);
        return;
      }

      setGeneratedCode(res.invite.code);
      setInvites((prev) => [
        {
          id: res.invite!.id,
          code: res.invite!.code,
          email: res.invite!.email || null,
          role: res.invite!.role,
          isUsed: false,
          usedAt: null,
          expiresAt: res.invite!.expiresAt,
          createdAt: new Date().toISOString(),
          isExpired: false,
        },
        ...prev,
      ]);
      setTargetEmail("");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to revoke this invite code?")) return;

    try {
      const res = await revokeAdminInviteAction(inviteId);
      if (res.success) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      } else {
        alert(res.error || "Failed to revoke invite.");
      }
    } catch (err) {
      alert("Error revoking invite.");
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Admin Team & Access Management
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Governs the 3 founding Super Admin seats and issue cryptographic invite codes for staff onboarding.
          </p>
        </div>

        {/* Current user role badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/10 shadow-sm self-start sm:self-auto">
          <ShieldCheck size={16} className="text-[var(--ng)]" />
          <span className="text-xs font-bold text-black">Your Status:</span>
          <span
            className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
              isSuperAdmin
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {currentAdmin?.adminRole ? currentAdmin.adminRole.replace("_", " ") : "ADMIN"}
          </span>
        </div>
      </div>

      {/* 3 Super Admin Founding Seats Banner */}
      <div className="bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/60 rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-900 border border-amber-300">
              <Sparkles size={14} className="text-amber-600" />
              Founding Governance Rule
            </div>
            <h2 className="text-lg font-bold text-black mt-2">
              Super Administrator Quota (First 3 Accounts)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-xl">
              Per platform architecture, the first 3 registered admin accounts are automatically granted full <strong>Super Administrator</strong> authority. All subsequent administrators strictly require an authorized invite code.
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-amber-200/80 sm:pl-6 shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-amber-900">
              {superAdminSlotsClaimed} / 3
            </div>
            <div className="text-xs font-semibold text-amber-700">
              {superAdminSlotsRemaining > 0
                ? `${superAdminSlotsRemaining} Slot${superAdminSlotsRemaining > 1 ? "s" : ""} Available`
                : "All Super Admin Slots Claimed"}
            </div>
          </div>
        </div>

        {/* 3 Slots Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((slot) => {
            const member = members.find((m) => m.slotNumber === slot || (slot === 1 && m.email === "admin@staffguru.com"));
            const isClaimed = Boolean(member);

            return (
              <div
                key={slot}
                className={`p-5 rounded-2xl border transition-all ${
                  isClaimed
                    ? "bg-white border-amber-300/80 shadow-sm"
                    : "bg-white/40 border-dashed border-amber-300/50 text-neutral-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Slot #{slot}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isClaimed
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isClaimed ? "Claimed" : "Open for Registration"}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="font-bold text-sm text-black truncate">
                    {member ? member.fullName : "Open Seat"}
                  </div>
                  <div className="text-xs text-neutral-500 truncate mt-0.5">
                    {member ? member.email : "Register via /login without invite code"}
                  </div>
                </div>

                {member && (
                  <div className="mt-3 pt-3 border-t border-black/5 flex items-center gap-1.5 text-[10px] text-neutral-500">
                    <Calendar size={12} /> Claimed on {formatDateDDMMYYYY(member.createdAt)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Invite Generator (Super Admins) & Active Invites */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Invite Generator */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-black/10 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <KeyRound className="text-[var(--ng)]" size={20} />
            <h3 className="font-bold text-base text-black">Generate Access Invite</h3>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Create an authorization code for new administrators. Codes automatically expire after 7 days and can be redeemed once.
          </p>

          {isSuperAdmin ? (
            <form onSubmit={handleGenerateInvite} className="space-y-4 pt-2">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white text-black text-xs font-medium focus:outline-none focus:border-[var(--ng)]"
                >
                  <option value="ADMIN">Standard Administrator</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">
                  Restricted Email (Optional)
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="e.g. colleague@staffguru.com"
                  className="w-full h-10 px-3 rounded-xl border border-black/15 bg-white text-black text-xs placeholder:text-neutral-400 focus:outline-none focus:border-[var(--ng)]"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Leave blank to allow any valid admin email.
                </span>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full h-11 rounded-xl bg-[var(--ng)] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Generate Invite Code
                  </>
                )}
              </button>

              {/* Newly generated code highlight */}
              {generatedCode && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-700" /> Active Invite Code
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedCode)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-950 font-bold flex items-center gap-1"
                    >
                      {copiedCode === generatedCode ? <Check size={12} /> : <Copy size={12} />}
                      {copiedCode === generatedCode ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono text-base font-black text-emerald-900 tracking-wider select-all">
                    {generatedCode}
                  </div>
                  <div className="text-[10px] text-emerald-700 leading-tight">
                    Share this code with the invitee to redeem on the Admin Login page under <strong>"Create Account"</strong>.
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs">
              Only Super Administrators are authorized to generate team invites.
            </div>
          )}
        </div>

        {/* Right: Active & Historical Invites List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-black/10 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-black flex items-center gap-2">
              <KeyRound size={18} className="text-neutral-500" /> Invite Access Codes ({invites.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Invite Code</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Expires</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-black select-all">
                      {inv.code}
                      {inv.email && (
                        <span className="block text-[10px] text-neutral-500 font-sans font-normal truncate max-w-[150px]">
                          Target: {inv.email}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-bold text-[10px] uppercase">
                        {inv.role}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {inv.isUsed ? (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-bold text-[10px]">
                          Redeemed
                        </span>
                      ) : inv.isExpired ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-neutral-500 text-[11px]">
                      {formatDateDDMMYYYY(inv.expiresAt)}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {!inv.isUsed && !inv.isExpired && (
                        <button
                          onClick={() => handleCopy(inv.code)}
                          title="Copy Code"
                          className="p-1.5 rounded-lg border border-black/10 hover:bg-neutral-100 text-neutral-700 transition-colors"
                        >
                          {copiedCode === inv.code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      )}
                      {isSuperAdmin && !inv.isUsed && (
                        <button
                          onClick={() => handleRevokeInvite(inv.id)}
                          title="Revoke Invite"
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {invites.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      No invite codes have been generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Admin Team Members Table */}
      <div className="bg-white rounded-3xl border border-black/10 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-black flex items-center gap-2">
              <Users size={20} className="text-[var(--ng)]" /> Active Admin Team Members ({members.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Administrators with active access to the Staff Guru Operations Console.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/10 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Admin</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Authority Level</th>
                <th className="pb-3">Seat Type</th>
                <th className="pb-3 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {members.map((member) => {
                const isMemberSuperAdmin = member.adminRole === "SUPER_ADMIN";
                const initials = member.fullName.slice(0, 2).toUpperCase();

                return (
                  <tr key={member.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--ng)] text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                          {initials}
                        </div>
                        <div className="font-bold text-black text-sm">
                          {member.fullName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-neutral-600 font-mono text-[11px]">
                      {member.email}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isMemberSuperAdmin
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}
                      >
                        {isMemberSuperAdmin && <Sparkles size={11} className="inline mr-1 -mt-0.5" />}
                        {member.adminRole ? member.adminRole.replace("_", " ") : "ADMIN"}
                      </span>
                    </td>
                    <td className="py-4 text-neutral-600 text-xs">
                      {member.slotNumber ? (
                        <span className="font-semibold text-amber-900">
                          Founding Super Admin (Slot #{member.slotNumber})
                        </span>
                      ) : (
                        <span className="text-neutral-500">Invite-Enrolled Staff</span>
                      )}
                    </td>
                    <td className="py-4 text-right text-neutral-500 text-[11px]">
                      {formatDateDDMMYYYY(member.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
