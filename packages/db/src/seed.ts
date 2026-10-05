import { db } from "./index";
import * as schema from "./schema";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("Seeding database...");

  // Clean up
  await db.delete(schema.placements);
  await db.delete(schema.selections);
  await db.delete(schema.hiringRequests);
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

  // Employers
  const employers = [
    { email: "employer1@staffguru.local", business: "Tech Start" },
    { email: "employer2@staffguru.local", business: "Fashion House" },
    { email: "employer3@staffguru.local", business: "PlumbCo" },
  ];

  const employerIds: string[] = [];

  for (const e of employers) {
    const [user] = await db.insert(schema.users).values({
      email: e.email,
      passwordHash: "dummy-hash",
      role: "EMPLOYER",
    }).returning();

    const [emp] = await db.insert(schema.employerProfiles).values({
      userId: user.id,
      businessName: e.business,
      location: "Lagos",
      hiringNeeds: "Looking for reliable artisans.",
    }).returning();
    employerIds.push(emp.id);
    console.log(`Created employer: ${e.email}`);
  }

  // Workers
  const categories = ["Web Developer", "Plumber", "Fashion Designer", "Electrician", "Social Media Manager"];
  const states = ["Lagos", "Abuja", "Rivers"];
  const areas = ["Yaba", "Ikeja", "Lekki", "Garki", "Wuse", "Port Harcourt"];
  const skillsPool = {
    "Web Developer": ["React", "Node.js", "TypeScript", "Next.js", "SQL", "Tailwind"],
    "Plumber": ["Pipe fitting", "Maintenance", "Water Heater", "Drainage", "Installation"],
    "Fashion Designer": ["Sewing", "Pattern Drafting", "Illustration", "Styling", "Embroidery"],
    "Electrician": ["Wiring", "Repair", "Installation", "Troubleshooting", "Generators"],
    "Social Media Manager": ["Content Creation", "Strategy", "Copywriting", "Analytics", "SEO"]
  };

  const statuses: ("APPROVED" | "PENDING" | "REJECTED")[] = ["APPROVED", "PENDING", "APPROVED", "APPROVED"]; // Biased to approved
  const availabilities: ("AVAILABLE_NOW" | "AVAILABLE_FROM" | "BUSY")[] = ["AVAILABLE_NOW", "AVAILABLE_NOW", "AVAILABLE_FROM", "BUSY"];

  for (let i = 1; i <= 50; i++) {
    const category = categories[i % categories.length] as keyof typeof skillsPool;
    const isVerified = i % 3 !== 0; // 2/3 verified
    const state = states[i % states.length];
    const area = areas[i % areas.length];
    
    // Pick 3 random skills
    const mySkills = skillsPool[category].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const [user] = await db.insert(schema.users).values({
      email: `worker${i}@staffguru.local`,
      passwordHash: "dummy-hash",
      role: "WORKER",
    }).returning();

    await db.insert(schema.workerProfiles).values({
      userId: user.id,
      category: category,
      skills: mySkills,
      experienceYears: (i % 10) + 1, // 1 to 10
      location: `${area}, ${state}`,
      locationState: state,
      locationArea: area,
      latitude: state === "Lagos" ? 6.5244 : null, // Add some coordinates for distance test
      longitude: state === "Lagos" ? 3.3792 : null,
      availabilityStatus: availabilities[i % availabilities.length],
      availableFrom: availabilities[i % availabilities.length] === "AVAILABLE_FROM" ? new Date(Date.now() + 86400000 * 7) : null,
      availability: "Full-time",
      expectedPay: 50000 + (i % 5) * 50000, // 50k to 250k
      status: statuses[i % statuses.length],
      ninVerificationStatus: isVerified ? "VERIFIED" : "PENDING",
      ninVerificationRef: isVerified ? `nin-worker${i}` : null,
    });
  }
  console.log(`Created 50 workers.`);

  // Create some specific edge case workers for seed testing
  const [perfectUser] = await db.insert(schema.users).values({ email: "perfect@staffguru.local", passwordHash: "dummy", role: "WORKER" }).returning();
  await db.insert(schema.workerProfiles).values({
    userId: perfectUser.id,
    category: "Web Developer",
    skills: ["React", "TypeScript", "Next.js"], // All required skills for the request below
    experienceYears: 5,
    location: "Yaba, Lagos",
    locationState: "Lagos",
    locationArea: "Yaba",
    latitude: 6.5244,
    longitude: 3.3792,
    availabilityStatus: "AVAILABLE_NOW",
    availability: "Full-time",
    expectedPay: 150000,
    status: "APPROVED",
    ninVerificationStatus: "VERIFIED",
    ninVerificationRef: `nin-perfect`,
  });

  const [expensiveUser] = await db.insert(schema.users).values({ email: "expensive@staffguru.local", passwordHash: "dummy", role: "WORKER" }).returning();
  await db.insert(schema.workerProfiles).values({
    userId: expensiveUser.id,
    category: "Web Developer",
    skills: ["React", "TypeScript", "Next.js"],
    experienceYears: 5,
    location: "Yaba, Lagos",
    locationState: "Lagos",
    locationArea: "Yaba",
    availabilityStatus: "AVAILABLE_NOW",
    availability: "Full-time",
    expectedPay: 800000, // Very high
    status: "APPROVED",
    ninVerificationStatus: "VERIFIED",
    ninVerificationRef: `nin-exp`,
  });

  const [underqualifiedUser] = await db.insert(schema.users).values({ email: "underqualified@staffguru.local", passwordHash: "dummy", role: "WORKER" }).returning();
  await db.insert(schema.workerProfiles).values({
    userId: underqualifiedUser.id,
    category: "Web Developer",
    skills: ["SQL"], // Only 1 required skill
    experienceYears: 1,
    location: "Abuja",
    locationState: "Abuja",
    locationArea: "Garki",
    availabilityStatus: "AVAILABLE_NOW",
    availability: "Part-time",
    expectedPay: 100000,
    status: "APPROVED",
    ninVerificationStatus: "VERIFIED",
    ninVerificationRef: `nin-und`,
  });

  // Hiring Requests
  await db.insert(schema.hiringRequests).values({
    employerId: employerIds[0],
    category: "Web Developer",
    title: "Senior Frontend Engineer",
    description: "Looking for an expert to build our new platform.",
    requiredSkills: ["React", "TypeScript", "Next.js"],
    preferredSkills: ["Tailwind", "Node.js"],
    minExperienceYears: 4,
    locationState: "Lagos",
    locationArea: "Yaba",
    engagementType: "REMOTE",
    startDate: new Date(),
    budgetMin: 100000,
    budgetMax: 200000,
    workersNeeded: 1,
    status: "OPEN",
  });

  await db.insert(schema.hiringRequests).values({
    employerId: employerIds[1],
    category: "Fashion Designer",
    title: "Expert Tailor needed",
    description: "Sewing and pattern drafting expert for our new collection.",
    requiredSkills: ["Sewing", "Pattern Drafting"],
    preferredSkills: ["Styling"],
    minExperienceYears: 3,
    locationState: "Abuja",
    locationArea: "Wuse",
    engagementType: "ONSITE",
    startDate: new Date(),
    budgetMin: 50000,
    budgetMax: 100000,
    workersNeeded: 2,
    status: "OPEN",
  });

  await db.insert(schema.hiringRequests).values({
    employerId: employerIds[2],
    category: "Plumber",
    title: "Urgent Plumber in Lekki",
    description: "Need a plumber to fix office drainage.",
    requiredSkills: ["Pipe fitting", "Drainage"],
    preferredSkills: [],
    minExperienceYears: 2,
    locationState: "Lagos",
    locationArea: "Lekki",
    engagementType: "ONSITE",
    startDate: new Date(),
    budgetMin: 20000,
    budgetMax: 40000,
    workersNeeded: 1,
    status: "OPEN",
  });

  console.log("Created hiring requests.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
