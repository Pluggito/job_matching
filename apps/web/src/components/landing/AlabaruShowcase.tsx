"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface Scenario {
  id: string;
  tabLabel: string;
  category: string;
  title: string;
  punchline: string;
  description: string;
  howItWorks: string;
  keyHighlights: string[];
  location: string;
  budget: number;
  turnaround: string;
  image: string;
  badge: string;
  checklist?: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "inspection",
    tabLabel: "Site Inspection",
    category: "Diaspora & Real Estate",
    title: "Building Site & Property Check",
    punchline: "You dey abroad, but your eyes dey on the ground.",
    description:
      "Sending money home for your building project? Before you release the next payment, a verified runner goes to site and sends you GPS-stamped photos and video of the foundation, blocks and work done so far. No more \"the work is moving, oga\" stories.",
    howItWorks:
      "Sending money home for a building project? Don't rely on phone calls or second-hand updates. A verified runner visits your site in person, takes 360° walk-through videos with live GPS timestamps, counts physical materials, and confirms who is actively working on-site before you release funds.",
    keyHighlights: [
      "GPS-Stamped Media",
      "Material Count Verification",
      "Live WhatsApp Updates",
    ],
    location: "The Eko Pearl · Victoria Island, Lagos",
    budget: 20000,
    turnaround: "3.5 hrs avg.",
    image: "/site_inspection compressed.png",
    badge: "GPS-Stamped Proof",
  },
  {
    id: "ship",
    tabLabel: "Buy & Ship Abroad",
    category: "Diaspora & Cargo",
    title: "Buy in Nigeria, Ship Abroad",
    punchline: "Missing home? We buy am here, we ship am to you.",
    description:
      "Want Ankara, lace, foodstuff, skincare, gadgets or gifts for family abroad? Your runner buys the item for you, checks it in person, packs it well and ships it by cargo to the UK, USA or anywhere in the world.",
    howItWorks:
      "Craving authentic foodstuffs, bespoke lace, Ankara fabrics, or local gifts for family overseas? Your runner goes into the market, video-calls you to inspect items before purchase, bargains local prices without diaspora markups, packs everything securely with receipts, and handles international cargo handover.",
    keyHighlights: [
      "Live Video Inspection",
      "Local Market Bargaining",
      "Worldwide Cargo Tracking",
    ],
    location: "Balogun Market · Lagos → UK, USA & worldwide",
    budget: 20000,
    turnaround: "Shipped in days",
    image: "/landing/alabaru/cargo.jpg",
    badge: "Checked, Packed & Shipped",
  },
  {
    id: "market",
    tabLabel: "Market Runs",
    category: "Wholesale & Commerce",
    title: "Balogun & Alaba Market Runs",
    punchline: "Market wahala? We go for you. No go-slow.",
    description:
      "Need lace, electronics or wholesale stock but you can't face the traffic to Balogun or Alaba? Your runner goes into the market, checks the goods in person, bargains the price and sends you live video before any money moves.",
    howItWorks:
      "Need wholesale fabrics, electronics, or business inventory without losing your entire day to gridlock traffic? Your runner navigates Balogun or Alaba for you. They inspect goods by hand, test electronics, bargain the best vendor rates, send you video confirmation on the spot, and securely hand packages to verified dispatch riders or waybill services.",
    keyHighlights: [
      "In-Person Quality Inspection",
      "Real-Time Video Check",
      "Dispatch & Waybill Handover",
    ],
    location: "Balogun Market Shop B12 · Lagos Island",
    budget: 20000,
    turnaround: "2.2 hrs avg.",
    image: "/market_runs_png.png",
    badge: "Quality Checked in Person",
  },
  {
    id: "delivery",
    tabLabel: "Secure Courier",
    category: "Corporate & High-Value",
    title: "Sensitive Parcel & Document Delivery",
    punchline: "Sealed and tracked. No PIN, no package.",
    description:
      "Court papers, original title documents, bespoke outfits or valuable equipment. The runner cannot hand over until the receiver gives the 6-digit PIN you get at checkout. Nobody can just collect it and go.",
    howItWorks:
      "Moving land title deeds, court filings, custom couture, or valuable devices across the city? Every high-value delivery is protected by a tamper-evident protocol and a 6-digit handoff PIN generated on your dashboard. The courier is locked from releasing the parcel until the intended recipient supplies the exact PIN, completely eliminating lost items and unauthorized handoffs.",
    keyHighlights: [
      "6-Digit Handoff PIN Security",
      "Tamper-Evident Tracking",
      "Guaranteed Direct Delivery",
    ],
    location: "The Corporate Place · 20 Marina, Lagos",
    budget: 20000,
    turnaround: "1.8 hrs avg.",
    image: "/secure_carrier.png",
    badge: "6-Digit PIN Verified",
  },
  {
    id: "automotive",
    tabLabel: "Car Inspection",
    category: "Automotive & Heavy Goods",
    title: "Tokunbo & Used Car Inspection",
    punchline: "Check the car before you pay. Don't buy wahala.",
    description:
      "Buying a car from another state? Don't let anybody sell you a clocked odometer. An inspector runs a computer diagnostic, checks the engine, looks for flood damage and confirms the customs papers before you pay the dealer.",
    howItWorks:
      "Buying a used or tokunbo car in another state? Don't wire deposits without professional eyes on the ground. A vetted automotive inspector checks cold-start engine sound, runs an OBD-II diagnostic computer scan for cleared trouble codes, inspects the underbody for flood or chassis damage, and cross-checks customs papers and VIN against official records so you never buy someone else's headache.",
    keyHighlights: [
      "OBD-II Diagnostic Scan",
      "Engine & Flood Damage Check",
      "VIN & Customs Verification",
    ],
    location: "Berger Auto Market & Lekki Dealerships",
    budget: 20000,
    turnaround: "2.5 hrs avg.",
    image: "/vehicle_inspection.png",
    badge: "OBD-II Scan & Engine Check",
  },
];

