"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../../../actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full h-12 mt-4 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10 disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {pending ? "Signing in..." : "Sign in to Staff Guru"}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState(login, null);

  return (
    <div className="min-h-screen flex font-sans bg-[var(--paper)]">
      {/* LEFT SIDE - BRAND/HERO */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[var(--ink)] text-white p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[var(--green)]/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--lime)]/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl [font-family:var(--font-space-grotesk)] tracking-tight">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--lime)] text-[var(--ink)] font-bold text-base tracking-tighter shadow-lg shadow-[var(--lime)]/20">sg</span>
            staff<span className="text-[var(--lime)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="[font-family:var(--font-space-grotesk)] text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
            Welcome back to your hiring desk.
          </h1>
          <p className="mt-6 text-[var(--muted)] text-lg leading-relaxed">
            Log in to continue managing your vacancies, messaging talent, and building your dream team across Nigeria.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--lime)] w-5 h-5 flex-shrink-0" />
              <span className="text-white/80 font-medium">Access 10,000+ verified professionals</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--lime)] w-5 h-5 flex-shrink-0" />
              <span className="text-white/80 font-medium">Post and manage jobs instantly</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[var(--lime)] w-5 h-5 flex-shrink-0" />
              <span className="text-white/80 font-medium">Message and interview top talent</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-[var(--muted)] border-t border-white/10 pt-6">
          <p>© 2026 Staff Guru.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-[var(--ink)] font-bold text-xl [font-family:var(--font-space-grotesk)] tracking-tight">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--lime)] text-[var(--ink)] font-bold text-sm tracking-tighter">sg</span>
            staff<span className="text-[var(--green)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="[font-family:var(--font-space-grotesk)] text-3xl font-bold text-[var(--ink)] tracking-tight">Log in</h2>
            <p className="mt-2 text-muted-foreground text-sm">Enter your email and password to access your account.</p>
          </div>

          <form className="space-y-5" action={formAction}>
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {state.error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full h-12 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all"
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Password</label>
                <Link href="#" className="text-xs font-bold text-[var(--green)] hover:text-[var(--ink)] transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--ink)] transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold text-[var(--ink)] hover:text-[var(--green)] transition-colors underline underline-offset-4">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
