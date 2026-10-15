import { db } from "./index";
import * as schema from "./schema";
import { scoreWorker } from "@repo/shared";

import { isNull, eq } from "drizzle-orm";

async function verify() {
  const reqs = await db.select().from(schema.hiringRequests);
  console.log(`Found ${reqs.length} active hiring requests:\n`);

  for (const r of reqs) {
    console.log(`================================================================`);
    console.log(`📋 Hiring Request: "${r.title}" (${r.category})`);
    console.log(`📍 Location: ${r.locationArea}, ${r.locationState} | Budget: ₦${r.budgetMin.toLocaleString()} - ₦${r.budgetMax.toLocaleString()}`);
    console.log(`🎯 Required Skills: [${r.requiredSkills.join(", ")}]`);
    console.log(`⭐ Preferred Skills: [${r.preferredSkills.join(", ")}]`);
    console.log(`⏳ Min Experience: ${r.minExperienceYears} yrs`);
    console.log(`----------------------------------------------------------------`);

    const workers = await db.select().from(schema.workerProfiles);
    const categoryWorkers = workers.filter(w => 
      w.category === r.category && 
      w.status !== "REJECTED" && 
      (r.engagementType === "REMOTE" || (w.locationState && w.locationState.toLowerCase().includes(r.locationState.toLowerCase())))
    );

    const scored = categoryWorkers.map(w => {
      const match = scoreWorker({
        id: r.id,
        category: r.category,
        requiredSkills: r.requiredSkills,
        preferredSkills: r.preferredSkills,
        minExperienceYears: r.minExperienceYears,
        locationState: r.locationState,
        locationArea: r.locationArea,
        engagementType: r.engagementType,
        startDate: r.startDate,
        budgetMin: r.budgetMin,
        budgetMax: r.budgetMax,
      }, {
        id: w.id,
        category: w.category,
        skills: w.skills,
        experienceYears: w.experienceYears,
        locationState: w.locationState,
        locationArea: w.locationArea,
        latitude: w.latitude,
        longitude: w.longitude,
        availabilityStatus: w.availabilityStatus,
        availableFrom: w.availableFrom,
        expectedPay: w.expectedPay,
        status: w.status,
        ninVerificationStatus: w.ninVerificationStatus,
      }, new Date());

      return {
        name: (w.profileData as any)?.fullName || "Unknown",
        score: match.score,
        breakdown: match.breakdown,
        reasons: match.reasons,
        gap: match.gap || null,
        pay: `₦${w.expectedPay.toLocaleString()}`,
        exp: `${w.experienceYears} yrs`,
        loc: `${w.locationArea}, ${w.locationState}`,
        nin: w.ninVerificationStatus,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    for (const s of scored) {
      console.log(`⭐ ${s.score}% Match | ${s.name} (${s.loc}, ${s.exp}, ${s.pay}, NIN: ${s.nin})`);
      console.log(`   Reasons: ${s.reasons.join(" • ")}`);
      if (s.gap) {
        console.log(`   ⚠️ Gap Warning: ${s.gap}`);
      }
      console.log(``);
    }
  }

  process.exit(0);
}

verify().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
