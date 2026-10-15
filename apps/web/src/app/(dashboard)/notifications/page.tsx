import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export default async function NotificationsRedirectPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "EMPLOYER") {
    redirect("/employer/notifications");
  } else {
    redirect("/dashboard/notifications");
  }
}
