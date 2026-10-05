import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[var(--ink)] border-t border-white/10 pb-12 pt-16 text-white/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl [font-family:var(--font-space-grotesk)] tracking-tight">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--lime)] text-[var(--ink)] font-bold text-sm tracking-tighter">sg</span>
              staff<span className="text-[var(--lime)]">guru</span><i className="text-[var(--orange)] not-italic">.</i>
            </Link>
            <p className="mt-6 text-sm leading-relaxed max-w-xs">
              The workplace OS for finding, hiring, and managing Nigeria's best talent.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider [font-family:var(--font-dm-mono)]">Platform</h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li><Link href="/" className="hover:text-[var(--lime)] transition-colors">How it works</Link></li>
              <li><Link href="/hire-talent" className="hover:text-[var(--lime)] transition-colors">Browse Talent</Link></li>
              <li><Link href="/pricing" className="hover:text-[var(--lime)] transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider [font-family:var(--font-dm-mono)]">Company</h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li><Link href="#" className="hover:text-[var(--lime)] transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-[var(--lime)] transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-[var(--lime)] transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider [font-family:var(--font-dm-mono)]">Legal</h3>
            <ul className="mt-6 space-y-4 text-sm">
              <li><Link href="#" className="hover:text-[var(--lime)] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[var(--lime)] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm">© 2026 Staff Guru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
