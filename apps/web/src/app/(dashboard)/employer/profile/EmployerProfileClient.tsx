"use client";
import { useState } from "react";
import { Building, MapPin, Briefcase, Mail, Phone, Edit2, ShieldCheck, Camera } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "../../../../utils/uploadthing";
import { updateEmployerLogo } from "../../../../actions/profile";

export default function EmployerProfileClient({ profile }: { profile: any }) {
  const { employer, user } = profile;
  const profileData = (employer.profileData as Record<string, any>) || {};
  
  const [logo, setLogo] = useState<string | null>(profileData.logo || null);

  const hiringNeedsArray = employer.hiringNeeds ? employer.hiringNeeds.split(",").map((s: string) => s.trim()) : [];
  const contactPhone = profileData.contactPhone || "+234 (0) 000 000 0000";
  const rcNumber = profileData.rcNumber || "Not provided";
  const aboutCompany = profileData.aboutCompany || "We are a registered employer on Staff Guru looking for reliable staff.";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Company Profile</h1>
        <Link href="/employer/profile/edit" className="flex items-center gap-2 bg-[var(--green)] hover:bg-[var(--green)]/90 text-[var(--ink)] px-4 py-2 rounded-lg font-semibold transition-colors">
          <Edit2 size={16} />
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-[var(--lime)]/20 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-xl border border-[var(--line)] flex items-center justify-center shadow-sm relative group overflow-hidden">
              {logo ? (
                <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <Building size={40} className="text-[var(--green)]" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadButton
                  endpoint="imageUploader"
                  appearance={{
                    button: "w-full h-full opacity-0 absolute inset-0 cursor-pointer",
                    allowedContent: "hidden"
                  }}
                  onClientUploadComplete={async (res) => {
                    if (res?.[0]) {
                      setLogo(res[0].url);
                      await updateEmployerLogo(res[0].url);
                    }
                  }}
                />
                <Camera className="text-white pointer-events-none absolute" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pt-16 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ink)]">{employer.businessName}</h2>
              <p className="text-[var(--ink-soft)] mt-1 flex flex-wrap items-center gap-2">
                <MapPin size={16} className="shrink-0" /> {employer.location}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200 whitespace-nowrap">
              <ShieldCheck size={16} className="shrink-0" />
              Verified Employer
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-[var(--line)]">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">About Company</h3>
                <p className="text-[var(--ink)] leading-relaxed">
                  {aboutCompany}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">Hiring Needs</h3>
                <div className="flex flex-wrap gap-2">
                  {hiringNeedsArray.map((need: string) => (
                    <span key={need} className="bg-[var(--canvas)] text-[var(--ink)] px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--line)]">
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[var(--ink)]">
                    <Mail size={18} className="text-[var(--ink-soft)]" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-[var(--ink)]">
                    <Phone size={18} className="text-[var(--ink-soft)]" />
                    {contactPhone}
                  </div>
                  <div className="flex items-center gap-3 text-[var(--ink)]">
                    <Briefcase size={18} className="text-[var(--ink-soft)]" />
                    RC: {rcNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
