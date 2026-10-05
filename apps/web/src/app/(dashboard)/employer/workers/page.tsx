import { Search, Filter, Download, MoreVertical, MapPin, Star, ShieldCheck, Calendar } from "lucide-react";

const mockWorkers = [
  {
    id: 1,
    name: "Samuel Johnson",
    role: "Professional Driver",
    location: "Ikeja, Lagos",
    startDate: "Oct 1, 2026",
    status: "Active",
    rating: 4.9,
    pay: "₦120,000",
    avatar: "S",
    verified: true
  },
  {
    id: 2,
    name: "Grace Okafor",
    role: "Warehouse Manager",
    location: "Surulere, Lagos",
    startDate: "Sep 15, 2026",
    status: "Active",
    rating: 5.0,
    pay: "₦150,000",
    avatar: "G",
    verified: true
  },
  {
    id: 3,
    name: "David Adeleke",
    role: "Security Guard",
    location: "Lekki, Lagos",
    startDate: "Oct 3, 2026",
    status: "On Leave",
    rating: 4.7,
    pay: "₦80,000",
    avatar: "D",
    verified: false
  }
];

export default function EmployedWorkersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Employed Workers</h1>
          <p className="text-[var(--ink-soft)] mt-1">Manage your active workforce and their details.</p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--lime)] transition-colors hover:bg-[var(--ink)]/90 shadow-sm">
          <Download size={16} />
          Export List
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[var(--line)]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search workers by name or role..." 
            className="w-full pl-10 pr-4 py-2 bg-[var(--canvas)] border border-[var(--line)] rounded-lg focus:outline-none focus:border-[var(--green)] transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--line)] rounded-lg font-medium text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors">
          <Filter size={16} />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[var(--line)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--canvas)]/50 border-b border-[var(--line)] text-[var(--ink-soft)] text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Worker Details</th>
                <th className="p-4 font-semibold">Role & Location</th>
                <th className="p-4 font-semibold">Status & Pay</th>
                <th className="p-4 font-semibold">Start Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {mockWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--green)]/10 text-[var(--green)] flex items-center justify-center font-bold text-lg border border-[var(--green)]/20">
                        {worker.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                          {worker.name}
                          {worker.verified && <ShieldCheck size={14} className="text-green-600" />}
                        </div>
                        <div className="text-sm text-[var(--ink-soft)] flex items-center gap-1 mt-0.5">
                          <Star size={12} className="text-[var(--orange)] fill-[var(--orange)]" />
                          {worker.rating}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[var(--ink)]">{worker.role}</div>
                    <div className="text-sm text-[var(--ink-soft)] flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {worker.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="mb-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        worker.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {worker.status}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-[var(--ink)]">{worker.pay} / mo</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[var(--ink)] text-sm flex items-center gap-2">
                      <Calendar size={14} className="text-[var(--ink-soft)]" />
                      {worker.startDate}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
