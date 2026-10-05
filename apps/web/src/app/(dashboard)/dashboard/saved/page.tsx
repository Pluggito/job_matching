export default function SavedJobsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
      <p className="text-muted-foreground mb-8">Jobs you've bookmarked for later.</p>
      
      <div className="bg-white rounded-xl border border-[var(--line)] p-12 text-center">
        <div className="w-16 h-16 bg-[var(--canvas)] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❤️</span>
        </div>
        <h3 className="text-lg font-bold mb-2">No saved jobs</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
          You haven't saved any jobs yet. Browse jobs and click the heart icon to save them here.
        </p>
      </div>
    </div>
  );
}
