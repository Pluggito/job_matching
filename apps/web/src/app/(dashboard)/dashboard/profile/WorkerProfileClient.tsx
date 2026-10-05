"use client";
import { useState } from "react";
import { User, MapPin, Briefcase, Mail, Phone, Edit2, ShieldCheck, Star, Clock, DollarSign, Camera } from "lucide-react";
import Link from "next/link";
import { UploadDropzone, UploadButton } from "../../../../utils/uploadthing";
import { updateWorkerAvatar, addWorkerPortfolio } from "../../../../actions/profile";

export default function WorkerProfileClient({ profile }: { profile: any }) {
  const { worker, user } = profile;
  const profileData = (worker.profileData as Record<string, any>) || {};
  
  const [avatar, setAvatar] = useState<string | null>(profileData.avatar || null);
  const [portfolio, setPortfolio] = useState<string[]>(profileData.samples || []);
  
  const fullName = profileData.fullName || "Update your name";
  const contactPhone = profileData.phone || "+234 (0) 000 000 0000";
  const aboutMe = profileData.aboutMe || `Highly reliable professional ${worker.category} with ${worker.experienceYears} years of experience in ${worker.location}.`;
  
  const expectedPayStr = `₦${worker.expectedPay.toLocaleString()} / month`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">My Profile</h1>
        <Link href="/dashboard/profile/edit" className="flex items-center gap-2 bg-[var(--green)] hover:bg-[var(--green)]/90 text-[var(--ink)] px-4 py-2 rounded-lg font-semibold transition-colors">
          <Edit2 size={16} />
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-[var(--green)]/10 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md overflow-hidden bg-gray-100 relative group">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
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
                      setAvatar(res[0].url);
                      await updateWorkerAvatar(res[0].url);
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
              <h2 className="text-2xl font-bold text-[var(--ink)]">{fullName}</h2>
              <p className="text-[var(--ink-soft)] mt-1 text-lg">{worker.category}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-[var(--ink-soft)] text-sm whitespace-nowrap">
                  <MapPin size={16} /> {worker.location}
                </span>
                <span className="flex items-center gap-1.5 text-[var(--ink-soft)] text-sm whitespace-nowrap">
                  <Star size={16} className="text-[var(--orange)] fill-[var(--orange)]" /> 4.9 (24 reviews)
                </span>
              </div>
            </div>
            <div className="flex flex-row md:flex-col items-start md:items-end gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200 whitespace-nowrap">
                <ShieldCheck size={16} className="shrink-0" />
                {worker.ninVerificationStatus === "VERIFIED" ? "NIN Verified" : "NIN Pending"}
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 whitespace-nowrap">
                <Briefcase size={16} className="shrink-0" />
                {worker.availabilityStatus === "AVAILABLE_NOW" ? "Available Now" : "Currently Busy"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-[var(--line)]">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-4">About Me</h3>
                <p className="text-[var(--ink)] leading-relaxed">
                  {aboutMe}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill: string) => (
                    <span key={skill} className="bg-[var(--canvas)] text-[var(--ink)] px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--line)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-4">Portfolio & Work Samples</h3>
                <div className="space-y-4">
                  {portfolio.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {portfolio.map((url, i) => (
                        <div key={i} className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden border border-[var(--line)] shadow-sm group">
                          <img src={url} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      ))}
                    </div>
                  )}
                  <UploadDropzone
                    endpoint="imageUploader"
                    onClientUploadComplete={async (res) => {
                      if (res && res.length > 0) {
                        const urls = res.map((r) => r.url);
                        setPortfolio(prev => [...prev, ...urls]);
                        await addWorkerPortfolio(urls);
                      }
                    }}
                    appearance={{
                      button: "bg-[var(--ink)] text-[var(--lime)] font-bold px-4 py-2 rounded-xl text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-[var(--ink)]/10",
                      container: "border-2 border-dashed border-[var(--line)] rounded-2xl p-6 hover:bg-[var(--canvas)] transition-colors cursor-pointer group flex flex-col items-center justify-center text-center mt-2",
                      label: "text-sm font-bold text-[var(--ink)] hover:text-[var(--green)]",
                      allowedContent: "text-xs text-muted-foreground mt-1",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[var(--canvas)] rounded-xl p-5 border border-[var(--line)]">
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-4">Work Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <DollarSign size={18} className="text-[var(--green)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--ink)]">Expected Pay</p>
                      <p className="text-sm text-[var(--ink-soft)]">{expectedPayStr}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[var(--green)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--ink)]">Availability</p>
                      <p className="text-sm text-[var(--ink-soft)]">{worker.availability}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-[var(--green)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--ink)]">Experience</p>
                      <p className="text-sm text-[var(--ink-soft)]">{worker.experienceYears}+ Years</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-soft)] uppercase tracking-wider mb-3">Contact info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[var(--ink)] text-sm">
                    <Mail size={16} className="text-[var(--ink-soft)]" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-[var(--ink)] text-sm">
                    <Phone size={16} className="text-[var(--ink-soft)]" />
                    {contactPhone}
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
