import Link from "next/link";
import { Logo } from "@/components/Logo";

const columns = [
  {
    title: "For employers",
    links: [
      { href: "/hire-talent", label: "Browse talent" },
      { href: "/signup?role=EMPLOYER", label: "Post a job" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "For professionals",
    links: [
      { href: "/find-work", label: "Find work" },
      { href: "/signup?role=WORKER", label: "Create a profile" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "#", label: "About us" },
      { href: "#", label: "Trust & safety" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Terms of service" },
      { href: "#", label: "Privacy policy" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] text-white/60">
      <div className="lp-glow -bottom-40 left-1/2 h-80 w-[700px] -translate-x-1/2 bg-[var(--ng)]/25" />
      <div className="relative mx-auto max-w-7xl px-5 pt-20 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Nigeria&apos;s marketplace for skilled work. Verified professionals, serious employers, one trusted place.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white [font-family:var(--font-dm-mono)]">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-[var(--ng-bright)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] py-8 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Staff Guru. All rights reserved.</p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none -mb-[0.22em] select-none text-center text-[22vw] font-bold leading-none tracking-[-0.06em] text-transparent [font-family:var(--font-space-grotesk)] [-webkit-text-stroke:1px_rgba(255,255,255,0.07)] lg:text-[250px]"
        >
          staffguru
        </div>
      </div>
    </footer>
  );
}
