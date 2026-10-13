"use server";

import { db, users, adminProfiles, adminInvites, eq, and, sql, desc } from "@repo/db";
import { createSession, destroySession, getAdminUser } from "./auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export interface RegistrationStatus {
  totalAdmins: number;
  isOpenSuperAdminSlot: boolean;
  remainingSuperAdminSlots: number;
  nextSlotNumber: number;
  claimedSlots: {
    slotNumber: number;
    email: string;
    fullName: string;
    createdAt: string;
  }[];
}

/**
 * Returns the current admin team capacity and open Super Admin slot availability.
 * Rule: The first 3 registered accounts are Super Admins (no invite required).
 * Accounts 4+ strictly require an invite access code.
 */
export async function getAdminRegistrationStatus(): Promise<RegistrationStatus> {
  const adminUsers = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      fullName: adminProfiles.fullName,
      adminRole: adminProfiles.adminRole,
      slotNumber: adminProfiles.slotNumber,
    })
    .from(users)
    .leftJoin(adminProfiles, eq(users.id, adminProfiles.userId))
    .where(eq(users.role, "ADMIN"))
    .orderBy(users.createdAt);

  const totalAdmins = adminUsers.length;
  const remainingSuperAdminSlots = Math.max(0, 3 - totalAdmins);
  const isOpenSuperAdminSlot = totalAdmins < 3;
  const nextSlotNumber = totalAdmins + 1;

  const claimedSlots = adminUsers.slice(0, 3).map((u, idx) => ({
    slotNumber: u.slotNumber || idx + 1,
    email: u.email,
    fullName: u.fullName || u.email.split("@")[0] || "Super Admin",
    createdAt: u.createdAt.toISOString(),
  }));

  return {
    totalAdmins,
    isOpenSuperAdminSlot,
    remainingSuperAdminSlots,
    nextSlotNumber,
    claimedSlots,
  };
}

/**
 * Admin Sign-in action using Email + Password.
 */
export async function loginAdminAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.email, email), eq(users.role, "ADMIN")))
    .limit(1);

  if (!user) {
    return { success: false, error: "Invalid admin email or password." };
  }

  // Verify password with bcrypt + allow seed fallback for testing
  const isSeedAdmin = password === "AdminPassword123!" && user.email === "admin@staffguru.com";
  let isValid = false;

  try {
    isValid = isSeedAdmin || (await bcrypt.compare(password, user.passwordHash));
  } catch (err) {
    console.error("[Admin Login Auth Error]:", err);
  }

  if (!isValid) {
    return { success: false, error: "Invalid admin email or password." };
  }

  // Fetch admin profile
  const [profile] = await db
    .select({
      fullName: adminProfiles.fullName,
      adminRole: adminProfiles.adminRole,
    })
    .from(adminProfiles)
    .where(eq(adminProfiles.userId, user.id))
    .limit(1);

  await createSession({
    userId: user.id,
    email: user.email,
    role: "ADMIN",
  });

  return {
    success: true,
    fullName: profile?.fullName || user.email.split("@")[0],
    adminRole: profile?.adminRole || "ADMIN",
  };
}

/**
 * Admin Registration action.
 * - Slots 1, 2, and 3: Granted SUPER_ADMIN directly without invite code.
 * - Slots 4+: Requires an active, unexpired invite access code.
 */
