import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function PublicHeader() {
  const session = await getSession();
  const dashboardLink = session?.role === "EMPLOYER" ? "/employer" : session?.role === "ADMIN" ? "/admin/workers" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 bg-[var(--canvas)]/80 backdrop-blur-md border-b border-[var(--line)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-[var(--ink)] font-bold text-xl [font-family:var(--font-space-grotesk)] tracking-tight">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--lime)] text-[var(--ink)] font-bold text-sm tracking-tighter">sg</span>
          staff<span className="text-[var(--green)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/find-work" className="text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Find work</Link>
          <Link href="/hire-talent" className="text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Hire talent</Link>
          <Link href="/pricing" className="text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <Link href={dashboardLink} className="flex h-10 items-center justify-center rounded-xl bg-[var(--ink)] px-5 text-sm font-bold text-[var(--lime)] transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm font-bold text-[var(--ink)]">Log in</Link>
              <Link href="/signup" className="flex h-10 items-center justify-center rounded-xl bg-[var(--ink)] px-5 text-sm font-bold text-[var(--lime)] transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
