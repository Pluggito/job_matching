import { db } from "./index";
import * as schema from "./schema";
import { DEFAULT_PLATFORM_SETTINGS } from "@repo/shared";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL: Seed script cannot be run in production environment.");
    process.exit(1);
  }

  console.log("Cleaning and initializing Staff Guru database with platform settings...");

  // Clean up all tables in reverse dependency order
  await db.delete(schema.auditLogs);
  await db.delete(schema.ratings);
  await db.delete(schema.removalNotices);
  await db.delete(schema.replacementRequests);
  await db.delete(schema.placements);
  await db.delete(schema.payouts);
  await db.delete(schema.webhookEvents);
  await db.delete(schema.paymentEvents);
  await db.delete(schema.payments);
  await db.delete(schema.quotes);
  await db.delete(schema.errandMessages);
  await db.delete(schema.errandThreads);
  await db.delete(schema.errandProofs);
  await db.delete(schema.errandDisputes);
  await db.delete(schema.errandOffers);
  await db.delete(schema.errands);
  await db.delete(schema.platformSettings);
  await db.delete(schema.selections);
  await db.delete(schema.hiringRequests);
  await db.delete(schema.shortlistItems);
  await db.delete(schema.shortlists);
  await db.delete(schema.messages);
  await db.delete(schema.threads);
  await db.delete(schema.notifications);
  await db.delete(schema.portfolioItems);
  await db.delete(schema.workerBankAccounts);
  await db.delete(schema.adminInvites);
  await db.delete(schema.adminProfiles);
  await db.delete(schema.workerProfiles);
  await db.delete(schema.employerProfiles);
  await db.delete(schema.users);

  console.log("Database cleared. Zero mock users, employers, workers, or admins remain.");

  // Platform Settings: Seeded with labelled placeholders (zero hardcoded admin dependency)
  for (const s of DEFAULT_PLATFORM_SETTINGS) {
    await db.insert(schema.platformSettings).values({
      key: s.key,
      value: s.value,
      label: s.label,
      description: s.description,
      updatedBy: null,
    });
  }
  console.log(`✅ Seeded ${DEFAULT_PLATFORM_SETTINGS.length} platform settings with labelled placeholders.`);

  console.log("\nSetup complete. Ready for real user onboarding testing (clean slate).");
  process.exit(0);
}

main().catch((err) => {
  console.error("Initialization failed:", err);
  process.exit(1);
});
