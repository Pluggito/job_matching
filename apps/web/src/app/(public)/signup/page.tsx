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
        className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] text-[var(--lime)] font-bold text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        {pending ? "Creating Account..." : "Create Account"}
        {!pending && <ArrowRight size={16} />}
      </button>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-[var(--green)]" />
            <p className="text-[var(--ink)] font-bold font-sans">Creating your account...</p>
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
    <div className="min-h-screen flex font-sans bg-[var(--paper)]">
      {/* LEFT SIDE - BRAND/HERO */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[var(--ink)] text-white p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[var(--green)]/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[var(--lime)]/10 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-2xl [font-family:var(--font-space-grotesk)] tracking-tight">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--lime)] text-[var(--ink)] font-bold text-base tracking-tighter shadow-lg shadow-[var(--lime)]/20">sg</span>
            staff<span className="text-[var(--lime)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="[font-family:var(--font-space-grotesk)] text-4xl sm:text-5xl font-semibold leading-[1.1] tracking-tight">
            Join the workforce OS for Nigeria.
          </h1>
          <p className="mt-6 text-[var(--muted)] text-lg leading-relaxed">
            Create an account to hire verified talent or find skilled work opportunities close to home.
          </p>
          
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex gap-4">
              <div className="mt-1">
                <CheckCircle2 className="text-[var(--lime)] w-6 h-6" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-snug">
                  "I wish I had known about this platform earlier. Staff Guru saved me time, money and stress."
                </p>
                <div className="mt-4">
                  <p className="[font-family:var(--font-space-grotesk)] font-bold text-white text-xs tracking-wide">Hope Ekwere Philip</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">CEO, Productive Pigeon</p>
                </div>
              </div>
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
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden flex justify-center sm:justify-start">
            <Link href="/" className="flex items-center gap-2 text-[var(--ink)] font-bold text-2xl [font-family:var(--font-space-grotesk)] tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--lime)] text-[var(--ink)] font-bold text-sm tracking-tighter">sg</span>
              staff<span className="text-[var(--green)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="[font-family:var(--font-space-grotesk)] text-3xl font-bold text-[var(--ink)] tracking-tight">Create your account</h2>
            <p className="mt-2 text-muted-foreground text-sm">Join thousands of professionals already on Staff Guru.</p>
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
              <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">How do you want to use Staff Guru?</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole("worker")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "worker" ? "border-[var(--green)] bg-[var(--green)]/5 text-[var(--ink)] shadow-sm" : "border-[var(--line)] bg-[var(--canvas)] text-muted-foreground hover:border-muted-foreground"}`}
                >
                  <User size={24} className={role === "worker" ? "text-[var(--green)] mb-2" : "mb-2"} />
                  <span className="text-sm font-bold">Find work</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "employer" ? "border-[var(--green)] bg-[var(--green)]/5 text-[var(--ink)] shadow-sm" : "border-[var(--line)] bg-[var(--canvas)] text-muted-foreground hover:border-muted-foreground"}`}
                >
                  <BriefcaseBusiness size={24} className={role === "employer" ? "text-[var(--green)] mb-2" : "mb-2"} />
                  <span className="text-sm font-bold">Hire talent</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">First name</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-base sm:text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all"
                  placeholder="e.g. Adebayo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Last name</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-base sm:text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all"
                  placeholder="e.g. Adewale"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Email address</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full h-11 px-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-base sm:text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all"
                placeholder="name@example.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider [font-family:var(--font-dm-mono)]">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full h-11 pl-4 pr-12 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)] text-base sm:text-sm focus:outline-none focus:border-[var(--green)] focus:ring-1 focus:ring-[var(--green)] transition-all"
                  placeholder="Create a strong password"
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
            
            <p className="text-xs text-center text-muted-foreground px-4">
              By signing up, you agree to our <Link href="#" className="underline hover:text-[var(--ink)]">Terms of Service</Link> and <Link href="#" className="underline hover:text-[var(--ink)]">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-8 text-center border-t border-[var(--line)] pt-8">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[var(--ink)] hover:text-[var(--green)] transition-colors underline underline-offset-4">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
