"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Loader2, AlertCircle, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { verifyEmailOtp, resendVerificationOtp } from "@/actions/auth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const noticeParam = searchParams.get("notice");

  const [email] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const digit = cleaned.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setError(null);

    // Auto-advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);
    setError(null);

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();

    // If all 6 digits pasted, trigger submit automatically
    if (pasted.length === 6 && email) {
      submitOtp(pasted);
    }
  };

  const submitOtp = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    if (!email) {
      setError("Missing email address. Please return to signup and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setResendSuccess(null);

    try {
      const res = await verifyEmailOtp(email, code);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.success) {
        // Successful verification -> navigate to onboarding
        router.push(res.redirectUrl || "/onboarding");
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !email) return;

    setResending(true);
    setError(null);
    setResendSuccess(null);

    try {
      const res = await resendVerificationOtp(email);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setResendSuccess(res.message || "A new 6-digit code has been sent.");
        setCooldown(60);
        // Clear digit inputs and refocus first box
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold mb-6 border border-white/15">
            <ShieldCheck size={14} className="text-[#f3aa60]" />
            <span>Account Security & Trust</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.15] tracking-tight font-space text-balance">
            Verify your email to activate your account.
          </h1>
          <p className="mt-6 text-white/90 text-lg leading-relaxed font-medium">
            We ensure every artisan and employer is verified with real contact details to create a trusted marketplace for all Nigerians.
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

      {/* RIGHT SIDE - VERIFICATION FORM */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md">
          {/* Mobile Header Logo */}
          <div className="mb-8 lg:hidden flex justify-center sm:justify-start">
            <Link href="/" className="hover:opacity-85 transition-opacity">
              <Logo size="md" />
            </Link>
          </div>

          {/* Mail Icon & Heading */}
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f0f7f2] text-[var(--ng)] mb-5 shadow-sm border border-[var(--ng)]/10">
              <Mail size={26} />
            </div>
            <h2 className="text-3xl font-bold text-[var(--ink)] tracking-tight font-space">
              Check your inbox
            </h2>
            <p className="mt-2 text-black/60 text-sm leading-relaxed">
              We sent a 6-digit confirmation code to:
            </p>
            <p className="font-bold text-[var(--ink)] text-base mt-0.5 break-all">
              {email || "your email address"}
            </p>
          </div>

          {noticeParam === "unverified" && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>Please verify your email address to continue to your dashboard.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {/* 6-DIGIT OTP INPUTS */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitOtp();
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-xs font-bold text-black/50 uppercase tracking-widest font-dm mb-3 text-center lg:text-left">
                Enter 6-digit code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 border-black/10 bg-[#fafcfa] text-[var(--ink)] transition-all focus:border-[var(--ng)] focus:bg-white focus:shadow-md focus:shadow-[var(--ng)]/10 focus:outline-none disabled:opacity-50"
                  />
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || digits.join("").length !== 6}
              className="w-full h-14 flex items-center justify-center gap-2 rounded-full bg-[var(--ng)] text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--ng)]/90 hover:shadow-lg hover:shadow-[var(--ng)]/20 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Verifying..." : "Verify & Continue"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* RESEND & COOLDOWN SECTION */}
          <div className="mt-8 pt-6 border-t border-black/5 text-center text-sm text-black/60">
            <p>
              Didn&apos;t receive the code?{" "}
              {cooldown > 0 ? (
                <span className="font-semibold text-black/40">
                  Resend in <span className="text-[var(--ng)] font-bold">{cooldown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1 font-bold text-[var(--ng)] hover:underline disabled:opacity-50"
                >
                  {resending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  <span>{resending ? "Sending..." : "Resend code"}</span>
                </button>
              )}
            </p>

            <div className="mt-4 text-xs text-black/40">
              <Link href="/signup" className="hover:underline">
                Wrong email address? Return to signup
              </Link>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-[#fafcfa] border border-black/5 text-[11px] text-black/50">
              Need assistance? Email our support desk at{" "}
              <a href="mailto:staffgurunaija@gmail.com" className="font-semibold text-[var(--ng)] hover:underline">
                staffgurunaija@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 size={36} className="animate-spin text-[var(--ng)]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

