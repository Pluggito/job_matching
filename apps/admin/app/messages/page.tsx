import {
  db,
  threads,
  messages,
  users,
  employerProfiles,
  eq,
  desc,
  asc,
} from "@repo/db";
import { getAdminUser } from "@/lib/auth";
import MessagesInboxView, { ThreadItem, MessageItem } from "./MessagesInboxView";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const admin = await getAdminUser();

  // Query threads
  const threadRows = await db
    .select({
      id: threads.id,
      employerId: threads.employerId,
      employerEmail: users.email,
      businessName: employerProfiles.businessName,
    })
    .from(threads)
    .innerJoin(users, eq(threads.employerId, users.id))
    .leftJoin(employerProfiles, eq(users.id, employerProfiles.userId));

  // Query all messages
  const allMessages = await db
    .select({
      id: messages.id,
      threadId: messages.threadId,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .orderBy(asc(messages.createdAt));

  // Group messages by threadId
  const msgsByThread = new Map<string, MessageItem[]>();
  for (const m of allMessages) {
    const list = msgsByThread.get(m.threadId) || [];
    list.push({
      id: m.id,
      senderId: m.senderId,
      senderEmail: m.senderId === admin.id ? admin.email : "Employer",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    });
    msgsByThread.set(m.threadId, list);
  }

  const formattedThreads: ThreadItem[] = threadRows.map((t) => {
    const threadMsgs = msgsByThread.get(t.id) || [];
    const lastMsg = threadMsgs[threadMsgs.length - 1];
    return {
      id: t.id,
      employerId: t.employerId,
      employerEmail: t.employerEmail,
      businessName: t.businessName || (t.employerEmail.split("@")[0] ?? "Employer"),
      lastMessageSnippet: lastMsg ? lastMsg.content : "No messages yet",
      lastMessageAt: lastMsg ? lastMsg.createdAt : "",
      messages: threadMsgs,
    };
  });

  return (
    <MessagesInboxView
      initialThreads={formattedThreads}
      adminUserId={admin.id}
    />
  );
}
