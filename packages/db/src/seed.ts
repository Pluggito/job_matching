import { db } from "./index";
import * as schema from "./schema";

async function main() {
  console.log("Seeding database...");

  // Clean up
  await db.delete(schema.placements);
  await db.delete(schema.selections);
  await db.delete(schema.workerProfiles);
  await db.delete(schema.employerProfiles);
  await db.delete(schema.users);

  // Admin
  const [admin] = await db.insert(schema.users).values({
    email: "admin@staffguru.local",
    passwordHash: "dummy-hash",
    role: "ADMIN",
  }).returning();
  console.log(`Created admin: ${admin.email}`);

  // Workers
  const workerData = [
    { email: "tailor@staffguru.local", category: "Tailor", skills: ["Sewing", "Pattern Drafting"], name: "Tailor" },
    { email: "electrician@staffguru.local", category: "Electrician", skills: ["Wiring", "Repair"], name: "Electrician" },
    { email: "plumber@staffguru.local", category: "Plumber", skills: ["Pipe fitting", "Maintenance"], name: "Plumber" },
    { email: "smm@staffguru.local", category: "Social Media Manager", skills: ["Content Creation", "Strategy"], name: "SMM" },
  ];

  for (const w of workerData) {
    const [user] = await db.insert(schema.users).values({
      email: w.email,
      passwordHash: "dummy-hash",
      role: "WORKER",
    }).returning();

    await db.insert(schema.workerProfiles).values({
      userId: user.id,
      category: w.category,
      skills: w.skills,
      experienceYears: 3,
      location: "Lagos",
      availability: "Full-time",
      expectedPay: 150000,
      status: "APPROVED",
      ninVerificationStatus: "VERIFIED",
      ninVerificationRef: `nin-${w.name.toLowerCase()}`,
    });
    console.log(`Created worker: ${w.email}`);
  }

  // Employers
  const employers = [
    { email: "employer1@staffguru.local", business: "Tech Start" },
    { email: "employer2@staffguru.local", business: "Fashion House" },
  ];

  for (const e of employers) {
    const [user] = await db.insert(schema.users).values({
      email: e.email,
      passwordHash: "dummy-hash",
      role: "EMPLOYER",
    }).returning();

    await db.insert(schema.employerProfiles).values({
      userId: user.id,
      businessName: e.business,
      location: "Lagos",
      hiringNeeds: "Looking for reliable artisans.",
    });
    console.log(`Created employer: ${e.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
