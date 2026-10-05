"use server";

import { db, workerProfiles, employerProfiles, eq } from "@repo/db";
import { getCurrentUser } from "./auth";

export async function updateWorkerAvatar(url: string) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  const [profile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) throw new Error("Worker profile not found");

  const profileData = (profile.profileData as Record<string, any>) || {};
  profileData.avatar = url;

  await db
    .update(workerProfiles)
    .set({ profileData })
    .where(eq(workerProfiles.userId, session.userId));
}

export async function addWorkerPortfolio(urls: string[]) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  const [profile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) throw new Error("Worker profile not found");

  const profileData = (profile.profileData as Record<string, any>) || {};
  if (!profileData.samples) {
    profileData.samples = [];
  }
  
  profileData.samples = [...profileData.samples, ...urls];

  await db
    .update(workerProfiles)
    .set({ profileData })
    .where(eq(workerProfiles.userId, session.userId));
}

export async function updateEmployerLogo(url: string) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) throw new Error("Employer profile not found");

  const profileData = (profile.profileData as Record<string, any>) || {};
  profileData.logo = url;

  await db
    .update(employerProfiles)
    .set({ profileData })
    .where(eq(employerProfiles.userId, session.userId));
}

import { revalidatePath } from "next/cache";

export async function updateWorkerDetails(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  const [profile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) throw new Error("Profile not found");

  const category = formData.get("category") as string;
  const location = formData.get("location") as string;
  const experienceYears = parseInt(formData.get("experienceYears") as string || "0");
  const expectedPay = parseFloat(formData.get("expectedPay") as string || "0");
  const availabilityStatus = formData.get("availabilityStatus") as "AVAILABLE_NOW" | "BUSY";
  const availability = formData.get("availability") as string;
  
  const rawSkills = formData.get("skills") as string;
  const skills = rawSkills ? rawSkills.split(",").map(s => s.trim()).filter(Boolean) : profile.skills;

  const profileData = (profile.profileData as Record<string, any>) || {};
  profileData.fullName = formData.get("fullName") as string;
  profileData.phone = formData.get("phone") as string;
  profileData.aboutMe = formData.get("aboutMe") as string;

  await db
    .update(workerProfiles)
    .set({
      category: category || profile.category,
      location: location || profile.location,
      experienceYears: experienceYears >= 0 ? experienceYears : profile.experienceYears,
      expectedPay: expectedPay >= 0 ? expectedPay : profile.expectedPay,
      availabilityStatus: availabilityStatus || profile.availabilityStatus,
      availability: availability || profile.availability,
      skills,
      profileData,
    })
    .where(eq(workerProfiles.userId, session.userId));

  revalidatePath("/dashboard/profile");
}

export async function updateEmployerDetails(formData: FormData) {
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");

  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) throw new Error("Profile not found");

  const businessName = formData.get("businessName") as string;
  const location = formData.get("location") as string;
  const hiringNeeds = formData.get("hiringNeeds") as string;

  const profileData = (profile.profileData as Record<string, any>) || {};
  profileData.contactPhone = formData.get("contactPhone") as string;
  profileData.rcNumber = formData.get("rcNumber") as string;
  profileData.aboutCompany = formData.get("aboutCompany") as string;

  await db
    .update(employerProfiles)
    .set({
      businessName: businessName || profile.businessName,
      location: location || profile.location,
      hiringNeeds: hiringNeeds || profile.hiringNeeds,
      profileData,
    })
    .where(eq(employerProfiles.userId, session.userId));

  revalidatePath("/employer/profile");
}
