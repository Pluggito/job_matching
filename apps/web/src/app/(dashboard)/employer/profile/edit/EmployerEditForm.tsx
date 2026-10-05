"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEmployerDetails } from "../../../../../actions/profile";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function EmployerEditForm({ profile }: { profile: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const profileData = (profile.profileData as Record<string, any>) || {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateEmployerDetails(formData);
        router.push("/employer/profile");
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Business Name</label>
          <input 
            type="text" 
            name="businessName" 
            defaultValue={profile.businessName}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Location</label>
          <input 
            type="text" 
            name="location" 
            defaultValue={profile.location}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Contact Phone</label>
          <input 
            type="text" 
            name="contactPhone" 
            defaultValue={profileData.contactPhone || ""}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">RC Number</label>
          <input 
            type="text" 
            name="rcNumber" 
            defaultValue={profileData.rcNumber || ""}
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--ink)]">Hiring Needs (Comma separated)</label>
        <input 
          type="text" 
          name="hiringNeeds" 
          defaultValue={profile.hiringNeeds}
          required
          className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--ink)]">About Company</label>
        <textarea 
          name="aboutCompany" 
          rows={5}
          defaultValue={profileData.aboutCompany || ""}
          className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)] resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--line)]">
        <Link href="/employer/profile" className="px-6 py-3 font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
          Cancel
        </Link>
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-[var(--ink)] text-[var(--lime)] font-bold px-8 py-3 rounded-xl transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center min-w-[140px]"
        >
          {isPending ? <Loader2 size={20} className="animate-spin text-[var(--lime)]" /> : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
