import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans">
      <PublicHeader />
      
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[var(--ink)] text-[var(--paper)] py-24 sm:py-32">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--orange)] via-[var(--ink)] to-[var(--ink)] pointer-events-none"></div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="mx-auto max-w-4xl [font-family:var(--font-space-grotesk)] text-5xl font-semibold leading-[1.1] sm:text-6xl lg:text-[76px] tracking-tight">
              Simple, transparent <br/><span className="text-[var(--lime)]">pricing.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              No hidden fees. No surprise charges. Just straightforward pricing designed to help you succeed on Staff Guru.
            </p>
          </div>
        </section>

        {/* PRICING PLANS */}
        <section className="bg-[var(--canvas)] py-24 sm:py-32 -mt-16 relative z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
              {/* Worker Plan */}
              <div className="flex flex-col bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[var(--line)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <span className="[font-family:var(--font-space-grotesk)] text-8xl font-bold">W</span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--ink)] [font-family:var(--font-space-grotesk)]">For Professionals</h3>
                <p className="mt-2 text-[var(--ink-soft)]">Everything you need to find work and grow.</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-[var(--ink)]">Free</span>
                  <span className="text-sm font-semibold text-[var(--ink-soft)]">forever</span>
                </div>
                <ul className="mt-8 flex flex-col gap-4 flex-1">
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-[var(--ink-soft)]">Create a professional profile</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-[var(--ink-soft)]">Apply to unlimited jobs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-[var(--ink-soft)]">Basic verification badge</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-[var(--ink-soft)]">Receive direct messages</span>
                  </li>
                </ul>
                <Link href="/signup" className="mt-8 flex h-12 items-center justify-center rounded-full border border-[var(--ink)] px-8 text-sm font-bold text-[var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-white">
                  Join for free
                </Link>
              </div>

              {/* Employer Plan */}
              <div className="flex flex-col bg-[var(--ink)] rounded-3xl p-8 sm:p-10 shadow-xl border border-[var(--ink-soft)] relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <span className="[font-family:var(--font-space-grotesk)] text-8xl font-bold">E</span>
                </div>
                <h3 className="text-2xl font-bold text-white [font-family:var(--font-space-grotesk)]">For Employers</h3>
                <p className="mt-2 text-white/70">Powerful tools to build your team.</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-[var(--lime)]">Pay as you go</span>
                </div>
                <p className="mt-2 text-sm text-[var(--lime)] font-medium">Only pay a small fee when you successfully hire.</p>
                <ul className="mt-8 flex flex-col gap-4 flex-1">
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-white/90">Post unlimited job listings</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-white/90">Access to verified talent pool</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-white/90">Advanced search and filtering</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--ink)]"><Check size={14} strokeWidth={3} /></div>
                    <span className="text-white/90">Integrated messaging system</span>
                  </li>
                </ul>
                <Link href="/signup" className="mt-8 flex h-12 items-center justify-center rounded-full bg-[var(--lime)] px-8 text-sm font-bold text-[var(--ink)] transition-all hover:bg-[var(--lime-dark)]">
                  Start hiring
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* WHY STAFF GURU - PRICING PHILOSOPHY */}
        <section className="bg-[var(--paper)] py-24 sm:py-32 border-t border-[var(--line)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mt-4 [font-family:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
                Why Staff Guru's pricing makes sense.
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-8 text-[var(--ink-soft)] text-left">
                <p>
                  At Staff Guru, we believe that finding work shouldn't cost you money, and hiring great people shouldn't require massive upfront investments. That's why we've built a pricing model that aligns our success directly with yours.
                </p>
                <p>
                  <strong>For professionals</strong>, the platform is entirely free to join, create a profile, and apply for jobs. We want to remove all barriers to entry so the best talent in Nigeria can showcase their skills without worrying about subscription fees.
                </p>
                <p>
                  <strong>For employers</strong>, our "pay-as-you-go" approach ensures you only pay when you see results. You can browse, interview, and evaluate candidates for free. A small, transparent fee is only applied when you successfully hire a candidate through the platform. This guarantees that you get value before you pay a dime.
                </p>
                <p>
                  This fair and balanced ecosystem is exactly why Staff Guru is the right platform for the modern Nigerian workforce. We foster trust and transparency, ensuring both employers and professionals get exactly what they need to thrive.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
