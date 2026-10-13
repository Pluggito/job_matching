import { getAdminRegistrationStatus } from "@/lib/auth-actions";
import AdminAuthClient from "./AdminAuthClient";

export const metadata = {
  title: "Admin Portal Authentication | Staff Guru",
  description: "Secure administrative sign-in and super administrator onboarding.",
};

export default async function AdminLoginPage() {
  const registrationStatus = await getAdminRegistrationStatus();

  return <AdminAuthClient initialStatus={registrationStatus} />;
}
