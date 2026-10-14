"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../../../actions/auth";
import { Logo } from "@/components/Logo";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="w-full h-14 mt-4 flex items-center justify-center gap-2 rounded-full bg-[var(--green)] text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--green)]/90 hover:shadow-lg hover:shadow-[var(--green)]/20 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[var(--ng)] text-white p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <Logo size="lg" variant="dark" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight font-space text-balance">
            Your hiring desk is waiting.
          </h1>
          <p className="mt-6 text-white/90 text-lg leading-relaxed font-medium">
            Log in to see your vacancies and messages.
          </p>
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
          <div className="mb-8 lg:hidden flex justify-center sm:justify-start">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <Logo size="md" />
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[var(--ink)] tracking-tight font-space">Log in</h2>
            <p className="mt-2 text-black/60 text-sm font-medium">Enter your email and password to access your account.</p>
          </div>

          <form className="space-y-5" action={formAction}>
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {state.error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">Email address</label>
              <input
                type="email"
                name="email"
                required
                className="w-full h-12 px-4 rounded-xl border border-black/5 bg-[#fafcfa] text-[var(--ink)] font-medium text-base sm:text-sm focus:outline-none focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[var(--green)]/10 transition-all placeholder:text-black/30"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">Password</label>
                <Link href="#" className="text-xs font-bold text-[var(--green)] hover:text-[var(--ink)] transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-black/5 bg-[#fafcfa] text-[var(--ink)] font-medium text-base sm:text-sm focus:outline-none focus:border-[var(--green)] focus:bg-white focus:ring-4 focus:ring-[var(--green)]/10 transition-all placeholder:text-black/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-[var(--green)] transition-colors p-1"
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
