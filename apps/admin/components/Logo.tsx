import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({ className, iconClassName, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ng)] text-white shrink-0", iconClassName)}>
        {/* Needle/Pin SVG */}
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <span className={cn("font-bold text-lg tracking-tight text-[var(--ink)] [font-family:var(--font-inter)]", textClassName)}>
        Staff Guru
      </span>
    </div>
  );
}
