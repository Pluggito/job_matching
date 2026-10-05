import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { ArrowUpRight, Briefcase, Check, ShieldCheck, Zap } from "lucide-react";

export default function FindWorkPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans">
      <PublicHeader />
      
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[var(--ink)] text-[var(--paper)] py-24 sm:py-32">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--lime)] via-[var(--ink)] to-[var(--ink)] pointer-events-none"></div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="mx-auto max-w-4xl [font-family:var(--font-space-grotesk)] text-5xl font-semibold leading-[1.1] sm:text-6xl lg:text-[76px] tracking-tight">
              Your next big opportunity <br/><span className="text-[var(--lime)]">starts here.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              Staff Guru is the ultimate platform for Nigerian professionals to find rewarding jobs, build their careers, and connect with top employers who value your skills and dedication.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/signup" className="flex h-12 items-center justify-center rounded-full bg-[var(--lime)] px-8 text-sm font-extrabold text-[var(--ink)] transition-all hover:bg-[var(--lime-dark)] hover:-translate-y-0.5">
                Start finding work
              </Link>
            </div>
          </div>
        </section>

        {/* WHY STAFF GURU FOR WORKERS */}
        <section className="bg-[var(--canvas)] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold tracking-widest text-[var(--green)] uppercase [font-family:var(--font-dm-mono)]">Why Choose Us</p>
              <h2 className="mt-4 [font-family:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
                The right platform for your career growth.
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-8 text-[var(--ink-soft)] text-left">
                <p>
                  Finding consistent, well-paying work in Nigeria can be a challenge. Traditional job boards are often crowded, and finding direct clients requires constant networking and self-promotion. <strong>Staff Guru changes that.</strong> 
                </p>
                <p>
                  We built Staff Guru specifically to empower professionals like you. Whether you are a skilled plumber, a talented fashion designer, a brilliant web developer, or an experienced corporate professional, our platform connects you directly with employers who are actively looking for your specific skill set. 
                </p>
                <p>
                  Unlike other platforms that act as middlemen and take huge cuts, Staff Guru provides a transparent marketplace. You get to showcase your portfolio, highlight your verified experience, and let your work speak for itself. Employers can see your true value, leading to fairer compensation and more respectful working relationships.
                </p>
                <p>
                  <strong>Why is Staff Guru the right platform for you?</strong> Because we prioritize quality and trust. When you become a Staff Guru Verified professional, you stand out from the crowd. We handle the verification, so employers trust you instantly. This means less time trying to prove yourself and more time actually doing the work you love and getting paid for it.
                </p>
                <p>
                  Join thousands of other Nigerian professionals who are already using Staff Guru to take control of their careers, find flexible opportunities, and build lasting relationships with great clients and employers.
                </p>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-[var(--line)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)] mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="[font-family:var(--font-space-grotesk)] text-xl font-bold text-[var(--ink)]">Verified Trust</h3>
                <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">Our verification process ensures you are seen as a trusted professional, making it easier to land jobs.</p>
              </div>
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-[var(--line)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)] mb-6">
                  <Briefcase size={24} />
                </div>
                <h3 className="[font-family:var(--font-space-grotesk)] text-xl font-bold text-[var(--ink)]">Direct Access</h3>
                <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">No unnecessary middlemen. Connect directly with employers, negotiate your terms, and build your network.</p>
              </div>
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-[var(--line)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)] mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="[font-family:var(--font-space-grotesk)] text-xl font-bold text-[var(--ink)]">Faster Hiring</h3>
                <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">Our streamlined platform means you get discovered faster, interviewed sooner, and hired quicker.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
