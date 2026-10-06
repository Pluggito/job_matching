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

const categories = [
  { name: "Fashion & Tailoring", icon: Scissors, count: "1,240", img: "fashion" },
  { name: "Electrical", icon: Zap, count: "980", img: "electrical" },
  { name: "Plumbing", icon: Wrench, count: "760", img: "plumbing" },
  { name: "Automotive", icon: Car, count: "540", img: "automotive" },
  { name: "Beauty & Hair", icon: Sparkles, count: "1,105", img: "beauty" },
  { name: "Web Development", icon: Code2, count: "830", img: "webdev" },
  { name: "Customer Support", icon: Headphones, count: "615", img: "support" },
  { name: "Design", icon: Palette, count: "702", img: "design" },
  { name: "Carpentry", icon: Hammer, count: "410", img: "carpentry" },
  { name: "Sales & Ops", icon: LineChart, count: "590", img: "sales" },
];

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

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black">
      <PublicHeader />

      <main className="flex-1">
        {/* ================= HERO ================= */}
        <section className="relative -mt-[68px] overflow-hidden bg-[var(--night)] pt-[68px] text-white">
          <div className="lp-grid" />
          <div className="lp-glow -left-40 top-10 h-[520px] w-[520px] bg-[var(--ng)]/40" />
          <div className="lp-glow -right-20 bottom-0 h-[420px] w-[420px] bg-[var(--ng-bright)]/20" />
          <div className="lp-grain" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-28 lg:pt-20">
            {/* Copy */}
            <div>


              <h1 className="lp-fade-up lp-d1 mt-7 text-[44px] font-bold leading-[1.02] tracking-[-0.045em] [font-family:var(--font-plus-jakarta-sans)] sm:text-6xl lg:text-[80px]">
                Nigeria&apos;s skilled work,{" "}
                <span className="lp-text-gradient">one tap away.</span>
              </h1>

              <p className="lp-fade-up lp-d2 mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                Staff Guru connects employers with verified tailors, electricians, developers and more — and helps
                professionals land steady, well-paid work close to home.
              </p>

              {/* Dual-path chooser */}
              <div className="lp-fade-up lp-d3 mt-10 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href={dashboardLink ?? "/signup?role=EMPLOYER"}
                  className="lp-shine group relative flex flex-col justify-between rounded-2xl bg-[var(--ng)] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-[#009a5c] hover:shadow-[0_20px_50px_-12px_var(--ng-bright)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Briefcase size={19} />
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70 [font-family:var(--font-dm-mono)]">
                      I&apos;m hiring
                    </p>
                    <p className="mt-1 text-lg font-bold [font-family:var(--font-plus-jakarta-sans)]">
                      {session ? "Go to dashboard" : "Hire talent"}
                    </p>
                  </div>
                </Link>
                <Link
                  href={dashboardLink ?? "/signup?role=WORKER"}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                      <Search size={19} />
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50 [font-family:var(--font-dm-mono)]">
                      I&apos;m a professional
                    </p>
                    <p className="mt-1 text-lg font-bold [font-family:var(--font-plus-jakarta-sans)]">Find work</p>
                  </div>
                </Link>
              </div>

              {/* Social proof */}
              <div className="lp-fade-up lp-d4 mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {["/landing/tailor.jpg", "/landing/electrician.jpg", "/landing/employer.jpg"].map((src) => (
                    <span
                      key={src}
                      className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[var(--night)]"
                    >
                      <Image src={src} alt="" fill sizes="40px" className="object-cover object-top" />
                    </span>
                  ))}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--night)] bg-[var(--ng)] text-[11px] font-bold">
                    10k+
                  </span>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-0.5 text-[var(--ng-bright)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                    <span className="ml-1.5 font-bold text-white">4.9</span>
                  </div>
                  <p className="text-white/50">Trusted by 1,800+ Nigerian businesses</p>
                </div>
              </div>
            </div>

            {/* Visual collage */}
            <div className="lp-fade-up lp-d3 relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[580px]">
              {/* main portrait */}
              <div className="lp-card-glow absolute right-0 top-0 h-[86%] w-[78%] overflow-hidden rounded-[28px] bg-[var(--night-2)] shadow-2xl">
                <Image
                  src="/landing/tailor.jpg"
                  alt="Verified Nigerian fashion designer on Staff Guru"
                  fill
                  priority
                  sizes="(max-width: 1024px) 80vw, 420px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="flex items-center gap-1.5 text-base font-bold">
                      Adaeze O. <BadgeCheck size={17} className="text-[var(--ng-bright)]" />
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/70">
                      <MapPin size={12} /> Fashion Designer · Yaba, Lagos
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">Available</span>
                </div>
              </div>

              {/* secondary portrait */}
              <div className="lp-float-delay absolute bottom-0 right-[10%] h-[44%] w-[42%] overflow-hidden rounded-3xl border-4 border-[var(--night)] shadow-2xl">
                <Image
                  src="/landing/electrician.jpg"
                  alt="Verified electrician on Staff Guru"
                  fill
                  sizes="220px"
                  className="object-cover object-top"
                />
              </div>

              {/* floating: hire request card */}
              <div className="lp-float absolute right-[-4px] top-[2%] w-[230px] rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl sm:right-[-20px] sm:top-[12%]">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60 [font-family:var(--font-dm-mono)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ng-bright)]" /> New hire request
                </div>
                <p className="mt-2 font-bold [font-family:var(--font-plus-jakarta-sans)]">Bridal tailor, 2 weeks</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-[var(--ng-bright)] [font-family:var(--font-plus-jakarta-sans)]">
                    ₦180,000
                  </span>
                  <span className="rounded-full bg-[var(--ng)] px-2.5 py-1 text-[10px] font-bold">Match 96%</span>
                </div>
              </div>

              {/* floating: verified chip */}
              <div className="lp-float absolute bottom-[35%] left-[-4px] flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-black shadow-2xl sm:left-[-20px] sm:bottom-[25%]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ng)] text-white">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold">ID &amp; skills verified</p>
                  <p className="text-xs text-black/50">Background checked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-white/[0.07]">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-white/[0.07] px-5 lg:grid-cols-4 lg:divide-x lg:px-8">
              {[
                { k: "Verified professionals", v: "10,000+" },
                { k: "Skill categories", v: "30+" },
                { k: "Cities covered", v: "Lagos Only" },
                { k: "Faster hiring", v: "70%" },
              ].map((s, i) => (
                <div key={s.k} className={`py-8 ${i % 2 === 1 ? "pl-6" : ""} lg:px-8 lg:first:pl-0`}>
                  <dd className="text-3xl font-bold tracking-tight [font-family:var(--font-plus-jakarta-sans)] sm:text-4xl">
                    {s.v}
                  </dd>
                  <dt className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/45 [font-family:var(--font-dm-mono)]">
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
                className="flex items-center gap-8 whitespace-nowrap px-4 text-2xl font-bold tracking-tight [font-family:var(--font-plus-jakarta-sans)] sm:text-3xl"
              >
                {m}
                <span className="text-white/40">✦</span>
              </span>
            ))}
          </div>
        </section>

        {/* ================= TWO SIDES ================= */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ng)] [font-family:var(--font-dm-mono)]">
                  One platform · Two sides
                </p>
                <h2 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-0.035em] [font-family:var(--font-plus-jakarta-sans)] sm:text-[56px]">
                  Built for the people who hire — and the people who deliver.
                </h2>
              </div>
              <p className="max-w-sm text-base leading-relaxed text-black/55">
                Whether you run a business or run your own trade, Staff Guru gives you the tools to move faster, safer.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Employers */}
              <article className="group relative overflow-hidden rounded-[32px] border border-black/[0.08] bg-[#f4f7f5] p-8 transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgba(0,135,81,0.45)] sm:p-10">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--ng)] shadow-sm">
                    For employers
                  </span>
                  <Briefcase className="text-black/20" size={28} />
                </div>
                <h3 className="mt-8 text-3xl font-bold tracking-tight [font-family:var(--font-plus-jakarta-sans)] sm:text-4xl">
                  Hire with confidence.
                </h3>
                <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src="/landing/employer.jpg"
                    alt="Employer reviewing candidates on Staff Guru"
                    fill
                    sizes="(max-width: 1024px) 90vw, 560px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-[var(--ng)]" /> 12 matched candidates
                  </div>
                </div>
                <ul className="mt-8 space-y-4">
                  {[
                    { icon: Search, t: "Post a job or browse", d: "Filter by skill, state and budget." },
                    { icon: ShieldCheck, t: "Only verified talent", d: "ID, references and skills checked." },
                    { icon: MessageSquare, t: "Interview in-app", d: "Chat, shortlist and hire in one place." },
                  ].map(({ icon: Icon, t, d }) => (
                    <li key={t} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ng)] text-white">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="font-bold">{t}</p>
                        <p className="text-sm text-black/55">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href={dashboardLink ?? "/signup?role=EMPLOYER"}
                  className="lp-shine group/btn mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white transition-all hover:bg-[var(--ng)]"
                >
                  Start hiring
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </article>

              {/* Professionals */}
              <article className="group relative overflow-hidden rounded-[32px] bg-black p-8 text-white transition-shadow duration-500 hover:shadow-[0_30px_80px_-30px_rgba(0,135,81,0.7)] sm:p-10">
                <div className="lp-glow -right-20 -top-20 h-64 w-64 bg-[var(--ng)]/40" />
                <div className="relative flex items-center justify-between">
                  <span className="rounded-full bg-[var(--ng)] px-3 py-1 text-xs font-bold">For professionals</span>
                  <Wallet className="text-white/20" size={28} />
                </div>
                <h3 className="relative mt-8 text-3xl font-bold tracking-tight [font-family:var(--font-plus-jakarta-sans)] sm:text-4xl">
                  Get paid for your craft.
                </h3>
                <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src="/landing/electrician.jpg"
                    alt="Professional electrician finding work on Staff Guru"
                    fill
                    sizes="(max-width: 1024px) 90vw, 560px"
                    className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/60 [font-family:var(--font-dm-mono)]">
                        This month
                      </p>
                      <p className="text-lg font-bold [font-family:var(--font-plus-jakarta-sans)]">₦420,500 earned</p>
                    </div>
                    <span className="rounded-full bg-[var(--ng-bright)] px-2.5 py-1 text-xs font-bold text-black">
                      +18%
                    </span>
                  </div>
                </div>
                <ul className="relative mt-8 space-y-4">
                  {[
                    { icon: BadgeCheck, t: "Get verified once", d: "Stand out with a trusted badge." },
                    { icon: Briefcase, t: "Jobs that match you", d: "Smart matching by skill and location." },
                    { icon: Star, t: "Build your reputation", d: "Reviews that follow you everywhere." },
                  ].map(({ icon: Icon, t, d }) => (
                    <li key={t} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="font-bold">{t}</p>
                        <p className="text-sm text-white/55">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  href={dashboardLink ?? "/signup?role=WORKER"}
                  className="lp-shine group/btn relative mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--ng)] px-6 text-sm font-bold text-white transition-all hover:bg-[var(--ng-bright)]"
                >
                  Find work
                  <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS (bento) ================= */}
        <section className="bg-[#f4f7f5] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ng)] [font-family:var(--font-dm-mono)]">
                How it works
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] [font-family:var(--font-plus-jakarta-sans)] sm:text-[56px] sm:leading-[1.05]">
                From search to signed, in days — not weeks.
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* 01 — tall left card */}
              <div className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] bg-black p-8 text-white shadow-xl sm:p-10">
                <div className="lp-grid opacity-60" />
                <div className="lp-glow -bottom-24 -left-10 h-72 w-72 bg-[var(--ng)]/50" />
                <div className="relative">
                  <span className="text-6xl font-medium leading-none text-white/20 [font-family:var(--font-plus-jakarta-sans)]">01</span>
                  <h3 className="mt-6 text-3xl font-semibold leading-tight [font-family:var(--font-plus-jakarta-sans)] sm:text-4xl">
                    Post a job or <br />
                    browse talent
                  </h3>
                </div>
                <div className="relative mt-12 flex items-end justify-between gap-4">
                  <p className="max-w-[260px] text-sm leading-relaxed text-white/70">
                    Describe the role you need filled, or search our talent pool directly by skill, role, and location.
                  </p>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:bg-[var(--ng)] group-hover:rotate-45">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-5">
                {/* 02 — full width */}
                <div className="flex flex-col justify-between rounded-[28px] border border-black/[0.06] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <span className="text-5xl font-medium leading-none text-black/15 [font-family:var(--font-plus-jakarta-sans)]">02</span>
                    <BadgeCheck className="text-[var(--ng)]" size={26} />
                  </div>
                  <div>
                    <h3 className="mt-6 text-2xl font-semibold [font-family:var(--font-plus-jakarta-sans)]">Review real profiles</h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/55">
                      See verified skills, portfolios, work history, and rates up front—no back and forth required.
                    </p>
                  </div>
                </div>

                {/* 03 + 04 — two cards */}
                <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col justify-between rounded-[28px] bg-[var(--ng)] p-8 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-15px_var(--ng)]">
                    <div className="flex items-start justify-between">
                      <span className="text-5xl font-medium leading-none text-white/30 [font-family:var(--font-plus-jakarta-sans)]">03</span>
                      <MessageSquare size={22} className="text-white/70" />
                    </div>
                    <div>
                      <h3 className="mt-6 text-2xl font-semibold [font-family:var(--font-plus-jakarta-sans)]">Message &amp; interview</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/85">
                        Reach out directly through the platform and set up interviews.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-[28px] bg-[var(--night)] p-8 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="flex items-start justify-between">
                      <span className="text-5xl font-medium leading-none text-[var(--ng-bright)]/40 [font-family:var(--font-plus-jakarta-sans)]">04</span>
                      <Handshake size={22} className="text-[var(--ng-bright)]" />
                    </div>
                    <div>
                      <h3 className="mt-6 text-2xl font-semibold [font-family:var(--font-plus-jakarta-sans)]">Hire &amp; manage</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">
                        Make an offer, onboard your new hire, and manage your team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= VERIFICATION ================= */}
        <section className="relative overflow-hidden bg-[var(--night)] py-24 text-white sm:py-32">
          <div className="lp-glow left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[var(--ng)]/25" />
          <div className="lp-grain" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ng-bright)] [font-family:var(--font-dm-mono)]">
                Trust &amp; safety
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.035em] [font-family:var(--font-plus-jakarta-sans)] sm:text-[56px]">
                Every badge is <span className="lp-text-gradient">earned.</span>
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
                Every professional on Staff Guru is screened before they appear in search. Employers get an extra
                layer of assessment for complete peace of mind.
              </p>
              <ul className="mt-10 space-y-4">
                {[
                  "NIN identity verification & background checks",
                  "Verified work history and portfolios",
                  "Peer reviews and employer ratings",
                  "Secure, in-platform messaging",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ng)]">
                      <Check size={15} strokeWidth={3} />
                    </span>
                    <span className="font-semibold text-white/85">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Profile card mock */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="lp-card-glow lp-float relative rounded-[28px] bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <span className="relative h-16 w-16 overflow-hidden rounded-2xl">
                    <Image src="/landing/electrician.jpg" alt="" fill sizes="64px" className="object-cover object-top" />
                  </span>
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 text-lg font-bold">
                      Tunde Adebayo <BadgeCheck size={18} className="text-[var(--ng-bright)]" />
                    </p>
                    <p className="text-sm text-white/55">Licensed Electrician · Lagos</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { k: "Rating", v: "4.9" },
                    { k: "Jobs", v: "128" },
                    { k: "Years", v: "9" },
                  ].map((s) => (
                    <div key={s.k} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 text-center">
                      <p className="text-xl font-bold [font-family:var(--font-plus-jakarta-sans)]">{s.v}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 [font-family:var(--font-dm-mono)]">{s.k}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { k: "Identity (NIN)", s: "Verified" },
                    { k: "Trade certificate", s: "Verified" },
                    { k: "References", s: "3 confirmed" },
                  ].map((r) => (
                    <div key={r.k} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-sm">
                      <span className="text-white/70">{r.k}</span>
                      <span className="flex items-center gap-1.5 font-bold text-[var(--ng-bright)]">
                        <Check size={14} strokeWidth={3} /> {r.s}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <span className="flex h-11 flex-1 items-center justify-center rounded-full bg-[var(--ng)] text-sm font-bold">
                    Send hire request
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15">
                    <MessageSquare size={17} />
                  </span>
                </div>
              </div>
              <div className="lp-float-delay absolute -bottom-6 -left-6 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black shadow-2xl">
                <ShieldCheck size={18} className="text-[var(--ng)]" /> Staff Guru Verified
              </div>
            </div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ng)] [font-family:var(--font-dm-mono)]">
                  Categories
                </p>
                <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] [font-family:var(--font-plus-jakarta-sans)] sm:text-[56px] sm:leading-[1.05]">
                  Every skill. Every state.
                </h2>
              </div>
              <Link
                href="/hire-talent"
                className="group inline-flex items-center gap-2 text-sm font-bold text-black transition-colors hover:text-[var(--ng)]"
              >
                Browse all categories
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map(({ name, icon: Icon, count, img }) => (
                <Link
                  key={name}
                  href="/hire-talent"
                  className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-black p-4 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(0,135,81,0.55)] sm:p-5"
                >
                  <Image
                    src={`/landing/categories/${img}.jpg`}
                    alt={`${name} professionals in Nigeria`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />
                  <div className="absolute inset-0 bg-[var(--ng)]/0 mix-blend-multiply transition-colors duration-500 group-hover:bg-[var(--ng)]/35" />
                  <div className="relative flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-md transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--ng)]">
                      <Icon size={18} />
                    </span>
                    <span className="flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="relative">
                    <h3 className="text-base font-bold leading-tight [font-family:var(--font-plus-jakarta-sans)] sm:text-lg">{name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ng-bright)]" />
                      {count} verified pros
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="border-t border-black/[0.06] bg-[#f4f7f5] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <h2 className="max-w-2xl text-4xl font-bold tracking-[-0.035em] [font-family:var(--font-plus-jakarta-sans)] sm:text-[56px] sm:leading-[1.05]">
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
                  className={`flex flex-col justify-between rounded-[28px] p-8 transition-transform duration-300 hover:-translate-y-1 ${
                    t.dark ? "bg-[var(--ng)] text-white" : "border border-black/[0.06] bg-white"
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
              <div className="lp-glow -left-24 -top-24 h-80 w-80 bg-[var(--ng-bright)]/60" />
              <div className="lp-glow -bottom-32 -right-10 h-96 w-96 bg-black/50" />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] [font-family:var(--font-plus-jakarta-sans)] sm:text-6xl lg:text-7xl">
                  Ready when you are.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
                  Join thousands of Nigerians hiring and getting hired on Staff Guru. It&apos;s free to start.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href={dashboardLink ?? "/signup?role=EMPLOYER"}
                    className="lp-shine group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-8 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto"
                  >
                    {session ? "Open dashboard" : "Hire talent"}
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  {!session && (
                    <Link
                      href="/signup?role=WORKER"
                      className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-black transition-all hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto"
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
