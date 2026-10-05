import { redirect } from "next/navigation";
import { getCurrentUser } from "../../actions/auth";
import ClientLayout from "./ClientLayout";
import { Role } from "@repo/shared";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  return (
    <ClientLayout role={session.role as Role} userEmail={session.email}>
      {children}
    </ClientLayout>
  );
}
