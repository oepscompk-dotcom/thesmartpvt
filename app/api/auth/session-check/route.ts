import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AUTH_KEYS = ["authUser", "auth", "company-auth", "dsm-auth", "dso-auth"];

export async function GET() {
  try {
    const sessions = await prisma.franchiseData.findMany({
      where: { id: { in: AUTH_KEYS } },
    });
    const authenticated = sessions.some((s) => {
      try {
        const data = JSON.parse(s.data);
        return data && (data.loggedIn === true || (data.email && data.role));
      } catch {
        return false;
      }
    });
    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
