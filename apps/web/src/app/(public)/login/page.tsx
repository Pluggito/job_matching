"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../../../actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button 
        type="submit" 
        disabled={pending}
        className="w-full h-14 mt-4 flex items-center justify-center gap-2 rounded-xl bg-black text-white font-bold text-sm transition-transform hover:-translate-y-0.5 hover:bg-[var(--ng)] shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        {pending ? "Signing in..." : "Sign in to Staff Guru"}
        {!pending && <ArrowRight size={16} />}
      </button>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-[var(--ng)]" />
            <p className="text-black font-bold font-sans">Authenticating...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState(login, null);

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* LEFT SIDE - BRAND/HERO */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[var(--night)] text-white p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="lp-glow absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[var(--ng)]/20 pointer-events-none"></div>
        <div className="lp-glow absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--ng-bright)]/10 pointer-events-none"></div>
        <div className="lp-grain"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl tracking-tight">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--ng)] text-white font-bold text-base tracking-tighter shadow-lg shadow-[var(--ng)]/20">sg</span>
            staff<span className="text-[var(--ng-bright)]">guru</span><i className="text-[var(--ng-bright)] not-italic">.</i>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
            Welcome back to your hiring desk.
          </h1>
          <p className="mt-6 text-white/60 text-lg leading-relaxed">
            Log in to continue managing your vacancies, messaging talent, and building your dream team across Nigeria.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--ng-bright)] w-5 h-5 flex-shrink-0" />
              <span className="text-white/80 font-medium">Access 10,000+ verified professionals</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--ng-bright)] w-5 h-5 flex-shrink-0" />
              <span className="text-white/80 font-medium">Post and manage jobs instantly</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--ng-bright)] w-5 h-5 flex-shrink-0" />
              <span className="text-white/80 font-medium">Message and interview top talent</span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden flex justify-center sm:justify-start">
            <Link href="/" className="flex items-center gap-2 text-black font-bold text-2xl tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ng)] text-white font-bold text-sm tracking-tighter">sg</span>
              staff<span className="text-[var(--ng-bright)]">guru</span><i className="text-[var(--ng-bright)] not-italic">.</i>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-black tracking-tight">Log in</h2>
            <p className="mt-2 text-black/60 text-sm">Enter your email and password to access your account.</p>
          </div>

          <form className="space-y-5" action={formAction}>
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {state.error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full h-12 px-4 rounded-xl border border-black/10 bg-[#f4f7f5] text-black text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black/60 uppercase tracking-wider [font-family:var(--font-dm-mono)]">Password</label>
                <Link href="#" className="text-xs font-bold text-[var(--ng)] hover:text-[var(--night)] transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-black/10 bg-[#f4f7f5] text-black text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:ring-1 focus:ring-[var(--ng)] transition-all"
                  placeholder="••••••••"
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
          </form>

          <div className="mt-10 text-center border-t border-black/10 pt-8">
            <p className="text-sm text-black/60">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold text-black hover:text-[var(--ng)] transition-colors underline underline-offset-4">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
