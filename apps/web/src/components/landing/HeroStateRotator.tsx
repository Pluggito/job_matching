"use client";

import { useEffect, useState, useRef } from "react";

// All 36 States of the Federal Republic of Nigeria + Federal Capital Territory (Abuja)
const NIGERIAN_STATES = [
  "Lagos",
  "Abuja",
  "Rivers",
  "Oyo",
  "Kano",
  "Enugu",
  "Delta",
  "Ogun",
  "Kaduna",
  "Anambra",
  "Edo",
  "Akwa Ibom",
  "Plateau",
  "Imo",
  "Abia",
  "Benue",
  "Osun",
  "Ondo",
  "Kwara",
  "Cross River",
  "Bayelsa",
  "Ekiti",
  "Bauchi",
  "Borno",
  "Gombe",
  "Jigawa",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Nasarawa",
  "Niger",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Adamawa",
  "Ebonyi",
] as const;

export function HeroStateRotator() {
  const [{ current, prev }, setState] = useState<{
    current: number;
    prev: number | null;
  }>({
    current: 0,
    prev: null,
  });

  const [isPaused, setIsPaused] = useState(false);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Interval for cycling through states
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setState(({ current: curr }) => ({
        current: (curr + 1) % NIGERIAN_STATES.length,
        prev: curr,
      }));

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setState((s) => ({ ...s, prev: null }));
      }, 450);
    }, 2400);

    return () => {
      clearInterval(interval);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [isPaused]);

  const currentState = NIGERIAN_STATES[current];
  const prevState = prev !== null ? NIGERIAN_STATES[prev] : null;

  return (
    <span
      className="relative block h-full w-full select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      title="Staff Guru operates across all 36 states and the FCT"
    >
      {/* Outgoing State (slides up and blurs away) */}
      {prevState && (
        <span
          key={`prev-${prev}`}
          aria-hidden="true"
          className="lp-state-exit absolute left-0 top-0 whitespace-nowrap text-[var(--ink)]"
        >
          {prevState}
        </span>
      )}

      {/* Incoming / Active State */}
      <span
        key={`curr-${current}`}
        className={`whitespace-nowrap text-[var(--ink)] absolute left-0 top-0 ${
          prevState ? "lp-state-enter" : ""
        }`}
      >
        {currentState}
      </span>
    </span>
  );
}

export default HeroStateRotator;
