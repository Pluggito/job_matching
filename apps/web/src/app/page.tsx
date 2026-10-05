import Link from "next/link";
import { ArrowUpRight, Check, Globe, Laptop, MessageSquare, ShieldCheck, Users, Zap } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getSession();
  const getStartedLink = session 
    ? (session.role === "EMPLOYER" ? "/employer" : session.role === "ADMIN" ? "/admin/workers" : "/dashboard")
    : "/signup";
    
  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--green)] via-[var(--ink)] to-[var(--ink)] pointer-events-none"></div>
          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
            <h1 className="max-w-4xl [font-family:var(--font-space-grotesk)] text-5xl font-semibold leading-[1.1] sm:text-6xl lg:text-[76px] tracking-tight">
              Hire exceptional <br/><span className="text-[var(--lime)]">Nigerian talent.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              Access thousands of verified professionals across Nigeria. Find, assess and hire the right people—whether for plumbing, fashion, electrical, or corporate roles—without unnecessary middlemen.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={getStartedLink} className="flex h-12 items-center justify-center rounded-full bg-[var(--lime)] px-8 text-sm font-extrabold text-[var(--ink)] transition-all hover:bg-[var(--lime-dark)] hover:-translate-y-0.5">
                {session ? "Go to Dashboard" : "Hire talent"}
              </Link>
              {!session && (
                <Link href="/signup" className="flex h-12 items-center justify-center rounded-full border border-[var(--ink-soft)] bg-[var(--ink-soft)]/30 px-8 text-sm font-bold text-white transition-all hover:bg-[var(--ink-soft)]/50">
                  Find jobs
                </Link>
              )}
            </div>
            
            <dl className="mt-24 grid grid-cols-1 gap-10 border-t border-[var(--ink-soft)] pt-12 sm:grid-cols-3 lg:mt-32">
              <div>
                <dt className="text-sm font-medium text-[var(--muted)] [font-family:var(--font-dm-mono)] tracking-wider uppercase">Professionals</dt>
                <dd className="mt-2 [font-family:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-[var(--paper)] sm:text-5xl">10,000+</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--muted)] [font-family:var(--font-dm-mono)] tracking-wider uppercase">Categories</dt>
                <dd className="mt-2 [font-family:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-[var(--paper)] sm:text-5xl">30+</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--muted)] [font-family:var(--font-dm-mono)] tracking-wider uppercase">Faster Hiring</dt>
                <dd className="mt-2 [font-family:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-[var(--lime)] sm:text-5xl">70%</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[var(--canvas)] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold tracking-widest text-[var(--green)] uppercase [font-family:var(--font-dm-mono)]">How Staff Guru Works</p>
              <h2 className="mt-4 [font-family:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
                From search to hire, all in one place.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[var(--ink-soft)]">
                Search professionals, review verified experience, speak directly and manage your hiring process seamlessly.
              </p>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-2">
              
              {/* Card 1 */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--ink)] p-8 sm:p-10 shadow-xl">
                <div>
                  <span className="[font-family:var(--font-space-grotesk)] text-6xl font-medium leading-none text-white/20">01</span>
                  <h3 className="mt-6 [font-family:var(--font-space-grotesk)] text-3xl font-semibold leading-tight text-white sm:text-4xl">Post a job or <br/>browse talent</h3>
                </div>
                <div className="mt-12 flex items-end justify-between gap-4">
                  <p className="max-w-[240px] text-sm leading-relaxed text-white/80">Describe the role you need filled, or search our talent pool directly by skill, role, and location.</p>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink-soft)] text-white">
                    <ArrowUpRight size={24} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Card 2 */}
                <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--line)] p-8 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="[font-family:var(--font-space-grotesk)] text-5xl font-medium leading-none text-[var(--ink)]/30">02</span>
                  </div>
                  <div>
                    <h3 className="mt-6 [font-family:var(--font-space-grotesk)] text-2xl font-semibold text-[var(--ink)]">Review real profiles</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)] max-w-sm">See verified skills, portfolios, work history, and rates up front—no back and forth required.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                  {/* Card 3 */}
                  <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--green)] p-8 text-white shadow-lg">
                    <span className="[font-family:var(--font-space-grotesk)] text-5xl font-medium leading-none text-white/30">03</span>
                    <div>
                      <h3 className="mt-6 [font-family:var(--font-space-grotesk)] text-2xl font-semibold">Message & interview</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/90">Reach out directly through the platform and set up interviews.</p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--lime)] p-8 text-[var(--ink)] shadow-lg">
                    <span className="[font-family:var(--font-space-grotesk)] text-5xl font-medium leading-none text-[var(--ink)]/20">04</span>
                    <div>
                      <h3 className="mt-6 [font-family:var(--font-space-grotesk)] text-2xl font-semibold">Hire & manage</h3>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">Make an offer, onboard your new hire, and manage your team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY HIRE */}
        <section className="bg-[var(--paper)] py-24 sm:py-32 border-t border-[var(--line)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-bold tracking-widest text-[var(--green)] uppercase [font-family:var(--font-dm-mono)]">Talent Quality</p>
                <h2 className="mt-4 [font-family:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
                  Screened talent, with deeper verification.
                </h2>
                <p className="mt-6 text-lg leading-8 text-[var(--ink-soft)]">
                  Every professional currently visible on Staff Guru has been screened. We introduce an additional level of assessment for employers who want greater confidence when hiring.
                </p>
                <div className="mt-10 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--green)]"><Check size={16} strokeWidth={3} /></div>
                    <span className="font-semibold text-[var(--ink-soft)]">Identity verification & background checks</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--green)]"><Check size={16} strokeWidth={3} /></div>
                    <span className="font-semibold text-[var(--ink-soft)]">Verified work history and portfolios</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lime)] text-[var(--green)]"><Check size={16} strokeWidth={3} /></div>
                    <span className="font-semibold text-[var(--ink-soft)]">Peer reviews and employer ratings</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden bg-[var(--line)] p-2">
                <div className="w-full h-full rounded-2xl bg-[var(--ink)] flex flex-col items-center justify-center p-8 text-center border-4 border-white shadow-2xl">
                    <ShieldCheck size={80} className="text-[var(--lime)] mb-6" />
                    <h3 className="[font-family:var(--font-space-grotesk)] text-3xl font-bold text-white">Staff Guru Verified</h3>
                    <p className="mt-4 text-[var(--muted)] text-sm max-w-xs">Look for the verification badge to instantly spot talent that has passed our rigorous quality checks.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ROLES */}
        <section className="bg-[var(--ink)] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="[font-family:var(--font-space-grotesk)] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Roles you can hire for.
            </h2>
            <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Explore professionals across fashion, technical, creative, support and operational roles.
            </p>
            
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {['Fashion & Tailoring', 'Electrical', 'Automotive', 'Beauty & Hair', 'Plumbing', 'Web Development', 'Customer Support', 'Design', 'Operations', 'Sales'].map((role, i) => (
                <div key={role} className={`flex aspect-square flex-col justify-end rounded-2xl p-6 text-left transition-transform hover:-translate-y-1 hover:shadow-lg ${i === 0 ? 'bg-[var(--lime)] text-[var(--ink)]' : 'bg-[var(--ink-soft)]/40 text-white border border-white/5'}`}>
                  <h3 className="[font-family:var(--font-space-grotesk)] text-lg font-bold leading-tight">{role}</h3>
                </div>
              ))}
            </div>

            <div className="mt-12">
               <Link href={session ? getStartedLink : "/login"} className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)]/20 px-8 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[var(--ink)]">
                {session ? "Explore all roles" : "Log in to explore"}
              </Link>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
