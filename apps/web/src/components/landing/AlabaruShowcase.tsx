"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  KeyRound,
  ShieldCheck,
  Wallet,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
  Lock,
  Compass,
} from "lucide-react";

interface Scenario {
  id: string;
  tag: string;
  title: string;
  tagline: string;
  description: string;
  location: string;
  city: string;
  turnaround: string;
  defaultBudget: number;
  image: string;
  proofType: string;
  coordinates: string;
  pin?: string;
  runnerName: string;
  runnerJobs: number;
  proofBadge: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "market",
    tag: "Wholesale & Market Run",
    title: "Balogun & Alaba Market Procurement",
    tagline: "Quality checked on-site. Zero traffic burnt.",
    description:
      "Sample 5 yards of royal blue French lace or inspect computer parts. Your runner goes into the market labyrinth, verifies item quality on video/photo, negotiates local prices, and retrieves official receipts.",
    location: "Balogun Market, Lagos Island · Shop B12",
    city: "Lagos Island",
    turnaround: "2.2 hrs avg.",
    defaultBudget: 8000,
    image: "/landing/alabaru/market.jpg",
    proofType: "HD Photo of Goods + Serial / Shop Receipt",
    coordinates: "6.4531° N, 3.3958° E",
    pin: "482910",
    runnerName: "Ibrahim Musa",
    runnerJobs: 42,
    proofBadge: "Physical Item Inspected",
  },
  {
    id: "inspection",
    tag: "Diaspora & Real Estate",
    title: "Building Site & Property Verification",
    tagline: "Don't wire funds blindly. Get eyes on the ground.",
    description:
      "Wiring ₦3 million for a building milestone from London, Texas, or Lekki? Don't rely on phone promises. A verified runner arrives with GPS location stamps, taking wide-angle HD photos of foundations, blocks, and progress.",
    location: "Epe Expressway, Lagos · Royal Palm Estate",
    city: "Epe Axis",
    turnaround: "3.5 hrs avg.",
    defaultBudget: 12000,
    image: "/landing/alabaru/inspection.jpg",
    proofType: "4 Timestamped HD Angle Photos + Video",
    coordinates: "6.5833° N, 3.9833° E",
    runnerName: "Sunday Ogundipe",
    runnerJobs: 67,
    proofBadge: "GPS Watermark Verified",
  },
  {
    id: "delivery",
    tag: "High-Value Handover",
    title: "Sensitive Parcel & Contract Courier",
    tagline: "Sealed with a 6-digit cryptographic PIN.",
    description:
      "Important court documents, bespoke bridal couture, or sensitive company hardware. Handover is physically locked until the recipient provides the secret 6-digit PIN generated at checkout — verified on the spot.",
    location: "Victoria Island ➔ Allen Avenue, Ikeja",
    city: "Lagos Mainland",
    turnaround: "1.8 hrs avg.",
    defaultBudget: 7500,
    image: "/landing/alabaru/delivery.jpg",
    proofType: "Cryptographic 6-Digit Handover PIN",
    coordinates: "6.6018° N, 3.3515° E",
    pin: "839401",
    runnerName: "Emeka Nnamdi",
    runnerJobs: 53,
    proofBadge: "PIN Handoff Verified",
  },
  {
    id: "official",
    tag: "Corporate & Government",
    title: "Civic Queue Holding & Filing Retrieval",
    tagline: "Skip 4 hours under the sun at CAC or embassies.",
    description:
      "Skip 4 hours under the sun at CAC, lands registry, or visa centres. Your vetted runner stands on the line from 7:00 AM, holding your spot or submitting certified true copy (CTC) paperwork with instant confirmation.",
    location: "CAC FCT Registry / Alausa Secretariat",
    city: "Ikeja / Abuja",
    turnaround: "4.0 hrs avg.",
    defaultBudget: 15000,
    image: "/landing/alabaru/official.jpg",
    proofType: "Stamped Registry Acknowledgement Slip",
    coordinates: "6.6190° N, 3.3585° E",
    runnerName: "Folake Alabi",
    runnerJobs: 31,
    proofBadge: "Stamped Filing Confirmed",
  },
];

interface AlabaruShowcaseProps {
  creationFeeKobo: number;
  commissionBps: number;
  minPriceKobo: number;
}

