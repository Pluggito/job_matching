"use server";

import { db, workerProfiles, employerProfiles, eq } from "@repo/db";
import { getSession } from "../lib/auth";
import { revalidatePath } from "next/cache";

export async function saveOnboardingData(role: string, data: any) {
  const session = await getSession();
  
  if (!session || !session.userId) {
    throw new Error("Unauthorized");
  }

  const userId = session.userId;

  try {
    if (role === "EMPLOYER") {
      // Check if employer profile exists
      const existing = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId));
      
      if (existing.length > 0) {
        await db.update(employerProfiles)
          .set({
            businessName: data.businessName || "Unknown",
            location: data.location || "Unknown",
            hiringNeeds: data.staffType || "General",
            profileData: data
          })
          .where(eq(employerProfiles.userId, userId));
      } else {
        await db.insert(employerProfiles).values({
          userId: userId,
          businessName: data.businessName || "Unknown",
          location: data.location || "Unknown",
          hiringNeeds: data.staffType || "General",
          profileData: data
        });
      }
    } else {
      // Worker profile
      const existing = await db.select().from(workerProfiles).where(eq(workerProfiles.userId, userId));
      
      if (existing.length > 0) {
        await db.update(workerProfiles)
          .set({
            category: data.jobType || "General Worker",
            skills: [data.jobType || "General"],
            experienceYears: data.experience ? parseInt(data.experience) : 0,
            location: data.address || "Unknown",
            availability: "Immediate",
            expectedPay: data.amount ? parseFloat(data.amount.replace(/,/g, '')) : 0,
            ninVerificationStatus: "PENDING",
            profileData: data
          })
          .where(eq(workerProfiles.userId, userId));
      } else {
        await db.insert(workerProfiles).values({
          userId: userId,
          category: data.jobType || "General Worker",
          skills: [data.jobType || "General"],
          experienceYears: data.experience ? parseInt(data.experience) : 0,
          location: data.address || "Unknown",
          availability: "Immediate",
          expectedPay: data.amount ? parseFloat(data.amount.replace(/,/g, '')) : 0,
          ninVerificationStatus: "PENDING",
          profileData: data
        });
      }
    }
    
    revalidatePath("/jobs/search");
    return { success: true };
  } catch (error) {
    console.error("Failed to save onboarding data:", error);
    return { success: false, error: "Failed to save profile" };
  }
}
