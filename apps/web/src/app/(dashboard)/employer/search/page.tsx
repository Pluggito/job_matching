import { JOB_CATEGORIES } from "@repo/shared";

export default function FindTalentPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Find Talent</h1>
      <p className="text-muted-foreground mb-8">Search for verified professionals across all categories.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {JOB_CATEGORIES.map(category => (
          <div key={category} className="bg-white rounded-xl border border-[var(--line)] p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-bold text-[var(--ink)] mb-2">{category}</h3>
            <p className="text-sm text-muted-foreground">Browse professionals</p>
          </div>
        ))}
      </div>
    </div>
  );
}
