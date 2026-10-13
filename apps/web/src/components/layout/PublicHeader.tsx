import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export async function PublicHeader() {
  const session = await getSession();
  const dashboardLink =
    session?.role === "EMPLOYER" ? "/employer" : session?.role === "ADMIN" ? "/admin/workers" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-[var(--night)]/95 text-[var(--ink)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: "/hire-talent", label: "Hire talent" },
            { href: "/find-work", label: "Find work" },
            { href: "/pricing", label: "Pricing" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-[var(--ink)]/70 transition-colors hover:text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          {session ? (
            <Link
              href={dashboardLink}
              className="group flex h-10 items-center gap-1.5 rounded-full bg-[var(--ng)] px-5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Dashboard
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-semibold text-[var(--ink)]/80 transition-colors hover:text-[var(--ink)] sm:block"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="group flex h-10 items-center gap-1.5 rounded-full bg-[var(--ng)] px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--ng-deep)] hover:shadow-md"
              >
                Get started
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
