export type Role = "WORKER" | "EMPLOYER" | "ADMIN";

export type WorkerStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SessionPayload {
  userId: string;
  role: Role;
  email: string;
  expiresAt: string;
}
