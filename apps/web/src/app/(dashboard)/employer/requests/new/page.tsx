"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { JOB_CATEGORIES } from "@repo/shared";

export default function NewHiringRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    requiredSkills: "",
    preferredSkills: "",
    minExperienceYears: 0,
    engagementType: "ONSITE",
    locationState: "",
    locationArea: "",
    startDate: "",
    budgetMin: 0,
    budgetMax: 0,
    workersNeeded: 1,
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      // Add server action or API call here
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
          preferredSkills: formData.preferredSkills.split(",").map(s => s.trim()).filter(Boolean),
          startDate: new Date(formData.startDate).toISOString(),
          minExperienceYears: Number(formData.minExperienceYears),
          budgetMin: Number(formData.budgetMin),
          budgetMax: Number(formData.budgetMax),
          workersNeeded: Number(formData.workersNeeded),
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create request");
      }
      
      const data = await res.json();
      router.push(`/employer/requests/${data.id}/matches`);
    } catch (err) {
      alert(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--ink)]">New Hiring Request</h1>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Step {step} of 3</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--line)] h-2 rounded-full mb-10 overflow-hidden">
        <div 
          className="bg-[var(--green)] h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <form onSubmit={submitForm} className="bg-white rounded-2xl border border-[var(--line)] p-8">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">The Basics</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Job Title</label>
              <input required value={formData.title} onChange={e => updateForm("title", e.target.value)} type="text" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" placeholder="e.g. Senior Frontend Developer" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Category</label>
              <select required value={formData.category} onChange={e => updateForm("category", e.target.value)} className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]">
                <option value="">Select a category</option>
                {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Description</label>
              <textarea required value={formData.description} onChange={e => updateForm("description", e.target.value)} className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)] min-h-[120px]" placeholder="Describe the role, responsibilities, and what you're looking for..." />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">Skills & Requirements</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Required Skills (comma separated)</label>
              <input required value={formData.requiredSkills} onChange={e => updateForm("requiredSkills", e.target.value)} type="text" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" placeholder="React, TypeScript, Next.js" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Preferred Skills (comma separated)</label>
              <input value={formData.preferredSkills} onChange={e => updateForm("preferredSkills", e.target.value)} type="text" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" placeholder="Node.js, Tailwind" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Minimum Experience (Years)</label>
              <input required value={formData.minExperienceYears} onChange={e => updateForm("minExperienceYears", e.target.value)} type="number" min="0" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink-soft)]">Start Date</label>
              <input required value={formData.startDate} onChange={e => updateForm("startDate", e.target.value)} type="date" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold mb-4">Logistics & Budget</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--ink-soft)]">Engagement Type</label>
                <select required value={formData.engagementType} onChange={e => updateForm("engagementType", e.target.value)} className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]">
                  <option value="ONSITE">Onsite</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--ink-soft)]">Workers Needed</label>
                <input required value={formData.workersNeeded} onChange={e => updateForm("workersNeeded", e.target.value)} type="number" min="1" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" />
              </div>
            </div>

            {formData.engagementType === "ONSITE" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--ink-soft)]">State</label>
                  <input required value={formData.locationState} onChange={e => updateForm("locationState", e.target.value)} type="text" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" placeholder="e.g. Lagos" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--ink-soft)]">Area</label>
                  <input required value={formData.locationArea} onChange={e => updateForm("locationArea", e.target.value)} type="text" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" placeholder="e.g. Yaba" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--ink-soft)]">Min Budget (₦)</label>
                <input required value={formData.budgetMin} onChange={e => updateForm("budgetMin", e.target.value)} type="number" min="0" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--ink-soft)]">Max Budget (₦)</label>
                <input required value={formData.budgetMax} onChange={e => updateForm("budgetMax", e.target.value)} type="number" min="0" className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] focus:outline-none focus:border-[var(--green)]" />
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-[var(--line)]">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 h-12 rounded-xl font-bold text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div></div>}

          <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 h-12 rounded-xl font-bold bg-[var(--ink)] text-[var(--lime)] hover:-translate-y-0.5 transition-transform shadow-lg shadow-[var(--ink)]/10 disabled:opacity-70">
            {step === 3 ? (loading ? "Submitting..." : "Find Matches") : "Next"} 
            {step === 3 ? <Check size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
