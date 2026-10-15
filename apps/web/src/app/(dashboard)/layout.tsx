import { redirect } from "next/navigation";
import { getCurrentUser } from "../../actions/auth";
import ClientLayout from "./ClientLayout";
import { Role } from "@repo/shared";
import { db, workerProfiles, employerProfiles, eq } from "@repo/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  let avatarUrl: string | null = null;
  try {
    if (session.role === "WORKER") {
      const [w] = await db
        .select({ profileData: workerProfiles.profileData })
        .from(workerProfiles)
        .where(eq(workerProfiles.userId, session.userId))
        .limit(1);
      avatarUrl = (w?.profileData as any)?.avatar || null;
    } else if (session.role === "EMPLOYER") {
      const [e] = await db
        .select({ profileData: employerProfiles.profileData })
        .from(employerProfiles)
        .where(eq(employerProfiles.userId, session.userId))
        .limit(1);
      avatarUrl = (e?.profileData as any)?.logo || (e?.profileData as any)?.avatar || null;
    }
  } catch (err) {
    console.error("Failed to fetch user avatar in DashboardLayout:", err);
  }

  return (
    <ClientLayout role={session.role as Role} userEmail={session.email} avatarUrl={avatarUrl}>
      {children}
    </ClientLayout>
  );
}
