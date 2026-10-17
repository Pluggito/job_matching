import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dark" | "light";
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  const sizeMap = {
    sm: { dimension: 28, text: "text-base" },
    md: { dimension: 34, text: "text-lg" },
    lg: { dimension: 40, text: "text-2xl" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative shrink-0",
          iconClassName
        )}
        style={{ width: currentSize.dimension, height: currentSize.dimension }}
      >
        <Image
          src="/Staff_guru_logo_no_bg.png"
          alt="Staff Guru logo"
          width={currentSize.dimension * 2}
          height={currentSize.dimension * 2}
          priority
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight [font-family:var(--font-plus-jakarta)]",
            currentSize.text,
            variant === "light" || variant === "dark"
              ? "text-white"
              : "text-[var(--ink)]",
            textClassName
          )}
        >
          staff<span className={variant === "light" || variant === "dark" ? "text-[var(--lime)]" : "text-[var(--ng)]"}>guru</span>
          <i className="text-[var(--orange)] not-italic">.</i>
        </span>
      )}
    </div>
  );
}
