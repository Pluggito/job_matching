"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  loginAdminAction,
  registerAdminAction,
  RegistrationStatus,
} from "@/lib/auth-actions";
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface AdminAuthClientProps {
  initialStatus: RegistrationStatus;
}

export default function AdminAuthClient({ initialStatus }: AdminAuthClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", loginEmail);
      formData.append("password", loginPassword);

      const res = await loginAdminAction(null, formData);
      if (!res.success) {
        setError(res.error || "Invalid admin credentials.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Authentication verified. Loading Admin Console...");
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", regFullName);
      formData.append("email", regEmail);
      formData.append("password", regPassword);
      formData.append("confirmPassword", regConfirmPassword);
      if (inviteCode) {
        formData.append("inviteCode", inviteCode);
      }

      const res = await registerAdminAction(null, formData);
      if (!res.success) {
        setError(res.error || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccessMsg(res.message || "Account successfully created! Initializing console...");
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 700);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[var(--ink)] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[var(--ng)] selection:text-white">
      {/* Soft Ambient Radiance */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-emerald-500/8 blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-10 right-1/4 w-[350px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
            <span className="relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image
                src="/logo 4.png"
                alt="Staff Guru logo"
                width={32}
                height={32}
                priority
                className="w-full h-full object-contain"
              />
            </span>
            <div className="font-heading text-lg font-bold tracking-tight text-[var(--ink)] flex items-center">
              staff<span className="text-[var(--ng)]">guru</span>
              <span className="text-[var(--orange)]">.</span>
              <span className="ml-2 text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-[var(--ng)] font-bold border border-emerald-500/20">
                ADMIN CONSOLE
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] [font-family:var(--font-heading)]">
            Administrative Access
          </h1>
          <p className="text-sm text-[var(--ink)]/60 max-w-sm mx-auto">
            Authorized portal for platform operations, financial settlements, and verification triage.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/[0.03] space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-[#f4f7f5] border border-black/[0.05] rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === "signin"
                  ? "bg-white text-[var(--ink)] shadow-sm border border-black/[0.04]"
                  : "text-[var(--ink)]/60 hover:text-[var(--ink)]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all relative ${
                mode === "register"
                  ? "bg-white text-[var(--ink)] shadow-sm border border-black/[0.04]"
                  : "text-[var(--ink)]/60 hover:text-[var(--ink)]"
              }`}
            >
              <span>Create Account</span>
              {initialStatus.isOpenSuperAdminSlot && (
                <span className="absolute -top-1.5 -right-1 px-2 py-0.5 bg-amber-500 text-white text-[9.5px] font-black uppercase rounded-full tracking-wider shadow-sm animate-pulse">
                  {initialStatus.remainingSuperAdminSlots} Slot{initialStatus.remainingSuperAdminSlots > 1 ? "s" : ""}
                </span>
              )}
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 size={18} className="shrink-0 text-[var(--ng)] mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <Mail size={14} className="text-[var(--ng)]" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@staffguru.com"
                  className="w-full h-11 px-4 rounded-xl bg-[#fcfdfd] border border-black/[0.1] text-[var(--ink)] text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <Lock size={14} className="text-[var(--ng)]" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 px-4 pr-11 rounded-xl bg-[#fcfdfd] border border-black/[0.1] text-[var(--ink)] text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-xl bg-[var(--ng)] hover:bg-[#007545] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[var(--ng)]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Console <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER / JOIN TEAM */}
          {mode === "register" && (
            <div className="space-y-5">
              
              {/* Slot / Invite Status Banner */}
              {initialStatus.isOpenSuperAdminSlot ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2.5 text-amber-950">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={15} className="text-amber-600" />
                    Super Admin Early Access Active
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed font-normal">
                    The first 3 accounts receive permanent <strong>Super Administrator</strong> rights without an invite code.
                    You are claiming <strong>Slot #{initialStatus.nextSlotNumber} of 3</strong>.
                  </p>
                  
                  {/* Slots Visual Indicator */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[1, 2, 3].map((slot) => {
                      const claimed = initialStatus.claimedSlots.find((s) => s.slotNumber === slot);
                      const isCurrent = slot === initialStatus.nextSlotNumber;
                      return (
                        <div
                          key={slot}
                          className={`p-2 rounded-xl text-center border text-[11px] font-medium transition-all ${
                            claimed
                              ? "bg-black/[0.03] border-black/10 text-black/40"
                              : isCurrent
                              ? "bg-white border-2 border-amber-500 shadow-sm text-amber-900 font-bold"
                              : "bg-amber-100/40 border border-dashed border-amber-300 text-amber-700"
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-wider font-bold">
                            Slot {slot}
                          </div>
                          <div className="truncate mt-0.5 text-[10px]">
                            {claimed ? "Claimed" : isCurrent ? "★ Your Slot" : "Open"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2 text-blue-950">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert size={15} className="text-blue-600" />
                    Invite-Only Administrative Registration
                  </div>
                  <p className="text-xs text-blue-900/70 leading-relaxed font-normal">
                    All 3 founding Super Admin seats have been claimed. To create an account, please enter an authorized invite code generated by a Super Admin.
                  </p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <User size={14} className="text-[var(--ng)]" /> Full Official Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Babatunde Fashola"
                    className="w-full h-11 px-4 rounded-xl bg-[#fcfdfd] border border-black/[0.1] text-[var(--ink)] text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Mail size={14} className="text-[var(--ng)]" /> Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="admin@staffguru.com"
                    className="w-full h-11 px-4 rounded-xl bg-[#fcfdfd] border border-black/[0.1] text-[var(--ink)] text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Lock size={14} className="text-[var(--ng)]" /> Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 chars"
                        className="w-full h-11 px-3 pr-9 rounded-xl bg-[#fcfdfd] border border-black/[0.1] text-[var(--ink)] text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Lock size={14} className="text-[var(--ng)]" /> Confirm
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter"
                        className="w-full h-11 px-3 pr-9 rounded-xl bg-[#fcfdfd] border border-black/[0.1] text-[var(--ink)] text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-[var(--ng)] focus:ring-2 focus:ring-[var(--ng)]/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Invite Code Input (Required if slots >= 3, optional otherwise) */}
                {!initialStatus.isOpenSuperAdminSlot ? (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-800">
                        <KeyRound size={14} className="text-blue-600" /> Invite Access Code *
                      </span>
                      <span className="text-[11px] text-[var(--ink)]/40 font-mono">Required</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SG-INV-8F32-4910"
                      className="w-full h-11 px-4 rounded-xl bg-[#fcfdfd] border border-blue-300 font-mono tracking-wider uppercase text-blue-900 text-sm placeholder:text-black/35 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="text-[11px] text-[var(--ink)]/50 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-[var(--ng)]" />
                      No invite code needed — automatically enrolling into Super Admin Slot #{initialStatus.nextSlotNumber}.
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 mt-2 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ${
                    initialStatus.isOpenSuperAdminSlot
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                      : "bg-[var(--ng)] hover:bg-[#007545] shadow-[var(--ng)]/20"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enrolling Administrator...
                    </>
                  ) : initialStatus.isOpenSuperAdminSlot ? (
                    <>
                      <Sparkles size={16} /> Claim Super Admin Slot #{initialStatus.nextSlotNumber}
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Redeem Invite & Create Account
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between text-[11.5px] text-[var(--ink)]/50">
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-[var(--ng)]" /> AES-256 HMAC Encrypted
            </span>
            <span className="font-mono text-[var(--ink)]/50">Staff Guru v1.0 Admin</span>
          </div>
        </div>

      </div>
    </div>
  );
}
