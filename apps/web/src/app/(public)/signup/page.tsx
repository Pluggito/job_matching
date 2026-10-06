"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, User, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { signup } from "../../../actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button 
        type="submit" 
        disabled={pending}
        className="w-full h-14 mt-2 flex items-center justify-center gap-2 rounded-xl bg-black text-white font-bold text-sm transition-transform hover:-translate-y-0.5 hover:bg-[var(--ng)] shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        {pending ? "Creating Account..." : "Create Account"}
        {!pending && <ArrowRight size={16} />}
      </button>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-[var(--ng)]" />
            <p className="text-black font-bold font-sans">Creating your account...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function SignupPage() {
  const [role, setRole] = useState<"worker" | "employer">("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState(signup, null);

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* LEFT SIDE - BRAND/HERO */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[var(--night)] text-white p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="lp-glow absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[var(--ng)]/20 pointer-events-none"></div>
        <div className="lp-glow absolute bottom-[20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[var(--ng-bright)]/10 pointer-events-none"></div>
        <div className="lp-grain"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl tracking-tight">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--ng)] text-white font-bold text-base tracking-tighter shadow-lg shadow-[var(--ng)]/20">sg</span>
            staff<span className="text-[var(--ng-bright)]">guru</span><i className="text-[var(--ng-bright)] not-italic">.</i>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
            Join the workforce OS for Nigeria.
          </h1>
          <p className="mt-6 text-white/60 text-lg leading-relaxed">
            Create an account to hire verified talent or find skilled work opportunities close to home.
          </p>
          
          <div className="mt-12 p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="text-[var(--ng-bright)] w-6 h-6" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-snug">
                  "I wish I had known about this platform earlier. Staff Guru saved me time, money and stress."
                </p>
                <div className="mt-4">
                  <p className="font-bold text-white text-xs tracking-wide">Hope Ekwere Philip</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">CEO, Productive Pigeon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-white/40 border-t border-white/10 pt-6">
          <p>© 2026 Staff Guru.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden flex justify-center sm:justify-start">
            <Link href="/" className="flex items-center gap-2 text-black font-bold text-2xl tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ng)] text-white font-bold text-sm tracking-tighter">sg</span>
              staff<span className="text-[var(--ng-bright)]">guru</span><i className="text-[var(--ng-bright)] not-italic">.</i>
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-black tracking-tight">Create your account</h2>
            <p className="mt-2 text-black/60 text-sm">Join thousands of professionals already on Staff Guru.</p>
          </div>

          <form className="space-y-6" action={formAction}>
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {state.error}
              </div>
            )}
            
            <input type="hidden" name="role" value={role.toUpperCase()} />

            {/* ROLE SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">How do you want to use Staff Guru?</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole("worker")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "worker" ? "border-[var(--ng)] bg-[var(--ng)]/5 text-black shadow-sm" : "border-black/10 bg-[#f4f7f5] text-black/40 hover:border-black/30"}`}
                >
                  <User size={24} className={role === "worker" ? "text-[var(--ng)] mb-2" : "mb-2"} />
                  <span className="text-sm font-bold">Find work</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "employer" ? "border-[var(--ng)] bg-[var(--ng)]/5 text-black shadow-sm" : "border-black/10 bg-[#f4f7f5] text-black/40 hover:border-black/30"}`}
                >
                  <BriefcaseBusiness size={24} className={role === "employer" ? "text-[var(--ng)] mb-2" : "mb-2"} />
                  <span className="text-sm font-bold">Hire talent</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">First name</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-12 px-4 rounded-xl border border-black/10 bg-[#f4f7f5] text-black text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                  placeholder="e.g. Adebayo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">Last name</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-12 px-4 rounded-xl border border-black/10 bg-[#f4f7f5] text-black text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                  placeholder="e.g. Adewale"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full h-12 px-4 rounded-xl border border-black/10 bg-[#f4f7f5] text-black text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                placeholder="name@example.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-black/10 bg-[#f4f7f5] text-black text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                  placeholder="Create a strong password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <SubmitButton />
            
            <p className="text-xs text-center text-black/60 px-4">
              By signing up, you agree to our <Link href="#" className="underline hover:text-black">Terms of Service</Link> and <Link href="#" className="underline hover:text-black">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-8 text-center border-t border-black/10 pt-8">
            <p className="text-sm text-black/60">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-black hover:text-[var(--ng)] transition-colors underline underline-offset-4">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
