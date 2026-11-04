"use server";

import { db, users, eq, workerProfiles, employerProfiles, emailVerifications } from "@repo/db";
import { createSession, destroySession, getSession } from "../lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role } from "@repo/shared";
import { generateOtp, sendVerificationOtpEmail } from "../lib/email";

export async function login(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { error: "Invalid credentials" };
  }

  // NOTE: since our seed used "dummy-hash", we will allow "password" as a fallback for seeded users for testing,
  // but normally we use bcrypt.
  const isSeedUser = user.passwordHash === "dummy-hash" && password === "password";
  const isValid = isSeedUser || await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  // If email is not yet verified, issue fresh OTP and redirect to verification page
  if (!user.emailVerified) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.delete(emailVerifications).where(eq(emailVerifications.userId, user.id));
    await db.insert(emailVerifications).values({
      userId: user.id,
      email: user.email,
      code: otp,
      expiresAt,
      attempts: 0,
    });

    await sendVerificationOtpEmail({ to: user.email, otp, role: user.role });
    redirect(`/verify-email?email=${encodeURIComponent(user.email)}&notice=unverified`);
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
  });

  if (user.role === "ADMIN") {
    redirect("/admin/workers");
  } else if (user.role === "EMPLOYER") {
    redirect(`/employer`);
  } else {
    redirect(`/dashboard`);
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string; // 'WORKER' or 'EMPLOYER'

  if (!email || !password || !role) {
    return { error: "All fields are required" };
  }

  if (role !== "WORKER" && role !== "EMPLOYER") {
    return { error: "Invalid role" };
  }

  const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const existingUser = existingUsers[0];
  if (existingUser) {
    // If the account exists but has never been verified, re-send OTP and guide them to verification
    if (!existingUser.emailVerified) {
      const otp = generateOtp();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.delete(emailVerifications).where(eq(emailVerifications.userId, existingUser.id));
      await db.insert(emailVerifications).values({
        userId: existingUser.id,
        email: existingUser.email,
        code: otp,
        expiresAt,
        attempts: 0,
      });

      await sendVerificationOtpEmail({ to: existingUser.email, otp, role: existingUser.role });
      redirect(`/verify-email?email=${encodeURIComponent(existingUser.email)}`);
    }

    return { error: "Email is already registered" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    role: role as "WORKER" | "EMPLOYER" | "ADMIN",
    emailVerified: false,
  }).returning();

  if (!newUser) {
    return { error: "Failed to create user" };
  }

  // Create partial profile with the fields collected during signup
  if (role === "EMPLOYER") {
    const employerType = formData.get("employerType") as string;
    await db.insert(employerProfiles).values({
      userId: newUser.id,
      businessType: employerType || "INDIVIDUAL",
      businessName: "Pending", // to be filled in onboarding
      location: "Pending", // to be filled in onboarding
      hiringNeeds: "Pending", // to be filled in onboarding
      profileData: {}
    });
  } else if (role === "WORKER") {
    const openToErrands = formData.get("openToErrands") === "true";
    await db.insert(workerProfiles).values({
      userId: newUser.id,
      category: "Pending", // to be filled in onboarding
      skills: [], // to be filled in onboarding
      experienceYears: 0, // to be filled in onboarding
      location: "Pending", // to be filled in onboarding
      availability: "Immediate", // to be filled in onboarding
      expectedPay: 0, // to be filled in onboarding
      ninVerificationStatus: "PENDING",
      openToErrands: openToErrands,
      profileData: {}
    });
  }

  // Generate 6-digit OTP code (expires in 15 minutes)
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(emailVerifications).values({
    userId: newUser.id,
    email: newUser.email,
    code: otp,
    expiresAt,
    attempts: 0,
  });

  // Dispatch OTP email via Resend
  await sendVerificationOtpEmail({
    to: newUser.email,
    otp,
    role: newUser.role,
  });

  // Redirect user to the verification page
  redirect(`/verify-email?email=${encodeURIComponent(newUser.email)}`);
}

/**
 * Server action to verify the 6-digit OTP submitted by the user.
 */
export async function verifyEmailOtp(email: string, otp: string) {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanOtp = otp?.trim();

  if (!cleanEmail || !cleanOtp) {
    return { error: "Email and verification code are required" };
  }

  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return { error: "Please enter a valid 6-digit verification code" };
  }

  // Find verification record
  const [record] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.email, cleanEmail))
    .limit(1);

  if (!record) {
    return { error: "No pending verification found. Please request a new code." };
  }

  // Check expiration
  if (new Date() > new Date(record.expiresAt)) {
    return { error: "Your verification code has expired. Please request a new one." };
  }

  // Check attempt limit
  if (record.attempts >= 5) {
    return { error: "Too many failed attempts. Please request a new code." };
  }

  // Check code match
  if (record.code !== cleanOtp) {
    await db
      .update(emailVerifications)
      .set({ attempts: record.attempts + 1 })
      .where(eq(emailVerifications.id, record.id));

    const remaining = 5 - (record.attempts + 1);
    return {
      error: remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
        : "Incorrect code. Maximum attempts reached. Please request a new code.",
    };
  }

  // SUCCESS: Mark user as verified
  const [updatedUser] = await db
    .update(users)
    .set({
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, record.userId))
    .returning();

  // Clean up verification records for this user
  await db.delete(emailVerifications).where(eq(emailVerifications.userId, record.userId));

  if (!updatedUser) {
    return { error: "Failed to update user verification status" };
  }

  // Create authenticated session
  await createSession({
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role as Role,
  });

  return { success: true, redirectUrl: "/onboarding" };
}

/**
 * Server action to resend a new 6-digit OTP code to the user.
 */
export async function resendVerificationOtp(email: string) {
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail) {
    return { error: "Email address is required" };
  }

  const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

  if (!user) {
    return { error: "Account not found" };
  }

  if (user.emailVerified) {
    return { error: "This email is already verified. Please log in." };
  }

  // Check rate limit: if last verification record was created less than 45 seconds ago
  const [existingRecord] = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.userId, user.id))
    .limit(1);

  if (existingRecord) {
    const elapsedMs = Date.now() - new Date(existingRecord.createdAt).getTime();
    const cooldownMs = 45 * 1000;
    if (elapsedMs < cooldownMs) {
      const waitSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
      return { error: `Please wait ${waitSec}s before requesting another code.` };
    }
    // Delete previous verification record
    await db.delete(emailVerifications).where(eq(emailVerifications.userId, user.id));
  }

  // Generate new OTP
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(emailVerifications).values({
    userId: user.id,
    email: user.email,
    code: otp,
    expiresAt,
    attempts: 0,
  });

  // Send via Resend
  await sendVerificationOtpEmail({
    to: user.email,
    otp,
    role: user.role,
  });

  return { success: true, message: "A new 6-digit code has been sent to your email." };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();
  return session;
}
