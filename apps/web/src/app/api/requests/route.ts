import { db, eq, employerProfiles } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { createHiringRequest } from "../../../server/services/hiringRequests";
import { getCurrentUser } from "../../../actions/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, session.userId)).limit(1);
    if (!profile) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 403 });
    }

    const data = await req.json();

    const request = await createHiringRequest(profile.id, data);
    
    return NextResponse.json(request);
  } catch (error: any) {
    console.error("Failed to create hiring request", error);
    return NextResponse.json({ error: error.message || "Failed to create request" }, { status: 400 });
  }
}
