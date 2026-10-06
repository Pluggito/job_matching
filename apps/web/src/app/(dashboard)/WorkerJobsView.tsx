import { Briefcase, MapPin, Clock, CheckCircle2, XCircle, Clock3, ChevronRight, Building } from "lucide-react";

const mockApplications = [
  {
    id: 1,
    title: "Logistics Driver",
    company: "Acme Logistics Ltd",
    location: "Ikeja, Lagos",
    salary: "₦120,000/mo",
    appliedDate: "2 days ago",
    status: "pending",
    type: "Full-time"
  },
  {
    id: 2,
    title: "Warehouse Associate",
    company: "Global Goods Ng",
    location: "Surulere, Lagos",
    salary: "₦85,000/mo",
    appliedDate: "1 week ago",
    status: "accepted",
    type: "Contract"
  },
  {
    id: 3,
    title: "Delivery Rider",
    company: "Swift Dispatch",
    location: "Lekki, Lagos",
    salary: "₦100,000/mo",
    appliedDate: "2 weeks ago",
    status: "rejected",
    type: "Full-time"
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'accepted':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} /> Accepted
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">
          <XCircle size={14} /> Rejected
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
          <Clock3 size={14} /> Pending
        </span>
      );
  }
};

export default function WorkerJobsView() {
  // Mock smart matches count (in reality, query the DB based on worker profile)
  const matchesCount = 12;

  return (
    <div className="space-y-6">
      {/* Smart Matches Banner 
      <div className="bg-[var(--ink)] text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--green)]/20 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-full bg-[var(--lime)] flex items-center justify-center text-[var(--ink)]">
            <span className="text-xl font-black">{matchesCount}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold">Smart Matches Found</h3>
            <p className="text-sm text-white/70">Employers are actively looking for your exact skills and experience.</p>
          </div>
        </div>
        <button className="relative z-10 shrink-0 h-10 px-6 rounded-lg bg-[var(--lime)] text-[var(--ink)] font-bold text-sm hover:-translate-y-0.5 transition-transform shadow-lg shadow-[var(--lime)]/10">
          View Matches
        </button>
      </div>*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">My Applications</h1>
          <p className="text-[var(--ink-soft)] mt-1">Track the status of jobs you've applied for.</p>
        </div>
        <a href="/dashboard/discover" className="self-end sm:self-auto inline-flex h-10 items-center justify-center rounded-lg bg-[var(--green)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--green)]/90 shadow-sm whitespace-nowrap shrink-0">
          Browse More Jobs
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockApplications.map((app) => (
          <div key={app.id} className="bg-white border border-[var(--line)] rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            <div className="flex gap-5 items-start sm:items-center">
              <div className="w-14 h-14 bg-[var(--canvas)] rounded-xl border border-[var(--line)] flex items-center justify-center shrink-0">
                <Building size={24} className="text-[var(--ink-soft)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition-colors">{app.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-[var(--ink-soft)] font-medium">
                  <span className="flex items-center gap-1 text-[var(--ink)]">
                    <Briefcase size={14} className="text-gray-400" />
                    {app.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {app.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Applied {app.appliedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--line)] w-full sm:w-auto">
              <StatusBadge status={app.status} />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-[var(--ink)]">{app.salary}</div>
                  <div className="text-xs text-[var(--ink-soft)] font-medium">{app.type}</div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--canvas)] hover:bg-[var(--green)] hover:text-[var(--ink)] text-[var(--ink-soft)] transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
