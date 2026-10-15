"use client";
import { useState } from "react";
import { MapPin, Pencil, Check, Upload } from "lucide-react";
import Link from "next/link";
import { UploadButton, UploadDropzone } from "../../../../utils/uploadthing";
import { updateWorkerAvatar, addWorkerPortfolio } from "../../../../actions/profile";

const EDIT_HREF = "/dashboard/profile/edit";

function EditIconLink({ label }: { label: string }) {
  return (
    <Link
      href={EDIT_HREF}
      aria-label={label}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--ng)] text-[var(--ng)] transition-colors hover:bg-[var(--ng)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ng)]"
    >
      <Pencil size={15} aria-hidden="true" />
    </Link>
  );
}

export default function WorkerProfileClient({ profile }: { profile: any }) {
  const { worker, user } = profile;
  const profileData = (worker.profileData as Record<string, any>) || {};
  
  const [avatar, setAvatar] = useState<string | null>(profileData.avatar || null);
  const [portfolio, setPortfolio] = useState<string[]>(profileData.samples || []);
  
  const fullName = profileData.fullName || "Update your name";
  const contactPhone = profileData.phone || "+234 (0) 000 000 0000";
  const aboutMe = profileData.aboutMe || ""; // Empty by default now
  
  const expectedPayStr = `₦${worker.expectedPay.toLocaleString()} / month`;

  const initials =
    String(fullName)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "?";

  const sectionHeading = "text-[22px] font-semibold leading-tight text-[var(--ink)]";
  const rowLabel = "text-[13px] text-black/55";
  const rowValue = "mt-0.5 text-[15px] text-[var(--ink)] break-words";

  return (
    <div className="mx-auto w-full max-w-[1100px] pb-12">
      <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white">
        {/* Header */}
        <header className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="flex min-w-0 items-start gap-5">
            {/* Avatar with edit badge */}
            <div className="relative h-[84px] w-[84px] shrink-0">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-full w-full rounded-full border border-black/10 object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full bg-black/[0.06] text-[26px] font-medium text-black/60"
                  role="img"
                  aria-label={`${fullName} initials`}
                >
                  {initials}
                </div>
              )}
              <span
                className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--ng)]"
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--ng)] bg-white text-[var(--ng)] focus-within:outline focus-within:outline-2 focus-within:outline-[var(--ng)]">
                <UploadButton
                  endpoint="imageUploader"
                  appearance={{
                    container: "absolute inset-0 w-full h-full z-10",
                    button: "w-full h-full opacity-0 absolute inset-0 cursor-pointer",
                    allowedContent: "hidden",
                  }}
                  onClientUploadComplete={async (res) => {
                    if (res?.[0]) {
                      const url = res[0].url || (res[0] as any).ufsUrl;
                      if (url) {
                        setAvatar(url);
                        await updateWorkerAvatar(url);
                      }
                    }
                  }}
                />
                <Pencil size={14} className="pointer-events-none relative z-0" aria-label="Update avatar" />
              </div>
            </div>

            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="break-words text-[32px] font-medium leading-tight tracking-tight text-[var(--ink)] capitalize">
                  {fullName}
                </h1>
                {worker.ninVerificationStatus === "VERIFIED" ? (
                  <span className="group/tip relative inline-flex">
                    <span
                      tabIndex={0}
                      className="inline-flex items-center gap-1.5 text-[14px] text-[var(--ink)] outline-none focus-visible:underline"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ng)] text-white" aria-hidden="true">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                      <span className="underline underline-offset-2">NIN verified</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-[14px] text-black/55">NIN pending</span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-black/60">
                <span className="text-[14px] font-medium text-[var(--ink)]">{worker.category}</span>
                <span aria-hidden="true" className="text-black/30">·</span>
                {worker.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} aria-hidden="true" />
                    <span>{worker.location}</span>
                  </span>
                )}
                {worker.location && <span aria-hidden="true" className="text-black/30">·</span>}
                <span className="inline-flex items-center gap-1.5">
                   <span className="font-semibold text-[var(--ink)]">4.9</span> (24 reviews)
                </span>
                <span aria-hidden="true" className="text-black/30">·</span>
                <span className="rounded-full border border-black/15 px-2.5 py-0.5 text-[12px] text-black/60">
                  {worker.availabilityStatus === "AVAILABLE_NOW" ? "Available now" : "Currently busy"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={EDIT_HREF}
            className="inline-flex shrink-0 items-center justify-center self-start rounded-full bg-[var(--ng)] px-5 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--ng-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ng)]"
          >
            Edit profile
          </Link>
        </header>

        {/* Body: main + narrow sidebar, split by a vertical rule */}
        <div className="grid grid-cols-1 border-t border-black/10 lg:grid-cols-[1fr_340px]">
          
          <div className="divide-y divide-black/10 lg:border-r border-black/10">
            <section aria-labelledby="about-heading" className="px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <h2 id="about-heading" className={sectionHeading}>About</h2>
                <EditIconLink label="Edit about" />
              </div>
              {aboutMe ? (
                <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-[var(--ink)]/85">{aboutMe}</p>
              ) : (
                <p className="mt-4 text-[14px] text-black/55">
                  No bio written yet.{" "}
                  <Link href={EDIT_HREF} className="text-[var(--ng)] underline underline-offset-2">
                    Write a short bio about yourself
                  </Link>
                  .
                </p>
              )}
            </section>

            <section aria-labelledby="skills-heading" className="px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <h2 id="skills-heading" className={sectionHeading}>Skills</h2>
                <EditIconLink label="Edit skills" />
              </div>
              {worker.skills && worker.skills.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {worker.skills.map((skill: string) => (
                    <li
                      key={skill}
                      className="cursor-default rounded-full bg-black/[0.06] px-3.5 py-1.5 text-[14px] text-[var(--ink)]"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[14px] text-black/55">
                  No skills listed yet.{" "}
                  <Link href={EDIT_HREF} className="text-[var(--ng)] underline underline-offset-2">
                    Add your key skills
                  </Link>
                  .
                </p>
              )}
            </section>

            <section aria-labelledby="portfolio-heading" className="px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <h2 id="portfolio-heading" className={sectionHeading}>Portfolio</h2>
              </div>
              <div className="mt-4">
                {portfolio.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {portfolio.map((url, i) => (
                      <div key={i} className="relative w-32 h-32 shrink-0 rounded-[12px] overflow-hidden border border-black/10">
                        <img src={url} alt={`Portfolio ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="relative w-32 h-32 shrink-0 rounded-[12px] overflow-hidden border border-black/10 bg-black/[0.02] flex items-center justify-center">
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={async (res) => {
                          if (res && res.length > 0) {
                            const urls = res.map((r) => r.url);
                            setPortfolio(prev => [...prev, ...urls]);
                            await addWorkerPortfolio(urls);
                          }
                        }}
                        appearance={{
                          container: "absolute inset-0 w-full h-full",
                          button: "w-full h-full opacity-0 absolute inset-0 cursor-pointer",
                          allowedContent: "hidden",
                        }}
                      />
                      <span className="text-[12px] font-medium text-[var(--ink)]/60 pointer-events-none text-center px-2">
                        Add more
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-black/15 bg-black/[0.02] p-8 text-center relative">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={async (res) => {
                        if (res && res.length > 0) {
                          const urls = res.map((r) => r.url);
                          setPortfolio(prev => [...prev, ...urls]);
                          await addWorkerPortfolio(urls);
                        }
                      }}
                      appearance={{
                        container: "absolute inset-0 w-full h-full z-10",
                        button: "w-full h-full opacity-0 absolute inset-0 cursor-pointer",
                        allowedContent: "hidden",
                      }}
                    />
                    <div className="pointer-events-none relative z-0 flex flex-col items-center">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ng)]/10 text-[var(--ng)]">
                        <Upload size={18} />
                      </div>
                      <p className="text-[14px] font-medium text-[var(--ink)]">Add work samples</p>
                      <p className="mt-1 text-[13px] text-black/55">Upload photos of your past jobs</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside
            aria-labelledby="preferences-heading"
            className="px-6 py-6 sm:px-8 border-t border-black/10 lg:border-t-0"
          >
            <div className="flex items-center justify-between">
              <h2 id="preferences-heading" className={sectionHeading}>Work preferences</h2>
              <EditIconLink label="Edit work preferences" />
            </div>
            <dl className="mt-4 divide-y divide-black/10">
              <div className="py-3 first:pt-0">
                <dt className={rowLabel}>Expected pay</dt>
                <dd className={rowValue}>{expectedPayStr}</dd>
              </div>
              <div className="py-3">
                <dt className={rowLabel}>Availability</dt>
                <dd className={rowValue}>{worker.availability}</dd>
              </div>
              <div className="py-3">
                <dt className={rowLabel}>Experience</dt>
                <dd className={rowValue}>{worker.experienceYears}+ Years</dd>
              </div>
            </dl>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-black/10">
              <h2 className={sectionHeading}>Contact info</h2>
              <EditIconLink label="Edit contact details" />
            </div>
            <dl className="mt-4 divide-y divide-black/10">
              <div className="py-3 first:pt-0">
                <dt className={rowLabel}>Email</dt>
                <dd className={rowValue}>
                  <a href={`mailto:${user.email}`} className="break-all underline-offset-2 hover:underline">
                    {user.email}
                  </a>
                </dd>
              </div>
              <div className="py-3 last:pb-0">
                <dt className={rowLabel}>Phone</dt>
                <dd className={rowValue}>
                  <a href={`tel:${String(contactPhone).replace(/[^\d+]/g, "")}`} className="underline-offset-2 hover:underline">
                    {contactPhone}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-black/10">
              <h2 className={sectionHeading}>Bank account on file</h2>
              <Link
                href="/dashboard/profile/bank"
                aria-label="Manage bank account on file"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--ng)] text-[var(--ng)] transition-colors hover:bg-[var(--ng)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ng)]"
              >
                <Pencil size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-3">
              <p className="text-[13px] text-black/60 leading-relaxed">
                Used exclusively for Alabaru errand payouts. Bank details are strictly confidential and never shared with employers.
              </p>
              <Link
                href="/dashboard/profile/bank"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ng)] hover:underline"
              >
                Manage bank account →
              </Link>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
