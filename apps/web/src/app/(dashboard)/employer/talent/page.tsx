import { db, workerProfiles, desc, sql } from "@repo/db";
import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import TalentDirectoryClient, { WorkerCardData } from "./TalentDirectoryClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find Verified Talent | Staff Guru",
  description: "Browse verified Nigerian tailors, electricians, mechanics, plumbers, and artisans.",
};

export default async function EmployerTalentDirectoryPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  // Fetch approved/registered worker profiles
  const profiles = await db
    .select({
      id: workerProfiles.id,
      category: workerProfiles.category,
      skills: workerProfiles.skills,
      experienceYears: workerProfiles.experienceYears,
      locationState: workerProfiles.locationState,
      locationArea: workerProfiles.locationArea,
      expectedPay: workerProfiles.expectedPay,
      availabilityStatus: workerProfiles.availabilityStatus,
      ninVerificationStatus: workerProfiles.ninVerificationStatus,
      profileData: workerProfiles.profileData,
    })
    .from(workerProfiles)
    .orderBy(desc(workerProfiles.experienceYears))
    .limit(50);

  const formattedWorkers: WorkerCardData[] = profiles.map((p) => {
    const data = (p.profileData as Record<string, any>) || {};
    return {
      id: p.id,
      category: p.category,
      fullName: data.fullName || p.category,
      avatar: data.avatar || null,
      experienceYears: p.experienceYears || 0,
      locationState: p.locationState || "Lagos",
      locationArea: p.locationArea || "Mainland",
      expectedPay: p.expectedPay || 50000,
      availabilityStatus: p.availabilityStatus || "AVAILABLE_NOW",
      ninVerified: p.ninVerificationStatus === "VERIFIED",
      skills: Array.isArray(p.skills) ? p.skills : [],
      rating: 5.0,
      reviewCount: 4,
    };
  });

  return <TalentDirectoryClient initialWorkers={formattedWorkers} />;
}
