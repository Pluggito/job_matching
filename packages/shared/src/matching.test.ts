import { describe, it, expect } from "vitest";
import { 
  scoreWorker, 
  MATCH_WEIGHTS, 
  MatchResult,
  HiringRequestMatchData,
  WorkerProfileMatchData,
  sortMatches,
  getDistance,
  isWorkerEligibleForErrand,
} from "./matching";

describe("Smart Matching Algorithm", () => {
  const baseRequest: HiringRequestMatchData = {
    id: "req-1",
    category: "Web Developer",
    requiredSkills: ["React", "TypeScript", "Next.js"],
    preferredSkills: ["Node.js"],
    minExperienceYears: 3,
    locationState: "Lagos",
    locationArea: "Yaba",
    engagementType: "ONSITE",
    startDate: new Date("2026-11-01"),
    budgetMin: 100000,
    budgetMax: 200000,
  };

  const baseWorker: WorkerProfileMatchData = {
    id: "worker-1",
    category: "Web Developer",
    skills: ["React", "TypeScript", "Next.js", "Node.js"],
    experienceYears: 4,
    locationState: "Lagos",
    locationArea: "Yaba",
    latitude: 6.5244,
    longitude: 3.3792,
    availabilityStatus: "AVAILABLE_NOW",
    availableFrom: null,
    expectedPay: 150000,
    status: "APPROVED",
    ninVerificationStatus: "VERIFIED",
    ratingAverage: 4.5,
    ratingCount: 10,
  };

  const now = new Date("2026-10-01");

  it("weights sum to 100", () => {
    const sum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("scores a perfect match correctly", () => {
    const result = scoreWorker(baseRequest, baseWorker, now);
    // Everything is perfect
    expect(result.breakdown.skills).toBe(MATCH_WEIGHTS.SKILLS);
    expect(result.breakdown.location).toBe(MATCH_WEIGHTS.LOCATION);
    expect(result.breakdown.experience).toBe(MATCH_WEIGHTS.EXPERIENCE);
    expect(result.breakdown.availability).toBe(MATCH_WEIGHTS.AVAILABILITY);
    expect(result.breakdown.pay).toBe(MATCH_WEIGHTS.PAY);
    expect(result.breakdown.trust).toBe(MATCH_WEIGHTS.TRUST); // 0.6 (nin) + 0.4 (rating >= 4)
    expect(result.score).toBe(100);
  });

  it("penalizes missing required skills heavily", () => {
    const poorSkillsWorker = { ...baseWorker, skills: ["React"] };
    const result = scoreWorker(baseRequest, poorSkillsWorker, now);
    expect(result.breakdown.skills).toBeLessThan(MATCH_WEIGHTS.SKILLS);
    expect(result.gap).toBe("Missing some required skills");
  });

  it("awards full location points for REMOTE jobs regardless of location", () => {
    const remoteReq = { ...baseRequest, engagementType: "REMOTE" as const };
    const farWorker = { ...baseWorker, locationState: "Kano", locationArea: "Tarauni" };
    const result = scoreWorker(remoteReq, farWorker, now);
    expect(result.breakdown.location).toBe(MATCH_WEIGHTS.LOCATION);
  });

  it("gives neutral score when pay is missing", () => {
    const noPayWorker = { ...baseWorker, expectedPay: 0 };
    const result = scoreWorker(baseRequest, noPayWorker, now);
    expect(result.breakdown.pay).toBe(MATCH_WEIGHTS.PAY * 0.8);
  });

  it("penalizes high pay expectation", () => {
    const expensiveWorker = { ...baseWorker, expectedPay: 500000 };
    const result = scoreWorker(baseRequest, expensiveWorker, now);
    expect(result.breakdown.pay).toBe(0);
    expect(result.gap).toBe("Asking above your budget");
  });

  it("sortMatches deterministic ranking", () => {
    const w1 = { ...baseWorker, id: "w1", ratingAverage: 4.5, lastActiveAt: new Date(1000) };
    const w2 = { ...baseWorker, id: "w2", ratingAverage: 4.5, lastActiveAt: new Date(2000) }; // more recent
    const r1 = scoreWorker(baseRequest, w1, now);
    const r2 = scoreWorker(baseRequest, w2, now);
    
    // Scores are equal. Should use recency tie-breaker.
    const arr = [
      { result: r1, worker: w1 },
      { result: r2, worker: w2 }
    ];
    const sorted = arr.sort((a, b) => sortMatches(a.result, b.result, a.worker, b.worker));
    expect(sorted[0]!.result.workerId).toBe("w2");
  });

  it("enforces privacy - no contact fields exist on the preview type", () => {
    const result = scoreWorker(baseRequest, baseWorker, now);
    
    // Using TS to enforce it's not possible to access name, email, phone on preview
    // @ts-expect-error
    const name = result.preview.name;
    // @ts-expect-error
    const email = result.preview.email;
    
    expect("name" in result.preview).toBe(false);
    expect("email" in result.preview).toBe(false);
    expect("phone" in result.preview).toBe(false);
  });

  describe("Errand Claim & Matching Guards (isWorkerEligibleForErrand)", () => {
    const validCandidate = {
      id: "w-100",
      openToErrands: true,
      ninVerificationStatus: "VERIFIED",
      hasActiveBankAccount: true,
      activeErrandsCount: 0,
      errandMinPayKobo: 500_000, // ₦5,000
      errandPreferredStates: ["Lagos"],
      errandPreferredAreas: ["Yaba", "Lekki"],
      errandTypes: ["pickup_delivery", "site_inspection"],
    };

    const validErrand = {
      type: "pickup_delivery",
      locationState: "Lagos",
      locationArea: "Lekki",
      budgetKobo: 1_000_000, // ₦10,000
    };

    it("should allow a fully qualified worker with an active bank account", () => {
      const res = isWorkerEligibleForErrand(validCandidate, validErrand, 2);
      expect(res.eligible).toBe(true);
    });

    it("should reject a worker who has NOT opted in to errands", () => {
      const res = isWorkerEligibleForErrand({ ...validCandidate, openToErrands: false }, validErrand, 2);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain("opted in");
    });

    it("should reject a worker without verified NIN", () => {
      const res = isWorkerEligibleForErrand({ ...validCandidate, ninVerificationStatus: "PENDING" }, validErrand, 2);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain("NIN is not verified");
    });

    it("should reject a worker without an active bank account on file", () => {
      const res = isWorkerEligibleForErrand({ ...validCandidate, hasActiveBankAccount: false }, validErrand, 2);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain("active bank account");
    });

    it("should reject a worker who has reached the active concurrency cap", () => {
      const res = isWorkerEligibleForErrand({ ...validCandidate, activeErrandsCount: 2 }, validErrand, 2);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain("maximum concurrent active errands cap");
    });

    it("should reject when errand budget is below worker minimum pay", () => {
      const lowBudgetErrand = { ...validErrand, budgetKobo: 300_000 }; // ₦3,000 < ₦5,000
      const res = isWorkerEligibleForErrand(validCandidate, lowBudgetErrand, 2);
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain("below worker minimum pay threshold");
    });
  });
});
