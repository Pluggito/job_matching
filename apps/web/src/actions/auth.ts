"use server";

import { db, users, eq } from "@repo/db";
import { createSession, destroySession, getSession } from "../lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role } from "@repo/shared";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { error: "Invalid credentials" };
  }

  // NOTE: since our seed used "dummy-hash", we will allow "password" as a fallback for seeded users for testing,
  // but normally we use bcrypt.
  const isSeedUser = user.passwordHash === "dummy-hash" && password === "password";
  const isValid = isSeedUser || await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as Role,
  });

  if (user.role === "ADMIN") {
    redirect("/admin/workers");
  } else if (user.role === "EMPLOYER") {
    redirect(`/employer`);
  } else {
    redirect(`/dashboard`);
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string; // 'WORKER' or 'EMPLOYER'

  if (!email || !password || !role) {
    return { error: "All fields are required" };
  }

  if (role !== "WORKER" && role !== "EMPLOYER") {
    return { error: "Invalid role" };
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return { error: "Email is already registered" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    role: role as "WORKER" | "EMPLOYER" | "ADMIN",
  }).returning();

  if (!newUser) {
    return { error: "Failed to create user" };
  }

  await createSession({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role as Role,
  });

  redirect("/onboarding");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();
  return session;
}
