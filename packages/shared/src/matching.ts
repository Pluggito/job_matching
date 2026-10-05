export type HiringRequestMatchData = {
  id: string;
  category: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  locationState: string;
  locationArea: string;
  engagementType: "ONSITE" | "REMOTE";
  startDate: Date;
  budgetMin: number;
  budgetMax: number;
};

export type WorkerProfileMatchData = {
  id: string;
  category: string;
  skills: string[];
  experienceYears: number;
  locationState: string | null;
  locationArea: string | null;
  latitude: number | null;
  longitude: number | null;
  availabilityStatus: "AVAILABLE_NOW" | "AVAILABLE_FROM" | "BUSY";
  availableFrom: Date | null;
  expectedPay: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  ninVerificationStatus: string;
  ratingAverage?: number;
  ratingCount?: number;
  lastActiveAt?: Date; // For tie-breaking
};

export type MatchResult = {
  workerId: string;
  score: number; // 0-100
  breakdown: {
    skills: number;
    location: number;
    experience: number;
    availability: number;
    pay: number;
    trust: number;
  };
  reasons: string[];
  gap?: string;
  // Public preview fields (no PII)
  preview: {
    category: string;
    skills: string[];
    experienceYears: number;
    locationState: string | null;
    locationArea: string | null;
    availabilityStatus: "AVAILABLE_NOW" | "AVAILABLE_FROM" | "BUSY";
    isVerified: boolean;
    rating?: number;
  };
};

export const MATCH_WEIGHTS = {
  SKILLS: 40,
  LOCATION: 20,
  EXPERIENCE: 15,
  AVAILABILITY: 10,
  PAY: 10,
  TRUST: 5,
};

