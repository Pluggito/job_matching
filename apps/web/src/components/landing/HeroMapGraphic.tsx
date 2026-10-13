"use client";

import { useState } from "react";
import { NIGERIA_STATE_PATHS } from "./nigeriaMapData";

export interface OperatingStateNode {
  id: string;
  name: string;
  state: string;
  x: number;
  y: number;
  leftPercent: number;
  topPercent: number;
}

// 28 key states distributed across all 6 geopolitical zones where Staff Guru operates
// ViewBox: 50 25 710 565
const OPERATING_STATES: OperatingStateNode[] = [
  { id: "abuja", name: "Abuja (FCT)", state: "Abuja", x: 342, y: 320, leftPercent: 41.1, topPercent: 52.2 },
  { id: "lagos", name: "Lagos", state: "Lagos", x: 136, y: 452, leftPercent: 12.1, topPercent: 75.6 },
  { id: "rivers", name: "Rivers (Port Harcourt)", state: "Rivers", x: 327, y: 546, leftPercent: 39.0, topPercent: 92.2 },
  { id: "kano", name: "Kano", state: "Kano", x: 410, y: 171, leftPercent: 50.7, topPercent: 25.8 },
  { id: "oyo", name: "Oyo (Ibadan)", state: "Oyo", x: 143, y: 374, leftPercent: 13.1, topPercent: 61.8 },
  { id: "kaduna", name: "Kaduna", state: "Kaduna", x: 354, y: 230, leftPercent: 42.8, topPercent: 36.3 },
  { id: "edo", name: "Edo (Benin City)", state: "Edo", x: 265, y: 445, leftPercent: 30.3, topPercent: 74.3 },
  { id: "enugu", name: "Enugu", state: "Enugu", x: 350, y: 445, leftPercent: 42.3, topPercent: 74.3 },
  { id: "plateau", name: "Plateau (Jos)", state: "Plateau", x: 467, y: 295, leftPercent: 58.7, topPercent: 47.8 },
  { id: "delta", name: "Delta (Warri / Asaba)", state: "Delta", x: 270, y: 495, leftPercent: 31.0, topPercent: 83.2 },
  { id: "akwa-ibom", name: "Akwa Ibom (Uyo)", state: "Akwa Ibom", x: 374, y: 535, leftPercent: 45.6, topPercent: 90.3 },
  { id: "borno", name: "Borno (Maiduguri)", state: "Borno", x: 663, y: 141, leftPercent: 86.3, topPercent: 20.5 },
  { id: "sokoto", name: "Sokoto", state: "Sokoto", x: 236, y: 109, leftPercent: 26.2, topPercent: 14.9 },
  { id: "kwara", name: "Kwara (Ilorin)", state: "Kwara", x: 196, y: 320, leftPercent: 20.6, topPercent: 52.2 },
  { id: "benue", name: "Benue (Makurdi)", state: "Benue", x: 420, y: 415, leftPercent: 52.1, topPercent: 69.0 },
  { id: "ogun", name: "Ogun (Abeokuta)", state: "Ogun", x: 143, y: 420, leftPercent: 13.1, topPercent: 69.9 },
  { id: "ondo", name: "Ondo (Akure)", state: "Ondo", x: 232, y: 433, leftPercent: 25.6, topPercent: 72.2 },
  { id: "anambra", name: "Anambra (Awka)", state: "Anambra", x: 328, y: 473, leftPercent: 39.2, topPercent: 79.3 },
  { id: "cross-river", name: "Cross River (Calabar)", state: "Cross River", x: 415, y: 500, leftPercent: 51.4, topPercent: 84.1 },
  { id: "bauchi", name: "Bauchi", state: "Bauchi", x: 486, y: 200, leftPercent: 61.4, topPercent: 31.0 },
  { id: "adamawa", name: "Adamawa (Yola)", state: "Adamawa", x: 629, y: 294, leftPercent: 81.5, topPercent: 47.6 },
  { id: "niger", name: "Niger (Minna)", state: "Niger", x: 252, y: 260, leftPercent: 28.5, topPercent: 41.6 },
  { id: "katsina", name: "Katsina", state: "Katsina", x: 374, y: 139, leftPercent: 45.6, topPercent: 20.2 },
  { id: "gombe", name: "Gombe", state: "Gombe", x: 561, y: 241, leftPercent: 72.0, topPercent: 38.2 },
  { id: "taraba", name: "Taraba (Jalingo)", state: "Taraba", x: 528, y: 364, leftPercent: 67.3, topPercent: 60.0 },
  { id: "kogi", name: "Kogi (Lokoja)", state: "Kogi", x: 304, y: 386, leftPercent: 35.8, topPercent: 63.9 },
  { id: "zamfara", name: "Zamfara (Gusau)", state: "Zamfara", x: 279, y: 149, leftPercent: 32.3, topPercent: 21.9 },
  { id: "bayelsa", name: "Bayelsa (Yenagoa)", state: "Bayelsa", x: 277, y: 544, leftPercent: 32.0, topPercent: 91.9 },
];

