import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getEmployerSupportConversation } from "@/actions/employerMessages";
import EmployerMessagesClient from "./EmployerMessagesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Complaints & Support Desk | Staff Guru",
  description: "Direct and confidential complaints and support channel with Staff Guru management.",
};

export default async function EmployerMessagesPage() {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return redirect("/login");
  }

  const conversationRes = await getEmployerSupportConversation();
  const initialMessages = conversationRes.success && conversationRes.data
    ? conversationRes.data.messages
    : [];

  return (
    <EmployerMessagesClient
      initialMessages={initialMessages}
      currentUserId={session.userId}
    />
  );
}
