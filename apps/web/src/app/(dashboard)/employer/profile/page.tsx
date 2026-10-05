import { getCurrentUser } from "../../../../actions/auth";
import { db, employerProfiles, eq, users } from "@repo/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import EmployerProfileClient from "./EmployerProfileClient";

export default async function EmployerProfilePage() {
  const session = await getCurrentUser();
  if (!session) return redirect("/login");

  const [profile] = await db
    .select({
      employer: employerProfiles,
      user: users,
    })
    .from(employerProfiles)
    .innerJoin(users, eq(users.id, employerProfiles.userId))
    .where(eq(employerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-[var(--ink-soft)]">No profile found. Please complete onboarding.</p>
        <Link href="/onboarding" className="text-[var(--green)] hover:underline mt-4 inline-block font-medium">Go to Onboarding</Link>
      </div>
    );
  }

  return <EmployerProfileClient profile={profile} />;
}