export function HeroMapGraphic() {
  // Preview hides completely unless mouse is actively hovering a pin
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full select-none flex items-center justify-center">
      {/* Radiant Multi-layer Ambient Glows (Shining directly on the hero grid canvas) */}
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-tr from-[#008751]/18 via-[#52e396]/14 to-[#d4f278]/18 blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#52e396]/20 blur-[100px] -z-10" />

      {/* Map Display Container taking full area without card boundaries */}
      <div
        className="relative w-full max-w-[700px] lg:max-w-none aspect-[710/565]"
        onMouseLeave={() => {
          setHoveredNodeId(null);
          setHoveredState(null);
        }}
      >
        {/* SVG Nigeria Map */}
        <svg
          viewBox="50 25 710 565"
          className="w-full h-full drop-shadow-sm overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Center ambient glow radial gradient across Nigeria */}
            <radialGradient
              id="nigeriaMapShine"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#52e396" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#008751" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#008751" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Radiant Glow Field across Nigeria */}
          <circle
            cx="365"
            cy="315"
            r="260"
            fill="url(#nigeriaMapShine)"
          />

          {/* Delicate Connecting Corridor Arcs Linking Nationwide Talent Nodes */}
          <g
            stroke="#52e396"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
            opacity="0.65"
          >
            {/* Lagos <-> Abuja */}
            <path d="M 136 452 Q 220 375 342 320" className="animate-pulse" />
            {/* Lagos <-> Ibadan */}
            <path d="M 136 452 Q 138 410 143 374" />
            {/* Abuja <-> Kano */}
            <path d="M 342 320 Q 375 235 410 171" className="animate-pulse" />
            {/* Abuja <-> Port Harcourt */}
            <path d="M 342 320 Q 338 435 327 546" />
            {/* Lagos <-> Benin City <-> Port Harcourt */}
            <path d="M 136 452 Q 200 450 265 445" />
            <path d="M 265 445 Q 295 500 327 546" />
            {/* Abuja <-> Enugu */}
            <path d="M 342 320 Q 360 390 350 445" />
            {/* Abuja <-> Jos */}
            <path d="M 342 320 Q 405 295 467 295" />
            {/* Jos <-> Maiduguri */}
            <path d="M 467 295 Q 560 210 663 141" className="animate-pulse" />
            {/* Abuja <-> Sokoto */}
            <path d="M 342 320 Q 280 200 236 109" />
          </g>

          {/* Real Geographic State Boundaries: Delicate Dotted Mint Lines */}
          <g>
            {NIGERIA_STATE_PATHS.map((state) => {
              const isHovered = hoveredState === state.name;
              return (
                <path
                  key={state.name}
                  d={state.d}
                  fill={isHovered ? "rgba(110, 203, 155, 0.45)" : "rgba(215, 246, 228, 0.38)"}
                  stroke="#5ec78e"
                  strokeWidth={isHovered ? "2.2" : "1.6"}
                  strokeDasharray="2.5 3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredState(state.name)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <title>{`${state.name} State`}</title>
                </path>
              );
            })}
          </g>
        </svg>

        {/* ================= OPERATING STATE PINS ================= */}
        {OPERATING_STATES.map((node) => {
          const isHovered = hoveredNodeId === node.id;

          return (
            <div
              key={node.id}
              style={{ left: `${node.leftPercent}%`, top: `${node.topPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => setHoveredNodeId(node.id)}
            >
              {/* Soft Emerald Glow Behind Pin */}
              <span
                className={`absolute -inset-2 rounded-full bg-emerald-400/30 blur-[7px] transition-all duration-300 pointer-events-none ${
                  isHovered ? "opacity-100 scale-125" : "opacity-60 group-hover:opacity-100"
                }`}
              />

              {/* Floating White Circular Badge with Tilted Mint Capsule */}
              <div
                className={`relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,100,50,0.16)] border border-emerald-500/25 transition-all duration-300 group-hover:scale-125 ${
                  isHovered
                    ? "ring-2 ring-[var(--ng)] ring-offset-2 ring-offset-white scale-115 shadow-[0_8px_24px_rgba(0,135,81,0.28)]"
                    : ""
                }`}
              >
                {/* Tilted Mint Green Capsule Slash (matching user reference mockup) */}
                <span className="h-3.5 w-1.5 rounded-full bg-[#34d399] -rotate-45 shadow-[0_1px_3px_rgba(0,180,90,0.35)]" />
              </div>

              {/* Clean Preview Tag: Displays ONLY while mouse is actively hovering this pin */}
              {isHovered && (
                <div className="absolute left-1/2 -top-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/98 px-3 py-1 shadow-[0_8px_22px_rgba(0,80,40,0.18)] border border-emerald-500/25 flex items-center gap-1.5 z-40 pointer-events-none font-space animate-in fade-in zoom-in-95 duration-150">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ng)]" />
                  </span>
                  <span className="text-[11.5px] font-bold text-[var(--ink)] tracking-tight">
                    {node.name}
                  </span>
                  <span className="text-[9.5px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                    Staff Guru Operates
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Hover State Territory Label on bottom left */}
        {hoveredState && (
          <div className="absolute left-2 bottom-2 z-20 rounded-full bg-white/95 px-3 py-1 shadow-sm border border-emerald-900/10 text-[10px] font-bold text-[var(--ink)] font-space backdrop-blur-sm animate-in fade-in duration-100">
            📍 {hoveredState} State
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroMapGraphic;
