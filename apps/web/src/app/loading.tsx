import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#fafcf9] flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center">
        {/* Glowing Ambient Aura & Official Emblem */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-[var(--ng)]/15 blur-xl animate-pulse" />

          {/* Official Emblem with Gold / Nigerian Green Border */}
          <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-[var(--ng)] via-[#e6c86e] to-[var(--ng)] shadow-xl shadow-[var(--ng)]/10 animate-in fade-in duration-300">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#008751] ring-2 ring-white shadow-inner">
              <Image
                src="/logo.jpg"
                alt="Staff Guru"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Brand Wordmark */}
        <div className="mt-5 flex items-center gap-1 text-2xl font-bold tracking-tight text-[var(--ink)] [font-family:var(--font-plus-jakarta)]">
          staff<span className="text-[var(--ng)]">guru</span>
          <i className="text-[var(--orange)] not-italic">.</i>
        </div>

        {/* Sleek Indeterminate Loading Bar */}
        <div className="mt-4 w-36 h-1 bg-black/[0.07] rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-[var(--ng)]/30 via-[var(--ng)] to-[var(--ng)]/30 rounded-full lp-indeterminate" />
        </div>

        {/* Micro status label */}
        <p className="mt-3 text-[11px] font-semibold text-[var(--ink)]/40 tracking-[0.16em] uppercase [font-family:var(--font-dm-mono)]">
          Connecting verified talent
        </p>
      </div>
    </div>
  );
}
