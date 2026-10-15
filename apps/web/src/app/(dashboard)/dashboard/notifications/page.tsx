import { NotificationHistoryView } from "@/components/notifications/NotificationHistoryView";

export const metadata = {
  title: "Notifications | Staff Guru",
  description: "View and manage your real-time notifications and alerts on Staff Guru.",
};

export default function WorkerNotificationsPage() {
  return <NotificationHistoryView role="WORKER" />;
}
