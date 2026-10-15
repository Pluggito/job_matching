import { db } from "./index";
import * as schema from "./schema";
import { eq, sql } from "drizzle-orm";

const PASSWORD_HASH = "$2b$10$6yyejFSRBbSHOagZucu2neWyxdhPu0GWOBRv3PmmZtibIQllHeL5C"; // "Password123!"

async function seed() {
  console.log("🌱 Starting Smart Match test users seed...");

  // 1. Check or create Super Admin if not present
  const adminEmail = "pluggitoshfl5050@gmail.com";
  let [adminUser] = await db.select().from(schema.users).where(eq(schema.users.email, adminEmail)).limit(1);
  if (!adminUser) {
    [adminUser] = await db.insert(schema.users).values({
      email: adminEmail,
      passwordHash: PASSWORD_HASH,
      role: "ADMIN",
    }).returning();
    console.log(`Created Super Admin user (${adminEmail})`);
  }

  // Ensure Admin Profile exists
  const [adminProfile] = await db.select().from(schema.adminProfiles).where(eq(schema.adminProfiles.userId, adminUser.id)).limit(1);
  if (!adminProfile) {
    await db.insert(schema.adminProfiles).values({
      userId: adminUser.id,
      displayName: "Super Admin",
      phone: "+2348000000001",
      department: "Management",
    });
  }

  // 2. Define Employers
  const employersData = [
    {
      email: "employer.test@staffguru.com",
      fullName: "Adebayo Adewale",
      businessName: "Zenith Garments & Lifestyle Ltd",
      phone: "+2348031234567",
      location: "Ikeja, Lagos",
      hiringNeeds: "Fashion, Tailoring & Textile",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      aboutCompany: "Zenith Garments is a premier fashion house and bespoke tailoring studio in Ikeja, producing premium menswear and womenswear.",
      rcNumber: "RC-1849204",
      request: {
        category: "Fashion, Tailoring & Textile",
        title: "Master Fashion Designer & Pattern Maker",
        description: "Seeking an experienced pattern cutter and industrial tailor to lead our bespoke cutting and garment assembly team.",
        requiredSkills: ["Pattern Making", "Industrial Sewing", "Cutting"],
        preferredSkills: ["Corset Making", "Bridal Wear"],
        minExperienceYears: 3,
        locationState: "Lagos",
        locationArea: "Ikeja",
        engagementType: "ONSITE" as const,
        budgetMin: 120000,
        budgetMax: 180000,
        workersNeeded: 2,
      }
    },
    {
      email: "apex.employer@staffguru.com",
      fullName: "Chief Folake Balogun",
      businessName: "Apex Logistics & Executive Suites",
      phone: "+2348039998877",
      location: "Victoria Island, Lagos",
      hiringNeeds: "Transport & Driving",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      aboutCompany: "Apex Logistics provides executive luxury mobility, VIP concierge, and corporate transport services across Lagos.",
      rcNumber: "RC-928374",
      request: {
        category: "Transport & Driving",
        title: "Executive Corporate Driver",
        description: "Looking for a punctual, defensive corporate driver with full familiarity with Lagos Island, Lekki, and Mainland routes.",
        requiredSkills: ["Defensive Driving", "Lagos Route Mastery", "Manual & Automatic"],
        preferredSkills: ["Vehicle Maintenance", "First Aid"],
        minExperienceYears: 4,
        locationState: "Lagos",
        locationArea: "Victoria Island",
        engagementType: "ONSITE" as const,
        budgetMin: 120000,
        budgetMax: 170000,
        workersNeeded: 1,
      }
    }
  ];

  for (const emp of employersData) {
    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, emp.email)).limit(1);
    if (!user) {
      [user] = await db.insert(schema.users).values({
        email: emp.email,
        passwordHash: PASSWORD_HASH,
        role: "EMPLOYER",
      }).returning();
    }

    let [empProfile] = await db.select().from(schema.employerProfiles).where(eq(schema.employerProfiles.userId, user.id)).limit(1);
    const profilePayload = {
      fullName: emp.fullName,
      businessName: emp.businessName,
      phone: emp.phone,
      contactPhone: emp.phone,
      location: emp.location,
      avatar: emp.avatar,
      logo: emp.avatar,
      aboutCompany: emp.aboutCompany,
      rcNumber: emp.rcNumber,
    };

    if (!empProfile) {
      [empProfile] = await db.insert(schema.employerProfiles).values({
        userId: user.id,
        businessName: emp.businessName,
        location: emp.location,
        hiringNeeds: emp.hiringNeeds,
        profileData: profilePayload,
      }).returning();
    } else {
      await db.update(schema.employerProfiles).set({
        businessName: emp.businessName,
        location: emp.location,
        hiringNeeds: emp.hiringNeeds,
        profileData: profilePayload,
      }).where(eq(schema.employerProfiles.id, empProfile.id));
    }

    // Seed Hiring Request for employer
    const existingReq = await db.select().from(schema.hiringRequests).where(eq(schema.hiringRequests.employerId, empProfile.id)).limit(1);
    if (existingReq.length === 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);

      await db.insert(schema.hiringRequests).values({
        employerId: empProfile.id,
        category: emp.request.category,
        title: emp.request.title,
        description: emp.request.description,
        requiredSkills: emp.request.requiredSkills,
        preferredSkills: emp.request.preferredSkills,
        minExperienceYears: emp.request.minExperienceYears,
        locationState: emp.request.locationState,
        locationArea: emp.request.locationArea,
        engagementType: emp.request.engagementType,
        startDate: startDate,
        budgetMin: emp.request.budgetMin,
        budgetMax: emp.request.budgetMax,
        budgetMinKobo: emp.request.budgetMin * 100,
        budgetMaxKobo: emp.request.budgetMax * 100,
        workersNeeded: emp.request.workersNeeded,
        status: "OPEN",
      });
      console.log(`✅ Created Hiring Request "${emp.request.title}" for ${emp.businessName}`);
    }
  }

  // 3. Define Workers with Diverse Smart Match Profiles
  const workersData = [
    // --- Cluster 1: Tailoring & Textile ---
    {
      email: "tailor.worker@staffguru.com",
      fullName: "Chinedu Okafor",
      phone: "+2348029876543",
      category: "Fashion, Tailoring & Textile",
      skills: ["Tailoring", "Pattern Making", "Industrial Machine", "Cutting", "Corset Making", "Freehand Cutting", "Bridal Wear"],
      experienceYears: 6,
      location: "14 Allen Avenue, Ikeja, Lagos",
      locationState: "Lagos",
      locationArea: "Ikeja",
      expectedPay: 140000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "VERIFIED",
      status: "APPROVED" as const,
      openToErrands: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Master tailor and pattern drafter with 6 years experience in bespoke and industrial garment construction.",
      empName: "Vogue Apparel Nigeria",
      empRole: "Lead Pattern Cutter",
      empDuration: "3 years",
    },
    {
      email: "amina.tailor@staffguru.com",
      fullName: "Amina Yusuf",
      phone: "+2348035551234",
      category: "Fashion, Tailoring & Textile",
      skills: ["Tailoring", "Pattern Making", "Cutting", "Alterations"],
      experienceYears: 4,
      location: "Adeniran Ogunsanya, Surulere, Lagos",
      locationState: "Lagos",
      locationArea: "Surulere",
      expectedPay: 140000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "VERIFIED",
      status: "APPROVED" as const,
      openToErrands: false,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Dedicated fashion designer skilled in pattern cutting, industrial sewing machines, and custom fitting.",
      empName: "Surulere Haute Couture",
      empRole: "Senior Seamstress",
      empDuration: "4 years",
    },
    {
      email: "babatunde.tailor@staffguru.com",
      fullName: "Babatunde Adeleke",
      phone: "+2348087779911",
      category: "Fashion, Tailoring & Textile",
      skills: ["Tailoring", "Industrial Machine", "Cutting", "Garment Assembly"],
      experienceYears: 3,
      location: "Commercial Avenue, Yaba, Lagos",
      locationState: "Lagos",
      locationArea: "Yaba",
      expectedPay: 125000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "PENDING",
      status: "APPROVED" as const,
      openToErrands: false,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Punctual tailor specializing in mass garment production, cutting, and finishing.",
      empName: "Yaba Textile Hub",
      empRole: "Production Tailor",
      empDuration: "3 years",
    },
    {
      email: "blessing.tailor@staffguru.com",
      fullName: "Blessing Okon",
      phone: "+2348091113344",
      category: "Fashion, Tailoring & Textile",
      skills: ["Cutting", "Seamstress", "Beading & Embroidery"],
      experienceYears: 2,
      location: "Agric, Ikorodu, Lagos",
      locationState: "Lagos",
      locationArea: "Ikorodu",
      expectedPay: 190000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "PENDING",
      status: "APPROVED" as const,
      openToErrands: false,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Creative apparel maker with flair for embellishments, beading, and custom traditional designs.",
      empName: "Glamour Stitches",
      empRole: "Junior Tailor",
      empDuration: "2 years",
    },

    // --- Cluster 2: Transport & Driving ---
    {
      email: "sunday.driver@staffguru.com",
      fullName: "Sunday Eze",
      phone: "+2348023334455",
      category: "Transport & Driving",
      skills: ["Defensive Driving", "Lagos Route Mastery", "Manual & Automatic", "Vehicle Maintenance", "First Aid"],
      experienceYears: 7,
      location: "Ahmadu Bello Way, Victoria Island, Lagos",
      locationState: "Lagos",
      locationArea: "Victoria Island",
      expectedPay: 140000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "VERIFIED",
      status: "APPROVED" as const,
      openToErrands: true,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Accident-free executive chauffeur with 7 years navigating Lagos Mainland, Island, and airport protocol.",
      empName: "Prime Chauffeurs Lagos",
      empRole: "Corporate Driver",
      empDuration: "5 years",
    },
    {
      email: "musa.driver@staffguru.com",
      fullName: "Musa Danjuma",
      phone: "+2348067778899",
      category: "Transport & Driving",
      skills: ["Defensive Driving", "Lagos Route Mastery", "Manual & Automatic"],
      experienceYears: 4,
      location: "Opebi, Ikeja, Lagos",
      locationState: "Lagos",
      locationArea: "Ikeja",
      expectedPay: 130000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "VERIFIED",
      status: "APPROVED" as const,
      openToErrands: true,
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Reliable, disciplined professional driver with clean record and valid Class-E commercial license.",
      empName: "Swift Fleet Logistics",
      empRole: "Fleet Driver",
      empDuration: "4 years",
    },

    // --- Cluster 3: Technology & Digital ---
    {
      email: "kemi.tech@staffguru.com",
      fullName: "Kemi Adeyemi",
      phone: "+2348074445566",
      category: "Technology & Digital Professionals",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Figma", "UI Design"],
      experienceYears: 4,
      location: "Admiralty Way, Lekki Phase 1, Lagos",
      locationState: "Lagos",
      locationArea: "Lekki Phase 1",
      expectedPay: 250000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "VERIFIED",
      status: "APPROVED" as const,
      openToErrands: false,
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Frontend engineer and interface designer passionate about high-fidelity user experiences and performant web apps.",
      empName: "DevSparkle Technologies",
      empRole: "Frontend Developer",
      empDuration: "3 years",
    },

    // --- Cluster 4: Alabaru Errand Runner / Domestic Services ---
    {
      email: "runner.worker@staffguru.com",
      fullName: "Ibrahim Musa",
      phone: "+2348056667788",
      category: "Cleaning & Domestic Services",
      skills: ["Deep Cleaning", "Errand Running", "Item Inspection", "Packaging & Delivery"],
      experienceYears: 3,
      location: "Herbert Macaulay Way, Yaba, Lagos",
      locationState: "Lagos",
      locationArea: "Yaba",
      expectedPay: 90000,
      availabilityStatus: "AVAILABLE_NOW" as const,
      ninVerificationStatus: "VERIFIED",
      status: "APPROVED" as const,
      openToErrands: true,
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
      aboutMe: "Active on-demand errand runner and property inspection runner. Fast, verified, and trustworthy.",
      empName: "CleanExpress Services",
      empRole: "Operations Specialist",
      empDuration: "2 years",
    }
  ];

  for (const worker of workersData) {
    let [user] = await db.select().from(schema.users).where(eq(schema.users.email, worker.email)).limit(1);
    if (!user) {
      [user] = await db.insert(schema.users).values({
        email: worker.email,
        passwordHash: PASSWORD_HASH,
        role: "WORKER",
      }).returning();
    }

    const profileData = {
      fullName: worker.fullName,
      phone: worker.phone,
      address: worker.location,
      jobType: worker.category,
      experience: String(worker.experienceYears),
      compensation: "Salary",
      amount: worker.expectedPay.toLocaleString(),
      accommodation: "No",
      openToErrands: worker.openToErrands,
      avatar: worker.avatar,
      aboutMe: worker.aboutMe,
      empName: worker.empName,
      empRole: worker.empRole,
      empDuration: worker.empDuration,
      g1Name: "Pastor Ezekiel Johnson",
      g1Phone: "+2348030001122",
      g1Occ: "Clergy",
      g1Address: "12 Lagos Street, Lagos",
      g2Name: "Alhaji Bello Garba",
      g2Phone: "+2348020003344",
      g2Occ: "Business Merchant",
      g2Address: "45 Broad Street, Lagos",
    };

    let [profile] = await db.select().from(schema.workerProfiles).where(eq(schema.workerProfiles.userId, user.id)).limit(1);
    if (!profile) {
      [profile] = await db.insert(schema.workerProfiles).values({
        userId: user.id,
        category: worker.category,
        skills: worker.skills,
        experienceYears: worker.experienceYears,
        location: worker.location,
        locationState: worker.locationState,
        locationArea: worker.locationArea,
        availabilityStatus: worker.availabilityStatus,
        availability: "Immediate / Full-time",
        expectedPay: worker.expectedPay,
        expectedPayKobo: worker.expectedPay * 100,
        status: worker.status,
        verificationStatus: "verified",
        ninVerificationStatus: worker.ninVerificationStatus,
        ninVerificationRef: "NIN-VERIFIED-OK",
        openToErrands: worker.openToErrands,
        errandPreferredStates: worker.openToErrands ? ["Lagos"] : [],
        errandPreferredAreas: worker.openToErrands ? [worker.locationArea] : [],
        profileData: profileData,
      }).returning();
    } else {
      await db.update(schema.workerProfiles).set({
        category: worker.category,
        skills: worker.skills,
        experienceYears: worker.experienceYears,
        location: worker.location,
        locationState: worker.locationState,
        locationArea: worker.locationArea,
        availabilityStatus: worker.availabilityStatus,
        availability: "Immediate / Full-time",
        expectedPay: worker.expectedPay,
        expectedPayKobo: worker.expectedPay * 100,
        status: worker.status,
        verificationStatus: "verified",
        ninVerificationStatus: worker.ninVerificationStatus,
        openToErrands: worker.openToErrands,
        profileData: profileData,
      }).where(eq(schema.workerProfiles.id, profile.id));
    }

    // If open to errands, ensure bank account on file exists
    if (worker.openToErrands) {
      const existingBank = await db.select().from(schema.workerBankAccounts).where(eq(schema.workerBankAccounts.workerProfileId, profile.id)).limit(1);
      if (existingBank.length === 0) {
        await db.insert(schema.workerBankAccounts).values({
          workerProfileId: profile.id,
          bankName: "Guaranty Trust Bank",
          bankCode: "058",
          accountNumberEncrypted: "mock-encrypted-account-number",
          accountNumberMasked: "******6789",
          accountName: worker.fullName,
          accountNumberTag: "mock-auth-tag-128bit",
          accountNumberIv: "mock-iv-96bit",
        });
      }
    }
  }

  console.log("✨ Seed completed successfully! All Smart Match test users and requests created.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
