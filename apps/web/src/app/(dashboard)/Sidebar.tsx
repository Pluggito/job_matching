"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { getNavItems } from "./data";
import { Role } from "@repo/shared";
import { logout } from "../../actions/auth";

export default function Sidebar({ role, onLinkClick }: { role: Role, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <div className="w-64 bg-white border-r border-[var(--line)] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-[var(--line)] flex items-center justify-between">
        <Link href="/" onClick={onLinkClick} className="flex items-center gap-2 text-[var(--ink)] font-bold text-xl [font-family:var(--font-space-grotesk)] tracking-tight">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--lime)] text-[var(--ink)] font-bold text-sm tracking-tighter">sg</span>
          staff<span className="text-[var(--green)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
        </Link>
        <button onClick={onLinkClick} className="md:hidden p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                isActive 
                  ? "bg-[var(--green)]/10 text-[var(--green)]" 
                  : "text-[var(--ink-soft)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-[var(--green)]" : "text-muted-foreground"} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--line)]">
        <form action={logout}>
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg font-semibold text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
