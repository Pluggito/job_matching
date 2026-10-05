import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["WORKER", "EMPLOYER"]),
});

export const HiringRequestSchema = z.object({
  category: z.string().min(2),
  title: z.string().min(5),
  description: z.string().min(20),
  requiredSkills: z.array(z.string()).min(1),
  preferredSkills: z.array(z.string()).default([]),
  minExperienceYears: z.number().int().min(0).default(0),
  locationState: z.string().min(2),
  locationArea: z.string().min(2),
  engagementType: z.enum(["ONSITE", "REMOTE"]),
  startDate: z.coerce.date(),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  workersNeeded: z.number().int().min(1).default(1),
}).refine(data => data.budgetMax >= data.budgetMin, {
  message: "Budget max must be greater than or equal to budget min",
  path: ["budgetMax"],
});