interface AlabaruShowcaseProps {
  creationFeeKobo?: number;
  commissionBps?: number;
  minPriceKobo?: number;
}

/* 3D Glossy Cross Accent */
function GlossyCross({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cross-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#38ef7d" />
          <stop offset="35%" stopColor="#008751" />
          <stop offset="100%" stopColor="#004627" />
        </radialGradient>
        <filter id="cross-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#008751" floodOpacity="0.4" />
        </filter>
      </defs>
      <path
        d="M36 16C36 8.268 42.268 2 50 2C57.732 2 64 8.268 64 16V36H84C91.732 36 98 42.268 98 50C98 57.732 91.732 64 84 64H64V84C64 91.732 57.732 98 50 98C42.268 98 36 91.732 36 84V64H16C8.268 64 2 57.732 2 50C2 42.268 8.268 36 16 36H36V16Z"
        fill="url(#cross-grad)"
        filter="url(#cross-shadow)"
      />
      <path
        d="M44 14C44 10 47 6 50 6C53 6 55 9 55 13V40C55 42 57 44 59 44H86C90 44 92 47 92 49C89 44 83 40 76 40H60C56 40 53 37 53 33V14H44Z"
        fill="white"
        opacity="0.35"
      />
    </svg>
  );
}

/* 3D Glossy Star Accent */
function GlossyStar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="star-grad" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="40%" stopColor="#008751" />
          <stop offset="100%" stopColor="#00371e" />
        </radialGradient>
        <filter id="star-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#008751" floodOpacity="0.45" />
        </filter>
      </defs>
      <path
        d="M50 4C51.5 28 72 48.5 96 50C72 51.5 51.5 72 50 96C48.5 72 28 51.5 4 50C28 48.5 48.5 28 50 4Z"
        fill="url(#star-grad)"
        filter="url(#star-shadow)"
      />
      <circle cx="42" cy="38" r="14" fill="white" opacity="0.3" filter="blur(3px)" />
    </svg>
  );
}

