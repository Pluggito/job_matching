import { db } from "@repo/db";
import { hiringRequests } from "@repo/db/src/schema";
import { eq } from "@repo/db";
import { HiringRequestSchema } from "@repo/shared";
import { z } from "zod";

export async function createHiringRequest(employerId: string, data: z.infer<typeof HiringRequestSchema>) {
  const validated = HiringRequestSchema.parse(data);
  const [request] = await db.insert(hiringRequests).values({
    employerId,
    category: validated.category,
    title: validated.title,
    description: validated.description,
    requiredSkills: validated.requiredSkills,
    preferredSkills: validated.preferredSkills,
    minExperienceYears: validated.minExperienceYears,
    locationState: validated.locationState,
    locationArea: validated.locationArea,
    engagementType: validated.engagementType,
    startDate: validated.startDate,
    budgetMin: validated.budgetMin,
    budgetMax: validated.budgetMax,
    workersNeeded: validated.workersNeeded,
    status: "OPEN",
  }).returning();
  return request;
}

export async function getEmployerRequests(employerId: string) {
  return db.select().from(hiringRequests).where(eq(hiringRequests.employerId, employerId));
}

export async function getHiringRequest(id: string) {
  const [request] = await db.select().from(hiringRequests).where(eq(hiringRequests.id, id));
  return request;
}

export async function updateHiringRequestStatus(id: string, employerId: string, status: "OPEN" | "FILLED" | "CLOSED") {
  const [request] = await db.update(hiringRequests)
    .set({ status })
    .where(eq(hiringRequests.id, id))
    .returning();
  
  if (request?.employerId !== employerId) {
    throw new Error("Unauthorized");
  }

  return request;
}