export default function AlabaruShowcase({
  creationFeeKobo = 100000, // ₦1,000 default
  commissionBps = 3000, // 30% default
  minPriceKobo = 500000, // ₦5,000 floor
}: AlabaruShowcaseProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0] as Scenario);

  const creationFeeNaira = Math.round(creationFeeKobo / 100);
  const minFloorNaira = Math.round(minPriceKobo / 100);
  const totalEmployerDueNaira = minFloorNaira + creationFeeNaira;

  return (
    <section className="relative overflow-hidden bg-[#f8faf9] py-24 sm:py-32 text-[var(--ink)] border-t border-black/[0.06]">
      {/* Soft Background Accents */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-full max-w-7xl bg-gradient-to-b from-white via-transparent to-transparent opacity-80" />
      <div className="pointer-events-none absolute right-10 top-24 h-96 w-96 rounded-full bg-emerald-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 space-y-16">
        
        {/* ================= 1. EDITORIAL HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-black/[0.06]">
          <div className="max-w-2xl space-y-4">
            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[var(--ink)] leading-[1.05] [font-family:var(--font-bricolage)]">
              Your eyes, ears, and hands across Nigeria. <br />
              <span className="text-[var(--ng)]">Without the 4-hour traffic.</span>
            </h2>

            {/* Sub-copy */}
            <p className="text-base sm:text-lg text-[var(--ink)]/60 leading-relaxed font-normal [font-family:var(--font-dm-sans)]">
              Historically, the market <em>Alabaru</em> carried the physical load. Today, Staff Guru puts vetted, NIN-verified runners on the ground in Balogun, Alaba, Epe, and Abuja CBD — providing timestamped HD photo proof and 6-digit delivery PIN security.
            </p>
          </div>

          {/* Quick Pricing & Action Header Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
            <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-1 text-left sm:text-right lg:text-right w-full sm:w-auto">
              <span className="text-[11px] uppercase tracking-wider text-[var(--ng)] font-bold block">
                Set your price and errand
              </span>
              <div className="text-3xl font-bold text-[var(--ink)] tracking-tight [font-family:var(--font-bricolage)]">
                From ₦{totalEmployerDueNaira.toLocaleString()}
              </div>
              <span className="text-[11.5px] text-[var(--ink)]/50 block">
                100% refunded if unclaimed within 24 hours
              </span>
            </div>

            <Link
              href="/employer/errands/new"
              className="w-full sm:w-auto h-12 px-7 rounded-full bg-[var(--ng)] hover:bg-[#007545] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[var(--ng)]/15 whitespace-nowrap"
            >
              Post an Errand Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* ================= 2. THE INTERACTIVE FIELD DOSSIER / BENTO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 Cols): Scenario Selector Cards */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="text-xs uppercase tracking-wider text-[var(--ink)]/50 font-bold mb-2 flex items-center gap-2">
              <Compass size={14} className="text-[var(--ng)]" /> Choose a Real-World Scenario:
            </div>

            {SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;
              return (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`group p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden bg-white ${
                    isSelected
                      ? "border-[var(--ng)] shadow-lg shadow-[var(--ng)]/10 ring-2 ring-[var(--ng)]/20 translate-x-1"
                      : "border-black/[0.06] hover:border-black/20 hover:shadow-md"
                  }`}
                >
                  {/* Selected Indicator Accent */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[var(--ng)]" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-[var(--ng)] text-white"
                              : "bg-emerald-50 text-[var(--ng)] border border-emerald-500/15"
                          }`}
                        >
                          {scenario.tag}
                        </span>
                        <span className="text-[11px] text-[var(--ink)]/50 font-medium">
                          {scenario.turnaround}
                        </span>
                      </div>
                      
                      <h3
                        className={`text-base font-bold transition-colors ${
                          isSelected ? "text-[var(--ink)]" : "text-[var(--ink)]/85 group-hover:text-[var(--ink)]"
                        }`}
                      >
                        {scenario.title}
                      </h3>
                      
                      <p className="text-xs text-[var(--ink)]/60 line-clamp-2 leading-relaxed">
                        {scenario.tagline}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[11px] text-[var(--ink)]/40 block font-medium">Budget</span>
                      <span className="text-sm font-bold text-[var(--ink)] [font-family:var(--font-bricolage)]">
                        ₦{scenario.defaultBudget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (7 Cols): The Live Digital Waybill / Dossier */}
          <div className="lg:col-span-7 bg-white border border-black/[0.06] rounded-[32px] p-6 sm:p-8 shadow-xl shadow-black/[0.03] space-y-6 relative overflow-hidden">
            
            {/* Top Waybill Status Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider font-bold text-[var(--ink)]/60 uppercase">
                  WAYBILL: <strong className="text-[var(--ink)]">#SG-ALB-{selectedScenario.id.toUpperCase()}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[var(--ng)] text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {selectedScenario.proofBadge}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--ink)]/70 font-medium">
                <MapPin size={13} className="text-[var(--ng)]" />
                <span>{selectedScenario.location}</span>
              </div>
            </div>

            {/* Main Waybill Visual Dossier (Hero Image + Overlays) */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 border border-black/[0.06] shadow-inner group">
              <Image
                src={selectedScenario.image}
                alt={selectedScenario.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/20" />

              {/* Watermark GPS & Timestamp Chip (Top Left) */}
              <div className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[10px] font-mono text-emerald-300 space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GPS: {selectedScenario.coordinates}
                </div>
                <div className="text-white/60 text-[9px]">
                  TIMESTAMP: 12 OCT 2026 · 14:28:04 WAT
                </div>
              </div>

              {/* Runner Badge (Top Right) */}
              <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/10 text-xs font-medium text-[var(--ink)] flex items-center gap-2 shadow-md">
                <div className="w-6 h-6 rounded-full bg-[var(--ng)] text-white font-bold flex items-center justify-center text-[10px]">
                  {selectedScenario.runnerName[0]}
                </div>
                <div>
                  <div className="text-[11px] font-bold leading-tight flex items-center gap-1 text-[var(--ink)]">
                    {selectedScenario.runnerName} <BadgeCheck size={12} className="text-[var(--ng)]" />
                  </div>
                  <div className="text-[9.5px] text-[var(--ink)]/50">
                    {selectedScenario.runnerJobs} Tasks · NIN Verified
                  </div>
                </div>
              </div>

              {/* Bottom Waybill Proof Summary Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-black/10 space-y-2 shadow-lg text-[var(--ink)]">
                <div className="text-xs font-bold text-[var(--ink)] flex items-center justify-between">
                  <span className="text-[var(--ng)] text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Camera size={13} /> Mandatory Proof Requirement
                  </span>
                  <span className="text-[11px] text-[var(--ink)]/60 font-medium">
                    Verified before payout release
                  </span>
                </div>
                <p className="text-xs text-[var(--ink)]/80 leading-snug">
                  {selectedScenario.proofType}
                </p>

                {/* 6-Digit PIN Vault Highlight (if applicable) */}
                {selectedScenario.pin && (
                  <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
                      <Lock size={12} className="text-amber-700" /> Confidential Recipient Delivery PIN:
                    </span>
                    <span className="font-mono text-sm font-black tracking-widest text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md border border-amber-300">
                      [ {selectedScenario.pin.split("").join(" ")} ]
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scenario Story Narrative */}
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-[var(--ink)]">
                {selectedScenario.title}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--ink)]/65 leading-relaxed font-normal">
                {selectedScenario.description}
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[var(--ink)]/60 font-medium flex items-center gap-2">
                <Clock size={14} className="text-[var(--ng)]" />
                <span>Estimated Turnaround: <strong className="text-[var(--ink)]">{selectedScenario.turnaround}</strong></span>
              </div>

              <Link
                href={`/employer/errands/new?type=${selectedScenario.id}&budget=${selectedScenario.defaultBudget}`}
                className="w-full sm:w-auto h-11 px-6 rounded-full bg-[var(--ng)] hover:bg-[#007545] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
              >
                Post This Errand (₦{selectedScenario.defaultBudget.toLocaleString()}) <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ================= 3. THREE PILLARS OF INSTITUTIONAL TRUST ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Pillar 1 */}
          <div className="p-7 rounded-2xl bg-white border border-black/[0.06] shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[var(--ng)] flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
            <h4 className="font-bold text-base text-[var(--ink)]">
              24-Hour Automated Escrow Refund
            </h4>
            <p className="text-xs sm:text-sm text-[var(--ink)]/65 leading-relaxed font-normal">
              If an errand is not claimed by an approved runner within 24 hours, the platform automatically releases the escrow lock and refunds 100% of your payment. Zero paperwork required.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-7 rounded-2xl bg-white border border-black/[0.06] shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-500/20">
              <KeyRound size={22} />
            </div>
            <h4 className="font-bold text-base text-[var(--ink)]">
              Mandatory Photo Proof & HMAC PIN
            </h4>
            <p className="text-xs sm:text-sm text-[var(--ink)]/65 leading-relaxed font-normal">
              Every single errand mandates photographic proof with timestamp metadata before completion. Delivery errands require inputting the 6-digit confidential PIN held only by the recipient.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-7 rounded-2xl bg-white border border-black/[0.06] shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-500/20">
              <Wallet size={22} />
            </div>
            <h4 className="font-bold text-base text-[var(--ink)]">
              NIN-Verified Runners With CBN Nuban
            </h4>
            <p className="text-xs sm:text-sm text-[var(--ink)]/65 leading-relaxed font-normal">
              Zero anonymous accounts. Every runner completes National Identity Number (NIN) checks and maintains an encrypted, check-digit-validated Nigerian bank account on file for secure disbursements.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
