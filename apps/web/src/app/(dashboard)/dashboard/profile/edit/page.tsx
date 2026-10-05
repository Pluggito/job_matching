import { db, workerProfiles, eq } from "@repo/db";
import { getCurrentUser } from "../../../../../actions/auth";
import { redirect } from "next/navigation";
import WorkerEditForm from "./WorkerEditForm"

export default async function EditWorkerProfilePage() {
  const session = await getCurrentUser();
  if (!session) return redirect("/login");

  const [profile] = await db
    .select()
    .from(workerProfiles)
    .where(eq(workerProfiles.userId, session.userId))
    .limit(1);

  if (!profile) {
    return redirect("/onboarding");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Edit Profile</h1>
        <p className="text-[var(--ink-soft)] mt-1">Update your personal and professional details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden p-8">
        <WorkerEditForm profile={profile} />
      </div>
    </div>
  );
}
