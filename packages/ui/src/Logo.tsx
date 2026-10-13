import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function BundleCarrierMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-5 h-5", className)}
      aria-hidden="true"
    >
      {/* Bundle balanced horizontally on head */}
      <path d="M4.5 4.8C5 2.8 8 2 12 2s7 .8 7.5 2.8c.4 1.8-1.5 3.1-3.8 3.6-1.1.2-2.4.3-3.7.3s-2.6-.1-3.7-.3C5.9 7.9 4.1 6.6 4.5 4.8z" />
      {/* Head */}
      <ellipse cx="12" cy="11.2" rx="1.8" ry="2" />
      {/* Figure carrying bundle with raised supporting arms */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 6.8c.5 0 .9.3 1 .8.6 2.2 1.3 3.4 2.2 4.1.6.5 1.2.7 1.8.7s1.2-.2 1.8-.7c.9-.7 1.6-1.9 2.2-4.1.1-.5.5-.8 1-.8.6 0 1 .5.8 1.1-.7 2.6-1.6 4.2-2.8 5.1-.3.2-.6.4-.9.6v7.4H8.9v-7.4c-.3-.2-.6-.4-.9-.6-1.2-.9-2.1-2.5-2.8-5.1-.2-.6.2-1.1.8-1.1zm2.3 8.7c.8.6 1.7.9 2.7.9s1.9-.3 2.7-.9v6.5H9.3v-6.5z"
      />
    </svg>
  );
}

export interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--ng)] text-white shrink-0 shadow-sm shadow-[var(--ng)]/20",
          iconClassName
        )}
      >
        <BundleCarrierMark className="w-5 h-5 text-white" />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold text-lg tracking-tight text-[var(--ink)] [font-family:var(--font-inter)]",
            textClassName
          )}
        >
          Staff Guru
        </span>
      )}
    </div>
  );
}