export async function registerAdminAction(prevState: any, formData: FormData) {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const rawInviteCode = (formData.get("inviteCode") as string)?.trim().toUpperCase();

  if (!fullName || fullName.length < 2) {
    return { success: false, error: "Please enter your full official name." };
  }

  if (!email || !email.includes("@") || !email.includes(".")) {
    return { success: false, error: "Please enter a valid official email address." };
  }

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters in length." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  // Check if email already registered
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return { success: false, error: "An account with this email address already exists." };
  }

  // Check current admin count
  const status = await getAdminRegistrationStatus();
  const now = new Date();

  // CASE 1: Open Super Admin Registration (First 3 slots)
  if (status.isOpenSuperAdminSlot) {
    const passwordHash = await bcrypt.hash(password, 10);
    const assignedSlot = status.nextSlotNumber;

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "ADMIN",
      })
      .returning();

    if (!newUser) {
      return { success: false, error: "Failed to create administrator account." };
    }

    await db.insert(adminProfiles).values({
      userId: newUser.id,
      fullName,
      adminRole: "SUPER_ADMIN",
      slotNumber: assignedSlot,
    });

    await createSession({
      userId: newUser.id,
      email: newUser.email,
      role: "ADMIN",
    });

    return {
      success: true,
      isSuperAdmin: true,
      slotNumber: assignedSlot,
      message: `Welcome! You have claimed Super Admin Slot #${assignedSlot} of 3.`,
    };
  }

  // CASE 2: Invite-Only Registration (Slot 4+)
  if (!rawInviteCode) {
    return {
      success: false,
      error: "All 3 initial Super Admin slots have been claimed. A valid invite code is required to register.",
    };
  }

  const [invite] = await db
    .select()
    .from(adminInvites)
    .where(and(eq(adminInvites.code, rawInviteCode), eq(adminInvites.isUsed, false)))
    .limit(1);

  if (!invite) {
    return {
      success: false,
      error: "Invalid invite code. Please contact a Super Admin for an active invite.",
    };
  }

  if (new Date(invite.expiresAt) < now) {
    return {
      success: false,
      error: "This invite code has expired. Please request a new invite from a Super Admin.",
    };
  }

  if (invite.email && invite.email.toLowerCase() !== email) {
    return {
      success: false,
      error: `This invite code was specifically issued for ${invite.email}. Please register with that email.`,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "ADMIN",
    })
    .returning();

  if (!newUser) {
    return { success: false, error: "Failed to create administrator account." };
  }

  await db.insert(adminProfiles).values({
    userId: newUser.id,
    fullName,
    adminRole: invite.role, // 'ADMIN' or 'SUPER_ADMIN'
    invitedBy: invite.createdById,
  });

  // Mark invite as redeemed
  await db
    .update(adminInvites)
    .set({
      isUsed: true,
      usedById: newUser.id,
      usedAt: now,
    })
    .where(eq(adminInvites.id, invite.id));

  await createSession({
    userId: newUser.id,
    email: newUser.email,
    role: "ADMIN",
  });

  return {
    success: true,
    isSuperAdmin: invite.role === "SUPER_ADMIN",
    message: "Welcome to the Staff Guru administrative team!",
  };
}

/**
 * Logout action for Admin.
 */
export async function logoutAdminAction() {
  await destroySession();
  return { success: true };
}

/**
 * Generates an authorized invite code for new admins.
 * Restricted to authenticated Super Admins.
 */
export async function generateAdminInviteAction(data: {
  role?: "ADMIN" | "SUPER_ADMIN";
  email?: string;
}) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin || currentAdmin.adminRole !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Only Super Admins are authorized to generate team invite codes.",
    };
  }

  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  const code = `SG-INV-${hex}-${digits}`;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [newInvite] = await db
    .insert(adminInvites)
    .values({
      code,
      email: data.email?.trim().toLowerCase() || null,
      role: data.role || "ADMIN",
      createdById: currentAdmin.id,
      expiresAt,
    })
    .returning();

  if (!newInvite) {
    return {
      success: false,
      error: "Failed to generate invite record.",
    };
  }

  revalidatePath("/settings/team");
  return {
    success: true,
    invite: {
      id: newInvite.id,
      code: newInvite.code,
      role: newInvite.role,
      email: newInvite.email,
      expiresAt: newInvite.expiresAt.toISOString(),
    },
  };
}

/**
 * Revokes a pending invite code.
 */
export async function revokeAdminInviteAction(inviteId: string) {
  const currentAdmin = await getAdminUser();
  if (!currentAdmin || currentAdmin.adminRole !== "SUPER_ADMIN") {
    return { success: false, error: "Unauthorized." };
  }

  await db.delete(adminInvites).where(eq(adminInvites.id, inviteId));
  revalidatePath("/settings/team");
  return { success: true };
}

/**
 * Fetches all admin team members and invite codes for the team management view.
 */
export async function getAdminTeamData() {
  const currentAdmin = await getAdminUser();

  const members = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      fullName: adminProfiles.fullName,
      adminRole: adminProfiles.adminRole,
      slotNumber: adminProfiles.slotNumber,
    })
    .from(users)
    .leftJoin(adminProfiles, eq(users.id, adminProfiles.userId))
    .where(eq(users.role, "ADMIN"))
    .orderBy(users.createdAt);

  const invites = await db
    .select({
      id: adminInvites.id,
      code: adminInvites.code,
      email: adminInvites.email,
      role: adminInvites.role,
      isUsed: adminInvites.isUsed,
      usedAt: adminInvites.usedAt,
      expiresAt: adminInvites.expiresAt,
      createdAt: adminInvites.createdAt,
      createdById: adminInvites.createdById,
    })
    .from(adminInvites)
    .orderBy(desc(adminInvites.createdAt));

  return {
    currentAdmin,
    members: members.map((m) => ({
      id: m.id,
      email: m.email,
      fullName: m.fullName || m.email.split("@")[0] || "Administrator",
      adminRole: m.adminRole || "ADMIN",
      slotNumber: m.slotNumber,
      createdAt: m.createdAt.toISOString(),
    })),
    invites: invites.map((inv) => ({
      id: inv.id,
      code: inv.code,
      email: inv.email,
      role: inv.role,
      isUsed: inv.isUsed,
      usedAt: inv.usedAt ? inv.usedAt.toISOString() : null,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      isExpired: new Date(inv.expiresAt) < new Date(),
    })),
  };
}
