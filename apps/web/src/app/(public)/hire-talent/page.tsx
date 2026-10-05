import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { Search, Users, Zap } from "lucide-react";

export default function HireTalentPage() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans">
      <PublicHeader />
      
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[var(--ink)] text-[var(--paper)] py-24 sm:py-32">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--green)] via-[var(--ink)] to-[var(--ink)] pointer-events-none"></div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h1 className="mx-auto max-w-4xl [font-family:var(--font-space-grotesk)] text-5xl font-semibold leading-[1.1] sm:text-6xl lg:text-[76px] tracking-tight">
              Build your dream team <br/><span className="text-[var(--lime)]">with confidence.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              Access a curated pool of top-tier Nigerian professionals. Hire verified talent across various industries without the usual hassle.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/signup" className="flex h-12 items-center justify-center rounded-full bg-[var(--lime)] px-8 text-sm font-extrabold text-[var(--ink)] transition-all hover:bg-[var(--lime-dark)] hover:-translate-y-0.5">
                Hire Talent Now
              </Link>
            </div>
          </div>
        </section>

        {/* WHY STAFF GURU FOR EMPLOYERS */}
        <section className="bg-[var(--canvas)] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold tracking-widest text-[var(--green)] uppercase [font-family:var(--font-dm-mono)]">For Employers</p>
              <h2 className="mt-4 [font-family:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
                Why Staff Guru is the right platform for hiring.
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-8 text-[var(--ink-soft)] text-left">
                <p>
                  Hiring the right people is one of the most critical challenges for any business or individual. A bad hire costs you time, money, and momentum. <strong>Staff Guru was designed to eliminate the friction and uncertainty of hiring in Nigeria.</strong>
                </p>
                <p>
                  We understand that you need reliable, skilled professionals who can deliver results. That's why Staff Guru goes beyond a simple job board. We are a comprehensive talent marketplace that emphasizes quality and verification. 
                </p>
                <p>
                  When you use Staff Guru, you aren't just sifting through unverified resumes. Our platform provides you with detailed profiles, verified work histories, portfolios, and peer reviews. We take the guesswork out of hiring by implementing rigorous quality checks, so you can have complete confidence in the people you bring onto your team.
                </p>
                <p>
                  <strong>Speed and efficiency are at our core.</strong> Our intuitive search and direct messaging features mean you can find the right candidate, interview them, and make an offer in record time. No more waiting weeks for recruiters or dealing with unresponsive candidates.
                </p>
                <p>
                  Whether you need a full-time operations manager, a freelance web developer, or a reliable electrician for a quick fix, Staff Guru provides the tools and the talent pool to make it happen smoothly and securely.
                </p>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-[var(--line)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)] mb-6">
                  <Search size={24} />
                </div>
                <h3 className="[font-family:var(--font-space-grotesk)] text-xl font-bold text-[var(--ink)]">Curated Search</h3>
                <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">Easily filter and find exactly who you need based on skills, location, and verified experience.</p>
              </div>
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-[var(--line)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)] mb-6">
                  <Users size={24} />
                </div>
                <h3 className="[font-family:var(--font-space-grotesk)] text-xl font-bold text-[var(--ink)]">Top-Tier Network</h3>
                <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">Access a growing network of thousands of professionals across more than 30 distinct categories.</p>
              </div>
              <div className="flex flex-col items-start bg-white p-8 rounded-2xl shadow-sm border border-[var(--line)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[var(--green)] mb-6">
                  <Zap size={24} />
                </div>
                <h3 className="[font-family:var(--font-space-grotesk)] text-xl font-bold text-[var(--ink)]">Seamless Workflow</h3>
                <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">Manage your entire hiring process—from discovery to the final offer—all in one intuitive place.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
