import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  guruClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dark" | "light";
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  guruClassName,
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
  const isLightOrDark = variant === "light" || variant === "dark";

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
          src="/logo.png"
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
            isLightOrDark
              ? "text-white"
              : "text-[var(--ink)]",
            textClassName
          )}
        >
          staff<span className={cn(isLightOrDark ? "text-white" : "text-[var(--ng)]", guruClassName)}>guru</span>
          <i className="text-[var(--orange)] not-italic">.</i>
        </span>
      )}
    </div>
  );
}
