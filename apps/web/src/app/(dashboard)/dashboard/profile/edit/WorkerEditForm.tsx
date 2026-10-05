"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkerDetails } from "../../../../../actions/profile";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function WorkerEditForm({ profile }: { profile: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const profileData = (profile.profileData as Record<string, any>) || {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateWorkerDetails(formData);
        router.push("/dashboard/profile");
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Full Name</label>
          <input 
            type="text" 
            name="fullName" 
            defaultValue={profileData.fullName || ""}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Phone Number</label>
          <input 
            type="text" 
            name="phone" 
            defaultValue={profileData.phone || ""}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Job Category</label>
          <input 
            type="text" 
            name="category" 
            defaultValue={profile.category}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Location (e.g. Ikeja, Lagos)</label>
          <input 
            type="text" 
            name="location" 
            defaultValue={profile.location}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Experience (Years)</label>
          <input 
            type="number" 
            name="experienceYears" 
            defaultValue={profile.experienceYears}
            required min="0"
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--ink)]">Expected Pay (₦ / month)</label>
          <input 
            type="number" 
            name="expectedPay" 
            defaultValue={profile.expectedPay}
            required min="0"
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--ink)]">Skills (Comma separated)</label>
        <input 
          type="text" 
          name="skills" 
          defaultValue={profile.skills.join(", ")}
          required
          className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-[var(--ink)]">About Me</label>
        <textarea 
          name="aboutMe" 
          rows={4}
          defaultValue={profileData.aboutMe || ""}
          className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)] resize-none"
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-2 flex-1">
          <label className="text-sm font-bold text-[var(--ink)]">Current Status</label>
          <select 
            name="availabilityStatus"
            defaultValue={profile.availabilityStatus}
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)] appearance-none"
          >
            <option value="AVAILABLE_NOW">Available Now</option>
            <option value="BUSY">Currently Busy</option>
          </select>
        </div>

        <div className="space-y-2 flex-1">
          <label className="text-sm font-bold text-[var(--ink)]">Availability Details</label>
          <input 
            type="text" 
            name="availability" 
            placeholder="e.g. Full-time (Mon-Sat)"
            defaultValue={profile.availability}
            required
            className="w-full border border-[var(--line)] rounded-xl px-4 py-3 bg-[var(--canvas)] outline-none focus:border-[var(--green)] transition-colors text-[var(--ink)]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--line)]">
        <Link href="/dashboard/profile" className="px-6 py-3 font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">
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
