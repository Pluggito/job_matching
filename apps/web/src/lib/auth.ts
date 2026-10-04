import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { Role, SessionPayload } from "@repo/shared";

const secretKey = process.env.JWT_SECRET || "default_secret_for_development";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(requestToken?: string) {
  // Mobile app might send a Bearer token, web will have cookie
  const token = requestToken || (await cookies()).get("session")?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const sessionData = { ...payload, expiresAt };
  const session = await encrypt(sessionData);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });

  return session; // return token so mobile clients can use it
}

export async function destroySession() {
  (await cookies()).delete("session");
}
