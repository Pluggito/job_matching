"use server";

import {
  db,
  threads,
  messages,
  users,
  employerProfiles,
  adminProfiles,
  notifications,
  eq,
  asc,
} from "@repo/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export interface SupportMessageItem {
  id: string;
  senderId: string;
  senderRole: "EMPLOYER" | "ADMIN";
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SupportConversationData {
  threadId: string;
  employerId: string;
  adminId: string;
  messages: SupportMessageItem[];
}

/**
 * Gets or creates the direct support / complaint thread between the logged-in Employer and Staff Guru Admin.
 */
export async function getEmployerSupportConversation(): Promise<{
  success: boolean;
  data?: SupportConversationData;
  error?: string;
}> {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized. Employer login required." };
  }

  try {
    // 1. Look for existing thread
    let [thread] = await db
      .select({
        id: threads.id,
        employerId: threads.employerId,
        adminId: threads.adminId,
      })
      .from(threads)
      .where(eq(threads.employerId, session.userId))
      .limit(1);

    // 2. If no thread exists yet, find primary admin and initialize thread
    if (!thread) {
      const [adminUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "ADMIN"))
        .orderBy(users.createdAt)
        .limit(1);

      if (!adminUser) {
        return {
          success: false,
          error: "Staff Guru support desk is currently initializing. Please try again shortly.",
        };
      }

      const [newThread] = await db
        .insert(threads)
        .values({
          employerId: session.userId,
          adminId: adminUser.id,
        })
        .returning();

      if (!newThread) {
        return { success: false, error: "Failed to initialize support conversation." };
      }

      thread = newThread;
    }

    // 3. Fetch all messages in this thread
    const rawMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.threadId, thread.id))
      .orderBy(asc(messages.createdAt));

    const formattedMessages: SupportMessageItem[] = rawMessages.map((m) => {
      const isMe = m.senderId === session.userId;
      return {
        id: m.id,
        senderId: m.senderId,
        senderRole: isMe ? "EMPLOYER" : "ADMIN",
        senderName: isMe ? "You" : "Staff Guru Admin",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      };
    });

    return {
      success: true,
      data: {
        threadId: thread.id,
        employerId: thread.employerId,
        adminId: thread.adminId,
        messages: formattedMessages,
      },
    };
  } catch (err: any) {
    console.error("[getEmployerSupportConversation] Error:", err);
    return { success: false, error: err?.message || "Failed to load support messages." };
  }
}

/**
 * Sends a complaint or message from the Employer to Staff Guru Admin.
 */
export async function sendEmployerSupportMessage(content: string): Promise<{
  success: boolean;
  message?: SupportMessageItem;
  error?: string;
}> {
  const session = await getCurrentUser();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized. Employer login required." };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, error: "Message content cannot be empty." };
  }

  try {
    // 1. Get or create thread
    const convResult = await getEmployerSupportConversation();
    if (!convResult.success || !convResult.data) {
      return { success: false, error: convResult.error || "Unable to access support thread." };
    }

    const { threadId, adminId } = convResult.data;

    // 2. Insert message
    const [newMsg] = await db
      .insert(messages)
      .values({
        threadId,
        senderId: session.userId,
        content: trimmed,
      })
      .returning();

    if (!newMsg) {
      return { success: false, error: "Failed to deliver message." };
    }

    // 3. Notify Admin
    const [empProfile] = await db
      .select({ businessName: employerProfiles.businessName })
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, session.userId))
      .limit(1);

    const employerName = empProfile?.businessName || session.email.split("@")[0] || "Employer";

    await createNotification({
      userId: adminId,
      type: "EMPLOYER_COMPLAINT",
      title: "New Employer Complaint / Inquiry",
      content: `${employerName}: "${trimmed.slice(0, 100)}${trimmed.length > 100 ? "..." : ""}"`,
      link: "/messages",
    }).catch((err) => console.warn("[sendEmployerSupportMessage] Notification failed:", err));

    revalidatePath("/employer/messages");

    return {
      success: true,
      message: {
        id: newMsg.id,
        senderId: session.userId,
        senderRole: "EMPLOYER",
        senderName: "You",
        content: newMsg.content,
        createdAt: newMsg.createdAt.toISOString(),
      },
    };
  } catch (err: any) {
    console.error("[sendEmployerSupportMessage] Error:", err);
    return { success: false, error: err?.message || "Failed to send message." };
  }
}
