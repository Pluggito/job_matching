"use client";
import { useState } from "react";
import { MapPin, Pencil, Check } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "../../../../utils/uploadthing";
import { updateEmployerLogo } from "../../../../actions/profile";

const EDIT_HREF = "/employer/profile/edit";

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

export default function EmployerProfileClient({ profile }: { profile: any }) {
  const { employer, user } = profile;
  const profileData = (employer.profileData as Record<string, any>) || {};

  const [logo, setLogo] = useState<string | null>(profileData.logo || profileData.avatar || null);

  const hiringNeedsArray: string[] = employer.hiringNeeds
    ? employer.hiringNeeds.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const contactPhone = profileData.contactPhone || "+234 (0) 000 000 0000";
  const rcNumber = profileData.rcNumber || "Not provided";
  const hasRc = rcNumber !== "Not provided";
  const aboutCompany = profileData.aboutCompany || "We are a registered employer on Staff Guru looking for reliable staff.";

  const initials =
    String(employer.businessName || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "?";

  const sectionHeading = "text-[22px] font-normal leading-tight text-[var(--ink)]";
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
              {logo ? (
                <img src={logo} alt="Company logo" className="h-full w-full rounded-full border border-black/10 object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-full bg-black/[0.06] text-[26px] font-medium text-black/60"
                  role="img"
                  aria-label={`${employer.businessName} initials`}
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
                        setLogo(url);
                        await updateEmployerLogo(url);
                      }
                    }
                  }}
                />
                <Pencil size={14} className="pointer-events-none relative z-0" aria-label="Update logo" />
              </div>
            </div>

            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="break-words text-[32px] font-medium leading-tight tracking-tight text-[var(--ink)] capitalize">
                  {employer.businessName}
                </h1>
                {hasRc ? (
                  <span className="group/tip relative inline-flex">
                    <span
                      tabIndex={0}
                      className="inline-flex items-center gap-1.5 text-[14px] text-[var(--ink)] outline-none focus-visible:underline"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ng)] text-white" aria-hidden="true">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                      <span className="underline underline-offset-2">RC verified</span>
                    </span>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 rounded-[12px] border border-black/15 bg-white p-3 text-[13px] leading-snug text-[var(--ink)] opacity-0 transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
                    >
                      This employer has supplied a Corporate Affairs Commission (CAC) registration (RC) number for its business.
                    </span>
                  </span>
                ) : (
                  <Link href={EDIT_HREF} className="text-[14px] text-[var(--ink)] underline underline-offset-2">
                    Add RC number
                  </Link>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-black/60">
                {employer.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} aria-hidden="true" />
                    <span>{employer.location.replace(/\s*,\s*/g, ", ")}</span>
                  </span>
                )}
                {employer.location && <span aria-hidden="true" className="text-black/30">·</span>}
                <span className="rounded-full border border-black/15 px-2.5 py-0.5 text-[12px] text-black/60">Premium Employer</span>
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

        {/* Body: narrow sidebar + main, split by a vertical rule */}
        <div className="grid grid-cols-1 border-t border-black/10 lg:grid-cols-[340px_1fr]">
          <aside
            aria-labelledby="contact-heading"
            className="border-b border-black/10 px-6 py-6 sm:px-8 lg:border-b-0 lg:border-r"
          >
            <div className="flex items-center justify-between">
              <h2 id="contact-heading" className={sectionHeading}>Contact</h2>
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
              <div className="py-3">
                <dt className={rowLabel}>Phone</dt>
                <dd className={rowValue}>
                  <a href={`tel:${String(contactPhone).replace(/[^\d+]/g, "")}`} className="underline-offset-2 hover:underline">
                    {contactPhone}
                  </a>
                </dd>
              </div>
              <div className="py-3 last:pb-0">
                <dt className={rowLabel}>Registration</dt>
                <dd className={`${rowValue} ${hasRc ? "uppercase" : "text-black/55"}`}>
                  {hasRc ? `RC ${rcNumber}` : "Not provided"}
                </dd>
              </div>
            </dl>
          </aside>

          <div className="divide-y divide-black/10">
            <section aria-labelledby="about-heading" className="px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <h2 id="about-heading" className={sectionHeading}>About</h2>
                <EditIconLink label="Edit about" />
              </div>
              <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-[var(--ink)]/85">{aboutCompany}</p>
            </section>

            <section aria-labelledby="hiring-heading" className="px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <h2 id="hiring-heading" className={sectionHeading}>Hiring needs</h2>
                <EditIconLink label="Edit hiring needs" />
              </div>
              {hiringNeedsArray.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {hiringNeedsArray.map((need) => (
                    <li
                      key={need}
                      className="cursor-default rounded-full bg-black/[0.06] px-3.5 py-1.5 text-[14px] text-[var(--ink)]"
                    >
                      {need}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[14px] text-black/55">
                  No hiring needs listed yet.{" "}
                  <Link href={EDIT_HREF} className="text-[var(--ng)] underline underline-offset-2">
                    Add roles you hire for
                  </Link>
                  .
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
