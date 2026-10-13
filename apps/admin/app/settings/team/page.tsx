import { getAdminTeamData } from "@/lib/auth-actions";
import AdminTeamClient from "./AdminTeamClient";

export const metadata = {
  title: "Admin Team & Invite Access | Staff Guru",
  description: "Manage administrator seats, super admin founding slots, and team invite codes.",
};

export default async function AdminTeamPage() {
  const data = await getAdminTeamData();

  return <AdminTeamClient initialData={data} />;
}
