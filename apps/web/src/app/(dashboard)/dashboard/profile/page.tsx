import { db, workerProfiles, users, eq } from "@repo/db";
import { getCurrentUser } from "../../../../actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import WorkerProfileClient from "./WorkerProfileClient";

export default async function WorkerProfilePage() {
  const session = await getCurrentUser();
  if (!session) return redirect("/login");

  const [profile] = await db
    .select({
      worker: workerProfiles,
      user: users,
    })
    .from(workerProfiles)
    .innerJoin(users, eq(users.id, workerProfiles.userId))
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-[var(--ink-soft)]">No profile found. Please complete onboarding.</p>
        <Link href="/onboarding" className="text-[var(--green)] hover:underline mt-4 inline-block font-medium">Go to Onboarding</Link>
      </div>
    );
  }

  return <WorkerProfileClient profile={profile} />;
}
