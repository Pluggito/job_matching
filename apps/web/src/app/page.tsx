import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Car,
  Check,
  Code2,
  Hammer,
  Handshake,
  Headphones,
  LineChart,
  MapPin,
  MessageSquare,
  Palette,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getSession } from "@/lib/auth";
import { getErrandPricingStatus } from "@/actions/errands";
import AlabaruShowcase from "@/components/landing/AlabaruShowcase";
import { HeroStateRotator } from "@/components/landing/HeroStateRotator";
import { HeroMapGraphic } from "@/components/landing/HeroMapGraphic";

const marquee = [
  "Tailors",
  "Electricians",
  "Plumbers",
  "Mechanics",
  "Hair stylists",
  "Developers",
  "Designers",
  "Carpenters",
  "Drivers",
  "Chefs",
  "Accountants",
  "Support agents",
];

export default async function LandingPage() {
  const session = await getSession();
  const dashboardLink = session
    ? session.role === "EMPLOYER"
      ? "/employer"
      : session.role === "ADMIN"
        ? "/admin/workers"
        : "/dashboard"
    : null;

  const pricingStatus = await getErrandPricingStatus();

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black">
      <PublicHeader />

      <main className="flex-1">
        {/* ================= HERO ================= */}
        <section className="relative -mt-[68px] overflow-hidden bg-white pt-[68px] text-[var(--ink)]">
          <div className="lp-grid" />
          <div className="lp-grain" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
            {/* Copy */}
            <div className="relative z-10">
              <h1 className="lp-fade-up lp-d1 mt-7 text-[44px] font-bold leading-[1.02] tracking-[-0.03em] [font-family:var(--font-bricolage)] sm:text-6xl lg:text-[76px]">
                <span className="block">Need a Staff in</span>
                <span className="block h-[1.12em] overflow-hidden">
                  <HeroStateRotator />
                </span>
                <span className="relative inline-block text-[var(--ng)]">
                  by Friday?
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9.5C45.5 -1.5 155.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                </span>
              </h1>

              <p className="lp-fade-up lp-d2 mt-6 max-w-xl text-base leading-relaxed text-[var(--ink)] opacity-50 sm:text-lg [font-family:var(--font-dm-sans)]">
                Staff Guru connects employers with verified artisans, electricians, and developers. Get matched, get it done, and get on with your day.
              </p>

              {/* Asymmetrical CTA */}
              <div className="lp-fade-up lp-d3 mt-10 flex flex-col items-center gap-6 sm:flex-row">
                <Link
                  href={dashboardLink ?? "/signup?role=EMPLOYER"}
                  className="group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--ng)] px-8 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                >
                  {session ? "Go to dashboard" : "Hire talent"}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={dashboardLink ?? "/signup?role=WORKER"}
                  className="group flex items-center gap-2 text-base font-bold text-[var(--ink)] opacity-50 transition-colors hover:text-[var(--ng)]"
                >
                  Find work <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Social proof */}
              <div className="lp-fade-up lp-d4 mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {["/landing/tailor.jpg", "/landing/electrician.jpg", "/landing/employer.jpg"].map((src) => (
                    <span
                      key={src}
                      className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white"
                    >
                      <Image src={src} alt="" fill sizes="40px" className="object-cover object-top" />
                    </span>
                  ))}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--ng)] text-[11px] font-bold text-white">
                    10k+
                  </span>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-0.5 text-[var(--ng-bright)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                    <span className="ml-1.5 font-bold text-[var(--ink)]">4.9</span>
                  </div>
                  <p className="text-[var(--ink)] opacity-50">Trusted by 1,800+ Nigerian businesses</p>
                </div>
              </div>
            </div>

            {/* Dynamic UI Illustration: Nigeria Spatial Map */}
            {/* On mobile: Ambient watermark positioned directly behind the hero text with subtle opacity */}
            {/* On desktop (lg): Dedicated right column at 100% interactive opacity */}
            <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none scale-105 sm:scale-100 lg:static lg:inset-auto lg:opacity-100 lg:pointer-events-auto lg:justify-end lg:mt-0 z-0 w-full h-full">
              <HeroMapGraphic />
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-black/[0.05]">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-black/[0.05] px-5 lg:grid-cols-4 lg:divide-x lg:px-8">
              {[
                { k: "Verified professionals", v: "10,000+" },
                { k: "Skill categories", v: "30+" },
                { k: "Cities covered", v: "36 + FCT" },
                { k: "Faster hiring", v: "70%" },
              ].map((s, i) => (
                <div key={s.k} className={`py-8 ${i % 2 === 1 ? "pl-6" : ""} lg:px-8 lg:first:pl-0`}>
                  <dd className="text-3xl font-bold tracking-tight text-[var(--ink)] [font-family:var(--font-bricolage)] sm:text-4xl">
                    {s.v}
                  </dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink)] opacity-50 [font-family:var(--font-dm-sans)]">
                    {s.k}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ================= MARQUEE ================= */}
        <section aria-label="Popular trades" className="relative overflow-hidden bg-[var(--ng)] py-5 text-white">
          <div className="lp-marquee">
            {[...marquee, ...marquee].map((m, i) => (
              <span
                key={i}
                className="flex items-center gap-8 whitespace-nowrap px-4 text-2xl font-bold tracking-tight [font-family:var(--font-inter)] sm:text-3xl"
              >
                {m}
                <span className="text-white/40">✦</span>
              </span>
            ))}
          </div>
        </section>

        {/* ================= TWO SIDES ================= */}
        <section className="relative overflow-hidden bg-white py-24 sm:py-32">
          {/* Subtle background decoration */}
          <div className="absolute left-1/2 top-0 h-px w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black">
                  One platform · Two sides
                </p>
                <h2 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-0.035em] [font-family:var(--font-inter)] sm:text-[56px]">
                  Built for the people who hire — and the people who deliver.
                </h2>
              </div>
              <p className="max-w-sm text-base leading-relaxed text-black/55">
                Whether you run a business or run your own trade, Staff Guru gives you the tools to move faster, safer.
              </p>
            </div>

            {/* Dynamic Flex Columns */}
            <div className="mt-16 flex flex-col gap-6 lg:h-[680px] lg:flex-row">
              {/* Employers */}
              <article className="group/side relative flex flex-1 flex-col overflow-hidden rounded-[40px] bg-[#f8faf9] outline outline-1 outline-black/[0.04] transition-[flex] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:flex-[1.25] lg:flex-row">

                {/* Content */}
                <div className="relative z-10 flex flex-1 flex-col p-8 sm:p-12 lg:w-1/2 lg:min-w-[340px]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-bold text-[var(--ng)] shadow-sm">
                      <Briefcase size={14} /> For employers
                    </span>
                  </div>

                  <h3 className="mt-8 text-3xl font-bold tracking-tight text-black [font-family:var(--font-inter)] sm:text-4xl xl:text-5xl xl:leading-[1.1]">
                    Hire with <br className="hidden xl:block" /> confidence.
                  </h3>

                  <ul className="mt-8 flex-1 space-y-6">
                    {[
                      { icon: Search, t: "Post a job or browse", d: "Filter by skill, state and budget." },
                      { icon: ShieldCheck, t: "Only verified talent", d: "ID, references and skills checked." },
                      { icon: MessageSquare, t: "Interview in-app", d: "Chat, shortlist and hire in one place." },
                    ].map(({ icon: Icon, t, d }) => (
                      <li key={t} className="group/item flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:shadow-md group-hover/item:ring-[var(--ng)]/20 text-black">
                          <Icon size={20} className="transition-colors group-hover/item:text-[var(--ng)]" />
                        </span>
                        <div className="pt-1">
                          <p className="font-bold text-black">{t}</p>
                          <p className="mt-1 max-w-[200px] text-sm leading-relaxed text-black/55 xl:max-w-none">{d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      href={dashboardLink ?? "/signup?role=EMPLOYER"}
                      className="inline-flex h-14 items-center gap-2 rounded-full bg-black px-8 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:bg-[var(--ng)] shadow-xl shadow-black/10"
                    >
                      Start hiring
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Visual */}
                <div className="relative min-h-[360px] overflow-hidden lg:h-full lg:w-1/2">
                  <div className="absolute inset-0 bg-[var(--ng)]/5 transition-opacity duration-500 group-hover/side:opacity-0" />
                  <Image
                    src="/landing/employer.jpg"
                    alt="Employer reviewing candidates on Staff Guru"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-[center_30%] transition-all duration-[1.5s] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/side:scale-105"
                  />

                  {/* Gradient fades for text legibility on smaller screens */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent lg:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f8faf9] via-white/40 to-transparent hidden lg:block opacity-60" />

                  {/* Floating elements */}
                  <div className="absolute bottom-8 left-8 flex w-max items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-4 py-3 text-xs font-bold text-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur transition-all duration-700 ease-out group-hover/side:-translate-y-2 lg:bottom-12 lg:left-0 lg:-translate-x-4 lg:group-hover/side:-translate-x-0">
                    12 matched candidates
                  </div>
                </div>
              </article>

              {/* Professionals */}
              <article className="group/side relative flex flex-1 flex-col overflow-hidden rounded-[40px] bg-[#faf9f5] border border-black/5 transition-[flex] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:flex-[1.25] lg:flex-row-reverse">

                {/* Content */}
                <div className="relative z-10 flex flex-1 flex-col p-8 sm:p-12 lg:w-1/2 lg:min-w-[340px]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ng)]/20 bg-[var(--ng)]/10 px-3 py-1.5 text-xs font-bold text-[var(--ng)]">
                      <Wallet size={14} /> For professionals
                    </span>
                  </div>

                  <h3 className="mt-8 text-3xl font-bold tracking-tight text-[var(--ink)] [font-family:var(--font-bricolage)] sm:text-4xl xl:text-5xl xl:leading-[1.1]">
                    Get paid for <br className="hidden xl:block" /> your craft.
                  </h3>

                  <ul className="mt-8 flex-1 space-y-6">
                    {[
                      { icon: BadgeCheck, t: "Get verified once", d: "Stand out with a trusted badge." },
                      { icon: Briefcase, t: "Jobs that match you", d: "Smart matching by skill and location." },
                      { icon: Star, t: "Build your reputation", d: "Reviews that follow you everywhere." },
                    ].map(({ icon: Icon, t, d }) => (
                      <li key={t} className="group/item flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--ink)] shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:bg-[var(--ng)] group-hover/item:text-white group-hover/item:ring-[var(--ng)]">
                          <Icon size={20} className="transition-colors group-hover/item:text-white" />
                        </span>
                        <div className="pt-1">
                          <p className="font-bold text-[var(--ink)]">{t}</p>
                          <p className="mt-1 max-w-[200px] text-sm leading-relaxed text-[var(--ink)] opacity-50 xl:max-w-none">{d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Link
                      href={dashboardLink ?? "/signup?role=WORKER"}
                      className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-[var(--ink)] border border-black/5 transition-all hover:scale-[1.02] hover:bg-[var(--ng)] hover:text-white hover:border-transparent shadow-sm"
                    >
                      Find work
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Visual */}
                <div className="relative min-h-[360px] overflow-hidden lg:h-full lg:w-1/2">
                  <div className="absolute inset-0 bg-black/20 transition-opacity duration-500 group-hover/side:opacity-0 z-10" />
                  <Image
                    src="/landing/electrician.jpg"
                    alt="Professional finding work on Staff Guru"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-[center_10%] transition-all duration-[1.5s] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/side:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f5] via-transparent to-transparent opacity-90 lg:hidden z-10" />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#faf9f5] via-white/20 to-transparent hidden lg:block opacity-90 z-10" />

                  {/* Floating elements */}
                  <div className="absolute bottom-8 right-8 flex w-max items-center justify-between gap-6 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-700 ease-out group-hover/side:-translate-y-2 lg:bottom-12 lg:right-0 lg:translate-x-4 lg:group-hover/side:translate-x-0 z-20">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink)] opacity-50">
                        This month
                      </p>
                      <p className="mt-1 text-sm font-bold text-[var(--ink)] sm:text-base">₦420,500 earned</p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-[var(--ng)] px-3 py-1.5 text-xs font-bold text-white">
                      <LineChart size={14} /> +18%
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-[#f4f7f5] py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

              {/* Sticky Intro */}
              <div className="lg:w-5/12">
                <div className="sticky top-32">
                  <span className="text-base font-semibold text-[var(--ink)]">
                    How it works
                  </span>
                  <h2 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-[var(--ink)] [font-family:var(--font-inter)] sm:text-6xl sm:leading-[1.05] text-balance">
                    Hire in days, not weeks.
                  </h2>
                  <p className="mt-8 text-lg text-[var(--ink-soft)] leading-relaxed max-w-md">
                    Search verified workers, message them in the app, agree terms, and pay as each milestone is completed.
                  </p>
                </div>
              </div>

              {/* Scrolling Steps */}
              <div className="lg:w-7/12 relative">
                {/* Vertical Line */}
                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent hidden sm:block" />

                <div className="flex flex-col gap-0 sm:gap-20">
                  {[
                    {
                      num: "01",
                      icon: Search,
                      title: "Post a job or browse talent",
                      desc: "Describe the role you need filled, or search our talent pool directly by skill, role, and location.",
                      cardStyle: "bg-white text-black shadow-xl shadow-black/[0.03]",
                      iconStyle: "bg-white text-black border border-black/5 shadow-sm",
                      numColor: "text-black/10 group-hover:text-black/20"
                    },
                    {
                      num: "02",
                      icon: BadgeCheck,
                      title: "Review real profiles",
                      desc: "See verified skills, portfolios, work history, and rates up front—no back and forth required.",
                      cardStyle: "bg-white text-[var(--ink)] shadow-xl shadow-black/[0.03]",
                      iconStyle: "bg-white text-[var(--ink)] border border-black/5 shadow-sm",
                      numColor: "text-black/10 group-hover:text-black/20"
                    },
                    {
                      num: "03",
                      icon: MessageSquare,
                      title: "Message & interview",
                      desc: "Reach out directly through the platform and set up interviews effortlessly.",
                      cardStyle: "bg-[#f8faf9] text-[var(--ink)] border border-black/5 shadow-sm",
                      iconStyle: "bg-white text-[var(--ink)] border border-black/5 shadow-sm",
                      numColor: "text-black/10 group-hover:text-black/20"
                    },
                    {
                      num: "04",
                      icon: Handshake,
                      title: "Hire & manage",
                      desc: "Make an offer, onboard your new hire, and manage your team all in one place.",
                      cardStyle: "bg-[#f4f7f5] sm:bg-transparent text-black border-2 border-dashed border-black/15 hover:border-[var(--ng)]/50 hover:bg-white",
                      iconStyle: "bg-[#f4f7f5] sm:bg-transparent text-black border-2 border-dashed border-black/15 group-hover:border-[var(--ng)]/50 group-hover:bg-white",
                      numColor: "text-black/10 group-hover:text-black/20"
                    }
                  ].map((step, i, arr) => (
                    <div
                      key={step.num}
                      className={`group sticky top-[15vh] sm:relative sm:top-0 flex flex-col sm:flex-row gap-6 sm:gap-12 items-start transition-transform duration-500 ${i === arr.length - 1 ? '' : 'mb-[15vh] sm:mb-0'}`}
                      style={{ zIndex: i + 10 }}
                    >

                      {/* Node/Number (Desktop only) */}
                      <div className="relative z-10 hidden sm:flex flex-col items-center gap-6 shrink-0">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${step.iconStyle}`}>
                          <step.icon size={32} strokeWidth={1.5} />
                        </div>
                        <span className={`text-4xl font-bold [font-family:var(--font-inter)] transition-colors -rotate-90 mt-8 ${step.numColor}`}>
                          {step.num}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className={`flex-1 w-full rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 transition-all duration-500 group-hover:-translate-y-2 ${step.cardStyle} shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] sm:shadow-none`}>

                        {/* Node/Number (Mobile only) */}
                        <div className="flex sm:hidden items-center justify-between mb-8">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-[20px] ${step.iconStyle} shadow-sm`}>
                            <step.icon size={28} strokeWidth={1.5} />
                          </div>
                          <span className={`text-4xl font-bold [font-family:var(--font-inter)] ${step.cardStyle.includes('text-white') ? 'text-white/20' : 'text-black/10'}`}>
                            {step.num}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-bold [font-family:var(--font-inter)]">
                          {step.title}
                        </h3>
                        <p className={`mt-4 text-base sm:text-lg leading-relaxed ${step.cardStyle.includes('text-white') ? 'text-white/70' : 'text-black/60'}`}>
                          {step.desc}
                        </p>

                        {/* Micro-interaction UI element */}
                        <div className="mt-8 h-0 opacity-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:h-12 group-hover:opacity-100 flex items-center gap-3">
                          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${step.cardStyle.includes('text-white') ? 'bg-white/10' : 'bg-black/5'}`}>
                            <ArrowRight size={18} className={step.cardStyle.includes('text-white') ? 'text-white' : 'text-black'} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VERIFICATION ================= */}
        <section className="relative bg-white py-24 sm:py-32">
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8 z-10">
            <div className="max-w-lg">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl">
                Every badge is earned.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-700">
                We don't just take their word for it. Every professional on StaffGuru goes through a rigorous screening process before they ever appear in your search results.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
              {/* Left: Content Steps */}
              <div className="flex flex-col max-w-lg">
                <div className="flex gap-4 pb-6 border-b border-black/10">
                  <span className="w-10 shrink-0 text-sm font-bold text-gray-500">01</span>
                  <div>
                    <h3 className="font-bold text-[var(--ink)]">Identity Verification</h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">Government NIN is checked against the NIMC database to ensure every user is exactly who they claim to be.</p>
                  </div>
                </div>
                <div className="flex gap-4 py-6 border-b border-black/10">
                  <span className="w-10 shrink-0 text-sm font-bold text-gray-500">02</span>
                  <div>
                    <h3 className="font-bold text-[var(--ink)]">Skill Assessment</h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">Trade certificates, licenses, and past portfolios are manually reviewed to verify professional capabilities.</p>
                  </div>
                </div>
                <div className="flex gap-4 py-6 border-b border-black/10">
                  <span className="w-10 shrink-0 text-sm font-bold text-gray-500">03</span>
                  <div>
                    <h3 className="font-bold text-[var(--ink)]">Peer Reviews</h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">Post-job ratings are securely collected only from verified employers who have completed work with the talent.</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <span className="w-10 shrink-0 text-sm font-bold text-gray-500">04</span>
                  <div>
                    <h3 className="font-bold text-[var(--ink)]">Secure Platform</h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">In-app messaging and milestone-based payments protect both parties throughout the entire engagement.</p>
                  </div>
                </div>
              </div>

              {/* Right: Realistic Worker Profile Card */}
              <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:pl-10 self-start lg:sticky lg:top-[96px]">
                <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-100">
                        <Image
                          src="/landing/categories/fashion.jpg"
                          alt="Adaeze Okafor"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--ink)]">Adaeze Okafor</h4>
                        <p className="text-sm text-gray-600">Fashion Designer</p>
                        <p className="text-xs text-gray-500 mt-0.5">Yaba, Lagos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-[var(--ng)] text-[var(--ng)]" />
                      <span className="text-sm font-bold text-[var(--ink)]">4.9</span>
                      <span className="text-xs text-gray-500">(120)</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--ng)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--ng)]">
                      <ShieldCheck size={14} />
                      NIN Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--ng)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--ng)]">
                      <BadgeCheck size={14} />
                      Skills Verified
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 text-xs font-medium text-gray-500">
                    <span>14 jobs completed</span>
                    <span>Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= ALABARU ON-DEMAND ERRANDS SHOWCASE ================= */}
        <AlabaruShowcase
          creationFeeKobo={pricingStatus.creationFeeKobo}
          commissionBps={pricingStatus.commissionBps}
          minPriceKobo={pricingStatus.minPriceKobo}
        />

        {/* ================= TESTIMONIALS ================= */}
        <section className="border-t border-black/[0.06] bg-[#f4f7f5] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <h2 className="max-w-2xl text-4xl font-bold tracking-[-0.035em] [font-family:var(--font-inter)] sm:text-[56px] sm:leading-[1.05]">
              Loved on both sides of the deal.
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  q: "I hired two verified tailors for our new line in under a week. The badges saved me from endless vetting.",
                  n: "Funmi Bakare",
                  r: "Founder, Àṣẹ Couture · Lagos",
                  img: "/landing/employer.jpg",
                  dark: false,
                },
                {
                  q: "Since joining, I've had steady jobs every month. Clients trust me before we even meet.",
                  n: "Tunde Adebayo",
                  r: "Electrician · Lagos",
                  img: "/landing/electrician.jpg",
                  dark: true,
                },
                {
                  q: "My bookings doubled. Staff Guru made it easy for real customers to find my studio.",
                  n: "Adaeze Okafor",
                  r: "Fashion Designer · Lagos",
                  img: "/landing/tailor.jpg",
                  dark: false,
                },
              ].map((t) => (
                <figure
                  key={t.n}
                  className={`flex flex-col justify-between rounded-[28px] p-8 transition-transform duration-300 hover:-translate-y-1 ${t.dark ? "bg-[var(--ng)] text-white" : "border border-black/[0.06] bg-white"
                    }`}
                >
                  <div>
                    <div className={`flex gap-0.5 ${t.dark ? "text-white" : "text-[var(--ng)]"}`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <blockquote className="mt-6 text-lg font-medium leading-relaxed">&ldquo;{t.q}&rdquo;</blockquote>
                  </div>
                  <figcaption className="mt-10 flex items-center gap-3">
                    <span className="relative h-11 w-11 overflow-hidden rounded-full">
                      <Image src={t.img} alt="" fill sizes="44px" className="object-cover object-top" />
                    </span>
                    <div>
                      <p className="font-bold">{t.n}</p>
                      <p className={`text-sm ${t.dark ? "text-white/70" : "text-black/50"}`}>{t.r}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="bg-[#f4f7f5] pb-24 sm:pb-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="relative overflow-hidden rounded-[36px] bg-[var(--ng)] px-6 py-20 text-center text-white sm:px-16 sm:py-24">
              <div className="lp-grid opacity-70" />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] [font-family:var(--font-bricolage)] sm:text-6xl lg:text-7xl">
                  Ready when you are.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
                  Join thousands of Nigerians hiring and getting hired on Staff Guru. It&apos;s free to start.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href={dashboardLink ?? "/signup?role=EMPLOYER"}
                    className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-8 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto"
                  >
                    {session ? "Open dashboard" : "Hire talent"}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  {!session && (
                    <Link
                      href="/signup?role=WORKER"
                      className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-[var(--ink)] transition-all hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto"
                    >
                      Find work
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
