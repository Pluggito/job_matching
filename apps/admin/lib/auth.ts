import { Role } from "@repo/shared";
import { getSession } from "./session";
export * from "./session";

export interface AdminSessionUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  adminRole: "SUPER_ADMIN" | "ADMIN";
  slotNumber?: number | null;
}

export async function getAdminUser(): Promise<AdminSessionUser> {
  const session = await getSession();
  const { db, users, adminProfiles, eq } = await import("@repo/db");

  if (session && session.role === "ADMIN") {
    const [profile] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullName: adminProfiles.fullName,
        adminRole: adminProfiles.adminRole,
        slotNumber: adminProfiles.slotNumber,
      })
      .from(users)
      .leftJoin(adminProfiles, eq(users.id, adminProfiles.userId))
      .where(eq(users.id, session.userId))
      .limit(1);

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        role: profile.role as Role,
        fullName: profile.fullName || profile.email.split("@")[0] || "Admin",
        adminRole: (profile.adminRole as "SUPER_ADMIN" | "ADMIN") || "ADMIN",
        slotNumber: profile.slotNumber,
      };
    }

    return {
      id: session.userId,
      email: session.email,
      role: session.role,
      fullName: session.email.split("@")[0] || "Admin",
      adminRole: "ADMIN",
      slotNumber: null,
    };
  }

  // Fallback for background jobs or seed verification: fetch primary system admin
  const [adminUser] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      fullName: adminProfiles.fullName,
      adminRole: adminProfiles.adminRole,
      slotNumber: adminProfiles.slotNumber,
    })
    .from(users)
    .leftJoin(adminProfiles, eq(users.id, adminProfiles.userId))
    .where(eq(users.role, "ADMIN"))
    .orderBy(users.createdAt)
    .limit(1);

  if (adminUser) {
    return {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role as Role,
      fullName: adminUser.fullName || "System Admin",
      adminRole: (adminUser.adminRole as "SUPER_ADMIN" | "ADMIN") || "SUPER_ADMIN",
      slotNumber: adminUser.slotNumber || 1,
    };
  }

  throw new Error("No admin account found in database.");
}

