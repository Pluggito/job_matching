export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 group mb-8 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-[var(--green)]/20 flex items-center justify-center font-bold text-xl text-[var(--green)]">
          sg
        </div>
      </div>
      
      {/* Skeleton Text */}
      <div className="w-48 h-6 rounded-md bg-[var(--line)] animate-pulse mb-3" />
      <div className="w-32 h-4 rounded-md bg-[var(--line)] animate-pulse opacity-60" />
    </div>
  );
}
