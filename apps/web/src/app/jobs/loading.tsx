export default function JobsLoading() {
  return (
    <div className="flex h-screen w-full bg-[var(--canvas)] overflow-hidden">
      {/* Sidebar Skeleton */}
      <aside className="w-[280px] bg-white border-r border-[var(--line)] flex-shrink-0 hidden md:flex flex-col p-6 animate-pulse">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-[var(--line)]" />
          <div className="w-24 h-6 rounded-md bg-[var(--line)]" />
        </div>
        
        {/* Nav Links */}
        <div className="space-y-4 flex-1">
          <div className="w-20 h-3 rounded bg-[var(--line)] mb-6 opacity-60" />
          <div className="w-full h-10 rounded-xl bg-[var(--line)]" />
          <div className="w-11/12 h-10 rounded-xl bg-[var(--line)]" />
          <div className="w-4/5 h-10 rounded-xl bg-[var(--line)]" />
        </div>
        
        {/* Profile Card */}
        <div className="w-full h-32 rounded-2xl bg-[var(--line)] mt-8" />
        
        {/* User Mini */}
        <div className="w-full h-12 rounded-full bg-[var(--line)] mt-6" />
      </aside>

      {/* Main Column */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar Skeleton */}
        <header className="h-[72px] border-b border-[var(--line)] bg-white/50 px-6 flex items-center justify-between animate-pulse shrink-0">
          <div className="w-48 h-5 rounded-md bg-[var(--line)]" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--line)]" />
            <div className="w-10 h-10 rounded-full bg-[var(--line)]" />
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 animate-pulse">
          {/* Welcome Banner */}
          <div className="w-full h-40 rounded-3xl bg-[var(--line)]" />

          {/* Search/Filter Bar */}
          <div className="w-full h-16 rounded-2xl bg-[var(--line)]" />

          {/* Job Cards */}
          <div className="space-y-4">
            <div className="w-full h-32 rounded-3xl bg-[var(--line)]" />
            <div className="w-full h-32 rounded-3xl bg-[var(--line)]" />
            <div className="w-full h-32 rounded-3xl bg-[var(--line)] opacity-70" />
            <div className="w-full h-32 rounded-3xl bg-[var(--line)] opacity-40" />
          </div>
        </div>
      </main>
    </div>
  );
}
