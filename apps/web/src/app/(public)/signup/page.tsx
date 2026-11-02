"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, User, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { signup } from "../../../actions/auth";
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
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[var(--ng)] text-white p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <Logo size="lg" variant="dark" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight font-space text-balance">
            Hire verified tradespeople. Find trusted work.
          </h1>
          <p className="mt-6 text-white/90 text-lg leading-relaxed font-medium">
            Create an account to hire NIN-verified professionals or find trusted jobs.
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
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex justify-center sm:justify-start">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <Logo size="md" />
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[var(--ink)] tracking-tight font-space">Create your account</h2>
            <p className="mt-2 text-black/60 text-sm font-medium">Join thousands of professionals already on Staff Guru.</p>
          </div>

          <form className="space-y-6" action={formAction}>
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {state.error}
              </div>
            )}
            
            <input type="hidden" name="role" value={role.toUpperCase()} />

            <div className="space-y-3">
              <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">How do you want to use Staff Guru?</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole("worker")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === "worker" ? "border-[var(--ng)] bg-[var(--ng)]/5 text-[var(--ink)] shadow-md shadow-[var(--ng)]/10" : "border-black/5 bg-[#fafcfa] text-black/40 hover:border-black/10 hover:bg-[#f4f7f5]"}`}
                >
                  <User size={24} className={role === "worker" ? "text-[var(--ng)] mb-2" : "mb-2"} />
                  <span className="text-sm font-bold">Find work</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === "employer" ? "border-[var(--ng)] bg-[var(--ng)]/5 text-[var(--ink)] shadow-md shadow-[var(--ng)]/10" : "border-black/5 bg-[#fafcfa] text-black/40 hover:border-black/10 hover:bg-[#f4f7f5]"}`}
                >
                  <BriefcaseBusiness size={24} className={role === "employer" ? "text-[var(--ng)] mb-2" : "mb-2"} />
                  <span className="text-sm font-bold">Hire talent</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">First name</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-12 px-4 rounded-xl border border-black/5 bg-[#fafcfa] text-[var(--ink)] font-medium text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:bg-white focus:ring-4 focus:ring-[var(--ng)]/10 transition-all placeholder:text-black/30"
                  placeholder="e.g. Adebayo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">Last name</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-12 px-4 rounded-xl border border-black/5 bg-[#fafcfa] text-[var(--ink)] font-medium text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:bg-white focus:ring-4 focus:ring-[var(--ng)]/10 transition-all placeholder:text-black/30"
                  placeholder="e.g. Adewale"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full h-12 px-4 rounded-xl border border-black/5 bg-[#fafcfa] text-[var(--ink)] font-medium text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:bg-white focus:ring-4 focus:ring-[var(--ng)]/10 transition-all placeholder:text-black/30"
                placeholder="name@example.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full h-12 pl-4 pr-12 rounded-xl border border-black/5 bg-[#fafcfa] text-[var(--ink)] font-medium text-base sm:text-sm focus:outline-none focus:border-[var(--ng)] focus:bg-white focus:ring-4 focus:ring-[var(--ng)]/10 transition-all placeholder:text-black/30"
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

            {role === "employer" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-black/50 uppercase tracking-widest font-dm">Business Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-black/5 bg-[#fafcfa] cursor-pointer hover:border-black/10 transition-colors">
                    <input type="radio" name="employerType" value="INDIVIDUAL" className="accent-[var(--ng)] w-4 h-4 cursor-pointer" required />
                    <span className="text-sm font-medium text-[var(--ink)]">Individual</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-black/5 bg-[#fafcfa] cursor-pointer hover:border-black/10 transition-colors">
                    <input type="radio" name="employerType" value="COMPANY" className="accent-[var(--ng)] w-4 h-4 cursor-pointer" required />
                    <span className="text-sm font-medium text-[var(--ink)]">Company</span>
                  </label>
                </div>
              </div>
            )}

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
