import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSession } from "@/lib/auth";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 font-bold text-xl [font-family:var(--font-space-grotesk)] tracking-tight ${className}`}
    >
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[var(--ng)] text-sm font-bold tracking-tighter text-white shadow-[0_0_24px_-4px_var(--ng-bright)] transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
        <span className="absolute inset-y-0 left-0 w-1/3 bg-white/15" />
        <span className="relative">sg</span>
      </span>
      <span>
        staff<span className="text-[var(--ng-bright)]">guru</span>
      </span>
    </Link>
  );
}

export async function PublicHeader() {
  const session = await getSession();
  const dashboardLink =
    session?.role === "EMPLOYER" ? "/employer" : session?.role === "ADMIN" ? "/admin/workers" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[var(--night)]/75 text-white backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--night)]/60">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <BrandMark className="text-white" />

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 md:flex">
          {[
            { href: "/hire-talent", label: "Hire talent" },
            { href: "/find-work", label: "Find work" },
            { href: "/pricing", label: "Pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <Link
              href={dashboardLink}
              className="lp-shine group flex h-10 items-center gap-1.5 rounded-full bg-[var(--ng)] px-5 text-[13px] font-bold text-white transition-all hover:bg-[var(--ng-bright)] hover:shadow-[0_8px_30px_-6px_var(--ng-bright)]"
            >
              Dashboard
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-[13px] font-semibold text-white/75 transition-colors hover:text-white sm:block"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="lp-shine group flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[13px] font-bold text-black transition-all hover:bg-[var(--ng-bright)] hover:text-white hover:shadow-[0_8px_30px_-6px_var(--ng-bright)]"
              >
                Get started
                <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
