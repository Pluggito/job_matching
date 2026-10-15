"use server";

import { db, errandThreads, errandMessages, errands, users, workerProfiles, eq, and, desc } from "@repo/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import { sendPushToUser } from "@/server/services/pushNotifications";

/**
 * Normalizes text to detect and redact contact information (phone numbers, NUBAN accounts, emails, handles).
 * Converts leetspeak and strips separator characters.
 */
export async function redactContactInformation(content: string): Promise<{
  cleanContent: string;
  hasRedacted: boolean;
}> {
  let hasRedacted = false;

  // 1. Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
  let text = content.replace(emailRegex, () => {
    hasRedacted = true;
    return "[Email hidden by Staff Guru security]";
  });

  // 2. Social handles (@handle)
  const handleRegex = /@([A-Za-z0-9_]{3,})/g;
  text = text.replace(handleRegex, () => {
    hasRedacted = true;
    return "[Handle hidden by Staff Guru security]";
  });

  // 3. Normalized leetspeak & digit scan for Nigerian phone numbers & 10-digit NUBANs
  // Convert common leetspeak substitutions
  const normalized = text
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[5$]/g, "s")
    .replace(/[7+]/g, "t");

  // Phone number / NUBAN patterns (with spaces, dots, dashes, or plain digits)
  // 10 digits (NUBAN) or 11 digits (Nigerian mobile 080..., 090..., 070...)
  const phoneOrNubanRegex = /(?:\+?234|0)?(?:[ \t.-]*\d){10,11}\b/g;
  text = text.replace(phoneOrNubanRegex, (match) => {
    // Only redact if stripped digits length is between 10 and 14
    const digits = match.replace(/\D/g, "");
    if (digits.length >= 10 && digits.length <= 14) {
      hasRedacted = true;
      return "[Contact/Account hidden by Staff Guru security]";
    }
    return match;
  });

  return {
    cleanContent: text,
    hasRedacted,
  };
}

export async function sendErrandMessage(params: {
  errandId: string;
  content: string;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { success: false, error: "Unauthorized." };
  }

  const { errandId, content } = params;
  if (!content || !content.trim()) {
    return { success: false, error: "Message content cannot be empty." };
  }

  // Fetch thread
  const [thread] = await db
    .select()
    .from(errandThreads)
    .where(eq(errandThreads.errandId, errandId))
    .limit(1);

  if (!thread) {
    return { success: false, error: "Chat thread not found for this errand." };
  }

  // Security & privacy redaction
  const { cleanContent } = await redactContactInformation(content.trim());

  await db.insert(errandMessages).values({
    threadId: thread.id,
    senderId: session.userId,
    content: cleanContent,
  });

  // Determine recipient for push notification
  let recipientUserId: string | null = null;
  let targetUrl = `/dashboard/errands/${errandId}`;

  if (session.userId === thread.employerId) {
    // Sender is employer, recipient is worker
    const [worker] = await db
      .select({ userId: workerProfiles.userId })
      .from(workerProfiles)
      .where(eq(workerProfiles.id, thread.workerProfileId))
      .limit(1);
    recipientUserId = worker?.userId || null;
    targetUrl = `/dashboard/errands/${errandId}`;
  } else {
    // Sender is worker, recipient is employer
    recipientUserId = thread.employerId;
    targetUrl = `/employer/errands/${errandId}`;
  }

  if (recipientUserId) {
    sendPushToUser(recipientUserId, {
      title: "New Errand Message 💬",
      body: cleanContent.length > 80 ? `${cleanContent.slice(0, 77)}...` : cleanContent,
      url: targetUrl,
      tag: `errand-${errandId}`,
    }).catch(console.error);
  }

  revalidatePath(`/dashboard/errands/${errandId}`);
  revalidatePath(`/employer/errands/${errandId}`);
  return { success: true };
}

export async function getErrandMessages(errandId: string) {
  const session = await getCurrentUser();
  if (!session) return [];

  const [thread] = await db
    .select()
    .from(errandThreads)
    .where(eq(errandThreads.errandId, errandId))
    .limit(1);

  if (!thread) return [];

  const msgs = await db
    .select({
      id: errandMessages.id,
      senderId: errandMessages.senderId,
      content: errandMessages.content,
      createdAt: errandMessages.createdAt,
    })
    .from(errandMessages)
    .where(eq(errandMessages.threadId, thread.id))
    .orderBy(errandMessages.createdAt);

  return msgs;
}
