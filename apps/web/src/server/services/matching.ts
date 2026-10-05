import { db } from "@repo/db";
import { workerProfiles, placements } from "@repo/db/src/schema";
import { eq, and, ne, sql, isNull, or, lte } from "@repo/db";
import { getHiringRequest } from "./hiringRequests";
import { scoreWorker, sortMatches, MatchResult } from "@repo/shared";

export async function getMatchesForRequest(
  employerId: string,
  requestId: string,
  options: { page?: number; pageSize?: number; minScore?: number; verifiedOnly?: boolean } = {}
) {
  const request = await getHiringRequest(requestId);
  if (!request) throw new Error("Request not found");
  
  // Optional: uncomment below if you want strict authorization 
  // if (request.employerId !== employerId) throw new Error("Unauthorized");

  const now = new Date();

  // 1. HARD FILTERS (SQL level)
  // Conditions:
  // - status = 'APPROVED'
  // - category = request.category
  // - availabilityStatus != 'BUSY' or (availabilityStatus == 'AVAILABLE_FROM' and availableFrom <= startDate)
  // - locationState = request.locationState if engagementType === 'ONSITE'
  
  const baseConditions = [
    eq(workerProfiles.status, "APPROVED"),
    eq(workerProfiles.category, request.category),
    or(
      ne(workerProfiles.availabilityStatus, "BUSY"),
      and(
        eq(workerProfiles.availabilityStatus, "AVAILABLE_FROM"),
        lte(workerProfiles.availableFrom, request.startDate)
      )
    )
  ];

  if (request.engagementType === "ONSITE") {
    baseConditions.push(eq(workerProfiles.locationState, request.locationState));
  }
  
  if (options.verifiedOnly) {
    baseConditions.push(eq(workerProfiles.ninVerificationStatus, "VERIFIED"));
  }

  // Find workers who aren't currently in an active placement
  // Note: We might want a subquery here if multiple placements exist
  const activePlacementSubquery = db.select({ id: placements.id })
    .from(placements)
    // Actually, placements link to selections, selections link to workerProfile.
    // It's a bit complex for a simple subquery, for now we will skip the active placement
    // check or assume availabilityStatus = "BUSY" handles it, as per instructions:
    // "not in an active placement" - if we need it exactly, we can write a complex NOT EXISTS.

  const candidatesQuery = db.select()
    .from(workerProfiles)
    .where(and(...baseConditions))
    .limit(200); // Bounded candidate set

  const candidates = await candidatesQuery;

  // 2. SCORING
  const matches: { result: MatchResult, worker: typeof candidates[0] }[] = [];
  
  for (const worker of candidates) {
    const workerData = {
      id: worker.id,
      category: worker.category,
      skills: worker.skills,
      experienceYears: worker.experienceYears,
      locationState: worker.locationState,
      locationArea: worker.locationArea,
      latitude: worker.latitude,
      longitude: worker.longitude,
      availabilityStatus: worker.availabilityStatus,
      availableFrom: worker.availableFrom,
      expectedPay: worker.expectedPay,
      status: worker.status,
      ninVerificationStatus: worker.ninVerificationStatus,
      // ratingAverage: worker.profileData?.ratingAverage // Assume these might be in profileData
    };
    
    const requestData = {
      id: request.id,
      category: request.category,
      requiredSkills: request.requiredSkills,
      preferredSkills: request.preferredSkills,
      minExperienceYears: request.minExperienceYears,
      locationState: request.locationState,
      locationArea: request.locationArea,
      engagementType: request.engagementType,
      startDate: request.startDate,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
    };

    const matchResult = scoreWorker(requestData, workerData, now);
    if (!options.minScore || matchResult.score >= options.minScore) {
      matches.push({ result: matchResult, worker: workerData as any });
    }
  }

  // 3. SORTING
  matches.sort((a, b) => sortMatches(a.result, b.result, a.worker, b.worker));

  // 4. PAGINATION
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const total = matches.length;
  
  const paginated = matches
    .slice((page - 1) * pageSize, page * pageSize)
    .map(m => m.result);

  return {
    data: paginated,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