export default function AlabaruShowcase({
  creationFeeKobo = 100000,
  commissionBps = 3000,
  minPriceKobo = 2000000,
}: AlabaruShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const activeScenario = SCENARIOS[currentIndex] as Scenario;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SCENARIOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === SCENARIOS.length - 1 ? 0 : prev + 1));
  };

  const creationFeeNaira = Math.round(creationFeeKobo / 100);
  const minFloorNaira = Math.max(20000, Math.round(minPriceKobo / 100));
  const totalEmployerDueNaira = minFloorNaira + creationFeeNaira;

  return (
    <section className="relative overflow-hidden bg-[#f3f5f4] py-20 sm:py-28 text-[var(--ink)] border-t border-black/[0.06]">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[var(--lime)]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">

        {/* ================= 3-COLUMN MASTER LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">

          {/* ================= LEFT COLUMN: Eyebrow + Dynamic Errand Explainer Card ================= */}
          <div className="lg:col-span-4 space-y-6">

            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-xs text-xs sm:text-sm font-semibold text-[var(--ink)]">
              <Sparkles size={14} className="text-[var(--ng)] shrink-0" />
              <span>For Nigerians at Home &amp; Abroad</span>
            </div>

            {/* Main Headline */}
            <div className="flex items-center gap-3 sm:gap-4">
              <h2 className="text-4xl sm:text-5xl xl:text-[54px] font-bold tracking-tight leading-[1.05] [font-family:var(--font-bricolage)]">
                <span className="relative inline-block text-[var(--ng)] pb-2">
                  ALABARU
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 9.5C45.5 -1.5 155.5 -1.5 198 9.5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 pb-2">
                <Image
                  src="/Staff_guru_logo_no_bg.png"
                  alt="Alabaru emblem"
                  width={96}
                  height={96}
                  priority
                  className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            {/* Editorial Narrative (Mobile Only - moved above photo) */}
            <div className="block lg:hidden">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)]/50 mb-2">
                Errands &amp; On-the-Ground Help
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight leading-snug sm:leading-[1.25] [font-family:var(--font-plus-jakarta)] mb-2.5 transition-all duration-200">
                {activeScenario.punchline}
              </h3>
              <div className="space-y-2.5 text-sm sm:text-[15px] text-[var(--ink)]/70 leading-normal sm:leading-[1.42] font-normal">
                <p>
                  Staff Guru is more than a job platform. With Alabaru, you can get trusted people to run errands, inspect properties, make deliveries and represent you on the ground, whether you&apos;re in Lagos or abroad.
                </p>
                <p>
                  Too busy? Living abroad? Can&apos;t be in two places at once? Let a verified local runner handle it for you.
                </p>
              </div>
            </div>

            {/* The Errand Explainer Card (replaces the sterile checklist with engaging write-up) */}
            <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 shadow-sm border border-black/[0.05] space-y-4 sm:space-y-4.5 transition-all duration-300">

              {/* Card Header with Active Category Tag & Budget */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ng)] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-500/15 truncate">
                    {activeScenario.category}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-[var(--ink)] [font-family:var(--font-bricolage)]">
                    From ₦{activeScenario.budget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Errand Task Title */}
              <div className="pt-0.5">
                <h4 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight leading-snug [font-family:var(--font-plus-jakarta)]">
                  {activeScenario.title}
                </h4>
              </div>

              {/* Conversational & Engaging Task Write-up */}
              <div className="text-xs sm:text-[13.5px] text-[var(--ink)]/75 leading-relaxed font-normal min-h-[95px] animate-in fade-in duration-300">
                <p>{activeScenario.howItWorks}</p>
              </div>

              {/* Key Highlights / Feature Chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5 pb-1">
                {activeScenario.keyHighlights.map((highlight, idx) => (
                  <span
                    key={`${activeScenario.id}-badge-${idx}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f4f7f5] text-[11px] sm:text-xs font-semibold text-[var(--ink)]/80 border border-black/[0.04] transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--ng)] shrink-0" />
                    <span>{highlight}</span>
                  </span>
                ))}
              </div>

              {/* Fee Split / Escrow Explanation */}
              <div className="pt-3 border-t border-black/[0.06] text-xs sm:text-[12px] text-[var(--ink)]/65 leading-relaxed">
                Runners take home <strong className="text-[var(--ink)] font-bold">70% of every errand</strong> once the work is confirmed. Staff Guru keeps <strong className="text-[var(--ink)] font-bold">30%</strong> to run the platform, secure payments, verify runners and handle disputes.
              </div>
            </div>
          </div>

          {/* ================= CENTER COLUMN: Tall Portrait Photo + "< >" Navigation Controls ================= */}
          <div className="lg:col-span-4 relative flex flex-col items-center">

            {/* Top-Left Floating 3D Cross Accent */}
            <div className="absolute -top-6 -left-4 sm:-top-8 sm:-left-6 z-20 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none transform -rotate-12 transition-transform duration-700 hover:rotate-6">
              <GlossyCross className="w-full h-full drop-shadow-xl" />
            </div>

            {/* Bottom-Right Floating 3D Star Accent */}
            <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 z-20 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none transform rotate-12 transition-transform duration-700 hover:-rotate-6">
              <GlossyStar className="w-full h-full drop-shadow-xl" />
            </div>

            {/* Main Rounded Portrait Frame */}
            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:h-[540px] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl bg-black/5 border-4 border-white group">
              <Image
                src={activeScenario.image}
                alt={activeScenario.title}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover object-center transition-all duration-700"
                priority
              />

              {/* On-Image Floating Navigation Arrow Buttons "<" and ">" */}
              <button
                onClick={handlePrev}
                aria-label="Previous errand"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[var(--ink)] shadow-lg shadow-black/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer backdrop-blur-xs border border-black/[0.08]"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next errand"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[var(--ink)] shadow-lg shadow-black/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer backdrop-blur-xs border border-black/[0.08]"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>

              {/* Gradient Scrim for Bottom Pill */}
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              {/* Bottom Live Verification Tag */}
              <div className="absolute inset-x-4 bottom-4 z-10 p-3 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-left">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--ng)] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[var(--ng)] animate-pulse" />
                    {activeScenario.badge}
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ink)]/50">
                    {activeScenario.turnaround}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[var(--ink)] truncate">
                  {activeScenario.title}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[var(--ink)]/50 mt-0.5 truncate">
                  <MapPin size={11} className="shrink-0 text-[var(--ng)]" />
                  <span>{activeScenario.location}</span>
                </div>
              </div>
            </div>

            {/* ================= "< >" CAROUSEL BUTTONS CONTROLLER ================= */}
            <div className="mt-5 w-full flex items-center justify-between gap-3 px-1">

              {/* Previous "<" Button */}
              <button
                onClick={handlePrev}
                aria-label="Previous errand"
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-black/10 hover:border-[var(--ng)] text-[var(--ink)] hover:text-[var(--ng)] transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
                <span className="text-xs font-bold hidden sm:inline">Prev</span>
              </button>

              {/* Middle Errand Counter & Progress Dots */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                  <span className="text-[var(--ng)] font-mono">{String(currentIndex + 1).padStart(2, "0")}</span>
                  <span className="text-black/25">/</span>
                  <span className="text-black/45 font-mono">{String(SCENARIOS.length).padStart(2, "0")}</span>
                  <span className="text-black/30 mx-1">·</span>
                  <span className="truncate max-w-[140px] sm:max-w-[180px] font-semibold text-[var(--ink)]/85">
                    {activeScenario.tabLabel}
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {SCENARIOS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Jump to errand ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? "w-6 bg-[var(--ng)]"
                          : "w-1.5 bg-black/15 hover:bg-black/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Next ">" Button */}
              <button
                onClick={handleNext}
                aria-label="Next errand"
                className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-black/10 hover:border-[var(--ng)] text-[var(--ink)] hover:text-[var(--ng)] transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
              >
                <span className="text-xs font-bold hidden sm:inline">Next</span>
                <ChevronRight size={18} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Editorial Narrative + Pill CTA ================= */}
          <div className="lg:col-span-4 space-y-5 lg:pl-2">

            <div className="hidden lg:block">
              {/* Eyebrow Label */}
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink)]/50 mb-2">
                Errands &amp; On-the-Ground Help
              </p>

              {/* Dynamic Punchline Subhead for the Selected Errand */}
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight leading-snug sm:leading-[1.25] [font-family:var(--font-plus-jakarta)] mb-2.5 transition-all duration-200">
                {activeScenario.punchline}
              </h3>

              {/* Narrative Paragraphs */}
              <div className="space-y-2.5 text-sm sm:text-[15px] text-[var(--ink)]/70 leading-normal sm:leading-[1.42] font-normal">
                <p>
                  Staff Guru is more than a job platform. With Alabaru, you can get trusted people to run errands, inspect properties, make deliveries and represent you on the ground, whether you&apos;re in Lagos or abroad.
                </p>
                <p>
                  Too busy? Living abroad? Can&apos;t be in two places at once? Let a verified local runner handle it for you.
                </p>
              </div>
            </div>

            {/* Pill CTA Button (Matching the Reference Photo) */}
            <div className="pt-2">
              <Link
                href="/employer/errands/new"
                className="group inline-flex items-center justify-between gap-4 h-14 pl-7 pr-3 rounded-full bg-[var(--ng)] hover:bg-[#007344] text-white font-bold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[var(--ng)]/20 cursor-pointer w-full sm:w-auto"
              >
                <span>Post an errand now</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[var(--ng)] shadow-xs transition-transform duration-200 group-hover:translate-x-1 shrink-0">
                  <ArrowRight size={17} strokeWidth={2.5} />
                </span>
              </Link>

              {/* Price Floor & Trust Micro-Copy */}
              <p className="text-xs text-[var(--ink)]/50 mt-3 font-medium">
                From ₦{totalEmployerDueNaira.toLocaleString()} · Pay safely · Refund if no runner is found in 24 hours
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