// Haversine distance in km
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function scoreWorker(request: HiringRequestMatchData, worker: WorkerProfileMatchData, now: Date): MatchResult {
  let score = 0;
  const breakdown = { skills: 0, location: 0, experience: 0, availability: 0, pay: 0, trust: 0 };
  const reasons: string[] = [];
  let gap: string | undefined;

  // 1. Skills (Max 40)
  // Required skills are worth 80% of the skills score, preferred 20%
  const workerSkillsLower = worker.skills.map(s => s.toLowerCase());
  const requiredCount = request.requiredSkills.length;
  let requiredMatched = 0;
  request.requiredSkills.forEach(req => {
    if (workerSkillsLower.includes(req.toLowerCase())) requiredMatched++;
  });
  
  const preferredCount = request.preferredSkills.length;
  let preferredMatched = 0;
  request.preferredSkills.forEach(pref => {
    if (workerSkillsLower.includes(pref.toLowerCase())) preferredMatched++;
  });

  const requiredScore = requiredCount > 0 ? (requiredMatched / requiredCount) * (MATCH_WEIGHTS.SKILLS * 0.8) : (MATCH_WEIGHTS.SKILLS * 0.8);
  const preferredScore = preferredCount > 0 ? (preferredMatched / preferredCount) * (MATCH_WEIGHTS.SKILLS * 0.2) : (MATCH_WEIGHTS.SKILLS * 0.2);
  
  breakdown.skills = requiredScore + preferredScore;
  score += breakdown.skills;

  if (requiredCount > 0) {
    if (requiredMatched === requiredCount) {
      reasons.push(`Has all ${requiredCount} required skills`);
    } else if (requiredMatched > 0) {
      reasons.push(`Has ${requiredMatched} of ${requiredCount} required skills`);
      gap = `Missing some required skills`;
    } else {
      gap = `Missing required skills`;
    }
  }

  // 2. Location (Max 20)
  if (request.engagementType === "REMOTE") {
    breakdown.location = MATCH_WEIGHTS.LOCATION;
    reasons.push("Available for remote work");
  } else {
    // Both have coords? Use distance
    // Else fallback to string matching
    if (request.locationState.toLowerCase() === worker.locationState?.toLowerCase()) {
      if (request.locationArea.toLowerCase() === worker.locationArea?.toLowerCase()) {
        breakdown.location = MATCH_WEIGHTS.LOCATION;
        reasons.push(`Same area (${worker.locationArea})`);
      } else {
        breakdown.location = MATCH_WEIGHTS.LOCATION * 0.5; // Same state, diff area
        reasons.push(`Same state (${worker.locationState})`);
      }
    } else {
      breakdown.location = 0;
      if (!gap) gap = `Different state (${worker.locationState})`;
    }
  }
  score += breakdown.location;

  // 3. Experience (Max 15)
  if (worker.experienceYears >= request.minExperienceYears) {
    breakdown.experience = MATCH_WEIGHTS.EXPERIENCE;
    if (worker.experienceYears > request.minExperienceYears + 2) {
      reasons.push(`Highly experienced (${worker.experienceYears} yrs)`);
    } else {
      reasons.push(`Meets experience requirement`);
    }
  } else {
    const ratio = Math.max(0, worker.experienceYears / request.minExperienceYears);
    breakdown.experience = MATCH_WEIGHTS.EXPERIENCE * ratio;
    if (!gap) gap = `Slightly less experience (${worker.experienceYears} yrs vs ${request.minExperienceYears} yrs required)`;
  }
  score += breakdown.experience;

  // 4. Availability (Max 10)
  if (worker.availabilityStatus === "AVAILABLE_NOW") {
    breakdown.availability = MATCH_WEIGHTS.AVAILABILITY;
    reasons.push("Available now");
  } else if (worker.availabilityStatus === "AVAILABLE_FROM" && worker.availableFrom) {
    if (worker.availableFrom <= request.startDate) {
      breakdown.availability = MATCH_WEIGHTS.AVAILABILITY;
      reasons.push("Available by start date");
    } else {
      breakdown.availability = 0; // Pre-filter should usually catch this, but just in case
      if (!gap) gap = "Not available by start date";
    }
  } else {
    breakdown.availability = 0;
  }
  score += breakdown.availability;

  // 5. Pay Fit (Max 10)
  if (!worker.expectedPay) {
    breakdown.pay = MATCH_WEIGHTS.PAY * 0.8; // Neutral score for missing data
  } else {
    if (worker.expectedPay <= request.budgetMax) {
      breakdown.pay = MATCH_WEIGHTS.PAY;
      reasons.push("Within your budget");
    } else if (worker.expectedPay <= request.budgetMax * 1.2) {
      breakdown.pay = MATCH_WEIGHTS.PAY * 0.5;
      if (!gap) gap = "Slightly above budget";
    } else {
      breakdown.pay = 0;
      if (!gap) gap = "Asking above your budget";
    }
  }
  score += breakdown.pay;

  // 6. Trust Signals (Max 5)
  const isVerified = worker.ninVerificationStatus === "VERIFIED";
  if (isVerified) {
    breakdown.trust += MATCH_WEIGHTS.TRUST * 0.6;
    reasons.push("NIN Verified");
  }
  if (worker.ratingAverage && worker.ratingAverage >= 4.0) {
    breakdown.trust += MATCH_WEIGHTS.TRUST * 0.4;
    reasons.push(`Highly rated (${worker.ratingAverage}★)`);
  } else if (!worker.ratingAverage) {
    breakdown.trust += MATCH_WEIGHTS.TRUST * 0.4; // Neutral for new workers
  }
  score += breakdown.trust;

  return {
    workerId: worker.id,
    score: Math.round(score),
    breakdown,
    reasons: reasons.slice(0, 4), // max 4 reasons for UI
    gap,
    preview: {
      category: worker.category,
      skills: worker.skills,
      experienceYears: worker.experienceYears,
      locationState: worker.locationState,
      locationArea: worker.locationArea,
      availabilityStatus: worker.availabilityStatus,
      isVerified,
      rating: worker.ratingAverage,
    }
  };
}

export function sortMatches(a: MatchResult, b: MatchResult, aWorker: WorkerProfileMatchData, bWorker: WorkerProfileMatchData): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  // Tie-breaker 1: Rating
  const aRating = aWorker.ratingAverage || 0;
  const bRating = bWorker.ratingAverage || 0;
  if (bRating !== aRating) {
    return bRating - aRating;
  }
  // Tie-breaker 2: Recency (last active)
  const aTime = aWorker.lastActiveAt?.getTime() || 0;
  const bTime = bWorker.lastActiveAt?.getTime() || 0;
  if (bTime !== aTime) {
    return bTime - aTime;
  }
  // Tie-breaker 3: ID string comparison for stable sorting
  return a.workerId.localeCompare(b.workerId);
}
