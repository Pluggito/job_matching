import { getAdminUser } from "@/lib/auth";
import { getAdminThreadsAction } from "@/lib/actions";
import MessagesInboxView from "./MessagesInboxView";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const admin = await getAdminUser();
  const res = await getAdminThreadsAction();

  return (
    <MessagesInboxView
      initialThreads={res.threads || []}
      adminUserId={admin.id}
    />
  );
}

