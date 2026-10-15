import { NotificationHistoryView } from "@/components/notifications/NotificationHistoryView";

export const metadata = {
  title: "Notifications | Staff Guru Employer",
  description: "View and manage candidate handshakes, errands, and payment notifications.",
};

export default function EmployerNotificationsPage() {
  return <NotificationHistoryView role="EMPLOYER" />;
}
